// @magiczerowxy/dsh-ocgo-usage — Host half (ESM).
// 零顶层导入版本：不 import 任何 node: 模块（node:fs/os/path 的默认导入曾导致
// Desktop 内置 dsh 的 Loader 加载后 apply 不生效）。密钥通过 dsh 的
// credentials 服务持久化（~/.dsh/.credentials.yaml），与 web 端口/浏览器
// 存储无关，重启不丢失。
//
// Registers:
//   GET  /api/dsh-ocgo-usage/usage   — OpenCode Go 配额查询（curl 官方接口）
//   GET  /api/dsh-ocgo-usage/key     — 已配置状态探测（不回传密钥值）
//   POST /api/dsh-ocgo-usage/key     — 保存 API Key（credentials.set）
//   POST /api/dsh-ocgo-usage/key/clear — 清除已保存的 API Key

export const name = "ocgo-usage";

export const inject = ["webServer", "credentials", "subprocess"];

const USAGE_PATH = "/api/dsh-ocgo-usage/usage";
const KEY_PATH = "/api/dsh-ocgo-usage/key";
const KEY_CLEAR_PATH = "/api/dsh-ocgo-usage/key/clear";
const CRED_REF = "OPENCODE_API_KEY";

function writeJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function isLoopbackRequest(req) {
  const addr = req.socket && req.socket.remoteAddress;
  return addr === "127.0.0.1" || addr === "::1" || addr === "::ffff:127.0.0.1";
}

// 不使用 Buffer 全局：chunks 直接以字符串累加。
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(String(c)));
    req.on("end", () => {
      try {
        const text = chunks.join("");
        resolve(text === "" ? {} : JSON.parse(text));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

// 解析请求用 key：请求头 > 凭据服务（env / ~/.dsh/.credentials.yaml）
async function resolveKey(ctx, req) {
  const override = req.headers && typeof req.headers["x-dsh-api-key"] === "string"
    ? req.headers["x-dsh-api-key"].trim()
    : "";
  if (override !== "") return { key: override, source: "header" };
  const resolved = await ctx.credentials.resolve(CRED_REF);
  if (resolved !== undefined && resolved.value !== "") {
    return { key: resolved.value, source: resolved.source || "credentials" };
  }
  return { key: "", source: "none" };
}

/** 规范化一组配额数据：{ percent, resetsAt, status }，无法识别返回 null */
function normGroup(g) {
  if (g === null || typeof g !== "object") return null;
  const percent = typeof g.percent === "number" ? g.percent : null;
  const resetsAt = typeof g.resetsAt === "string" ? g.resetsAt : null;
  const status = typeof g.status === "string" ? g.status : null;
  if (percent === null && resetsAt === null && status === null) return null;
  return { percent, resetsAt, status };
}

export function apply(ctx) {
  const usageRoute = {
    kind: "exact",
    path: USAGE_PATH,
    handler: async (req, res) => {
      if ((req.method ?? "GET") !== "GET") {
        writeJson(res, 405, { error: "method not allowed" });
        return;
      }
      if (!isLoopbackRequest(req)) {
        writeJson(res, 403, { error: "forbidden: loopback-only" });
        return;
      }
      try {
        const { key } = await resolveKey(ctx, req);
        if (key === "") {
          writeJson(res, 200, { ok: false, error: "NO_KEY" });
          return;
        }
        const handle = ctx.subprocess.spawn({
          argv: [
            "curl.exe", "-sS", "--max-time", "15",
            "-H", "Authorization: Bearer " + key,
            "https://opencode.ai/zen/go/v1/usage",
          ],
          cwd: process.cwd(),
          stdio: {
            stdin: "ignore",
            stdout: { maxBytes: 16384 },
            stderr: { maxBytes: 4096 },
          },
          graceMs: 5000,
        });
        const outcome = await handle.done;
        const out = handle.collected.stdout.readFrom(0).text || "";
        const errOut = handle.collected.stderr.readFrom(0).text || "";
        if (outcome.exitCode !== 0) {
          writeJson(res, 200, {
            ok: false,
            error: "HTTP_FAIL",
            exitCode: outcome.exitCode,
            message: (out || errOut).slice(0, 300),
          });
          return;
        }
        let data = null;
        try {
          data = JSON.parse(out);
        } catch {
          writeJson(res, 200, { ok: false, error: "BAD_RESPONSE", message: out.slice(0, 300) });
          return;
        }
        if (data && data.error) {
          writeJson(res, 200, { ok: false, error: "API_ERROR", message: String(data.error.message || data.error) });
          return;
        }
        const usage = data && typeof data.usage === "object" ? data.usage : {};
        writeJson(res, 200, {
          ok: true,
          rolling: normGroup(usage.rolling),
          weekly: normGroup(usage.weekly),
          monthly: normGroup(usage.monthly),
        });
      } catch (err) {
        const message = err && err.message ? err.message : String(err);
        writeJson(res, 200, { ok: false, error: "FETCH_FAIL", message: message.slice(0, 300) });
      }
    },
  };

  const keyRoute = {
    kind: "exact",
    path: KEY_PATH,
    handler: async (req, res) => {
      if (!isLoopbackRequest(req)) {
        writeJson(res, 403, { error: "forbidden: loopback-only" });
        return;
      }
      const method = req.method ?? "GET";
      if (method === "GET") {
        try {
          const resolved = await ctx.credentials.resolve(CRED_REF);
          const configured = resolved !== undefined && resolved.value !== "";
          writeJson(res, 200, {
            ok: true,
            configured,
            source: configured ? (resolved.source || "credentials") : "none",
          });
        } catch (err) {
          const message = err && err.message ? err.message : String(err);
          writeJson(res, 200, { ok: false, error: "STATUS_FAIL", message: message.slice(0, 200) });
        }
        return;
      }
      if (method === "POST") {
        try {
          const body = await readBody(req);
          const key = typeof body.key === "string" ? body.key.trim() : "";
          if (key === "") {
            writeJson(res, 200, { ok: false, error: "EMPTY_KEY" });
            return;
          }
          await ctx.credentials.set(CRED_REF, key);
          writeJson(res, 200, { ok: true, source: "credentials" });
        } catch (err) {
          const message = err && err.message ? err.message : String(err);
          writeJson(res, 200, {
            ok: false,
            error: "SAVE_FAIL",
            message: message.slice(0, 200),
            hint: message.indexOf("shadow") !== -1 || message.indexOf("read-only") !== -1
              ? "当前密钥由环境变量提供，无需保存"
              : undefined,
          });
        }
        return;
      }
      writeJson(res, 405, { error: "method not allowed" });
    },
  };

  const keyClearRoute = {
    kind: "exact",
    path: KEY_CLEAR_PATH,
    handler: async (req, res) => {
      if ((req.method ?? "POST") !== "POST") {
        writeJson(res, 405, { error: "method not allowed" });
        return;
      }
      if (!isLoopbackRequest(req)) {
        writeJson(res, 403, { error: "forbidden: loopback-only" });
        return;
      }
      try {
        await ctx.credentials.unset(CRED_REF);
        writeJson(res, 200, { ok: true });
      } catch (err) {
        const message = err && err.message ? err.message : String(err);
        writeJson(res, 200, { ok: false, error: "CLEAR_FAIL", message: message.slice(0, 200) });
      }
    },
  };

  const disposers = [
    ctx.webServer.register(usageRoute),
    ctx.webServer.register(keyRoute),
    ctx.webServer.register(keyClearRoute),
  ];
  return () => {
    for (const d of disposers) d();
  };
}
