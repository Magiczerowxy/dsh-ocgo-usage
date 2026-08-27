// @magiczerowxy/dsh-ocgo-usage — Host half (ESM).
// 零顶层导入版本：不 import 任何 node: 模块（node:fs/os/path 的默认导入曾导致
// Desktop 内置 dsh 的 Loader 加载后 apply 不生效）。密钥通过 dsh 的
// credentials 服务持久化（~/.dsh/.credentials.yaml），与 web 端口/浏览器
// 存储无关，重启不丢失。
//
// Registers:
//   GET  /api/dsh-ocgo-usage/usage   — OpenCode Go 配额查询（Node fetch 官方接口）
//   GET  /api/dsh-ocgo-usage/key     — 已配置状态探测（不回传密钥值；附多 key 列表）
//   POST /api/dsh-ocgo-usage/key     — 保存单个 API Key（credentials.set，兼容旧版）
//   POST /api/dsh-ocgo-usage/key/clear — 清除已保存的 API Key
//   GET/POST /api/dsh-ocgo-usage/keys — 多 key 列表读写（JSON 存独立 credential 引用）

// 统一查询传输：Node 全局 fetch（undici/OpenSSL）。避免 Windows 内置
// curl.exe（Schannel 后端）在本机间歇性 SEC_E_NO_CREDENTIALS 失败。
// 单次超时 15s；对瞬时错误（连接失败/超时/429/5xx）自动重试一次。
function fetchJson(url, key) {
  return new Promise((resolve) => {
    if (typeof fetch !== "function") {
      resolve({ error: "FETCH_FAIL", message: "宿主运行时不支持 fetch" });
      return;
    }
    const run = async (tryNo) => {
      let timer = null;
      let ctrl = null;
      try {
        ctrl = new AbortController();
        timer = setTimeout(() => ctrl.abort(), 15000);
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + key,
            "User-Agent": "dsh-widgets/0.1.3",
            "Accept": "application/json",
          },
          signal: ctrl.signal,
          redirect: "follow",
        });
        if (timer !== null) { clearTimeout(timer); timer = null; }
        const text = await res.text();
        if (res.status !== 200) {
          if (tryNo < 2 && (res.status === 429 || res.status >= 500)) {
            setTimeout(() => run(tryNo + 1), 1000);
            return;
          }
          resolve({ error: "API_ERROR", status: res.status, message: text.slice(0, 300) });
          return;
        }
        resolve({ text });
      } catch (err) {
        if (timer !== null) { clearTimeout(timer); timer = null; }
        if (tryNo < 2) {
          setTimeout(() => run(tryNo + 1), 1000);
          return;
        }
        const aborted = ctrl !== null && ctrl.signal.aborted;
        resolve({
          error: aborted ? "API_ERROR" : "FETCH_FAIL",
          status: aborted ? 0 : undefined,
          message: aborted ? "query timeout after 15s" : String(err && err.message ? err.message : err).slice(0, 300),
        });
      }
    };
    run(1);
  });
}

export const name = "ocgo-usage";

export const inject = ["webServer", "credentials", "subprocess"];

const USAGE_PATH = "/api/dsh-ocgo-usage/usage";
const KEY_PATH = "/api/dsh-ocgo-usage/key";
const KEY_CLEAR_PATH = "/api/dsh-ocgo-usage/key/clear";
const KEYS_PATH = "/api/dsh-ocgo-usage/keys";
const CRED_REF = "OPENCODE_API_KEY";
// 多 key 列表持久化：JSON 字符串存入独立 credential 引用（已实测可原样往返）
const KEYS_REF = "OPENCODE_KEYS";

// 设置 schema：callable（解析命名空间 section）+ toJSON（描述，与 schemastery 输出结构一致）。
// 宿主零顶层导入约束下手工构造，供 settings 服务 describe/mutate 使用。
function showWindowSchema(value) {
  const v = value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
  const out = { ...v };
  if (v.show === undefined) out.show = true;
  else if (typeof v.show !== "boolean") throw new TypeError("$.show expected boolean");
  return out;
}
showWindowSchema.toJSON = () => ({
  uid: 2,
  refs: {
    "1": { type: "boolean", meta: { default: true } },
    "2": { type: "object", meta: { default: {} }, dict: { show: 1 } }
  }
});

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

// 解析多 key 存储值：兼容 字符串JSON / 数组 / 对象 三种读回形态
function parseKeysStore(v) {
  if (typeof v === "string") {
    try { v = JSON.parse(v); } catch { return null; }
  }
  if (Array.isArray(v)) {
    const keys = v.filter((k) => typeof k === "string" && k.trim() !== "");
    return { keys, active: keys.length > 0 ? 0 : -1 };
  }
  if (v !== null && typeof v === "object") {
    const keys = Array.isArray(v.keys)
      ? v.keys.filter((k) => typeof k === "string" && k.trim() !== "")
      : [];
    const active = Number.isInteger(v.active) && v.active >= 0 && v.active < keys.length
      ? v.active
      : (keys.length > 0 ? 0 : -1);
    return { keys, active };
  }
  return null;
}

async function readKeys(ctx) {
  try {
    const resolved = await ctx.credentials.resolve(KEYS_REF);
    if (resolved === undefined) return { keys: [], active: -1 };
    const parsed = parseKeysStore(resolved.value);
    if (parsed === null) return { keys: [], active: -1 };
    return parsed;
  } catch (err) {
    return { keys: [], active: -1 };
  }
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
  // 注册「余额查询」设置命名空间（控制本窗口显示；默认开启，不影响原查询功能）
  try {
    ctx.inject(["settings"], (sctx) => {
      sctx.settings.register("dsh-ocgo-usage", showWindowSchema);
    });
  } catch (err) { /* settings 服务不可用时忽略 */ }

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
        const result = await fetchJson("https://opencode.ai/zen/go/v1/usage", key);
        if (result.error) {
          writeJson(res, 200, { ok: false, error: result.error, status: result.status, message: result.message });
          return;
        }
        let data = null;
        try {
          data = JSON.parse(result.text);
        } catch {
          writeJson(res, 200, { ok: false, error: "BAD_RESPONSE", message: result.text.slice(0, 300) });
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
          const store = await readKeys(ctx);
          writeJson(res, 200, {
            ok: true,
            configured,
            source: configured ? (resolved.source || "credentials") : "none",
            keys: store.keys,
            active: store.active,
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

  const keysRoute = {
    kind: "exact",
    path: KEYS_PATH,
    handler: async (req, res) => {
      if (!isLoopbackRequest(req)) {
        writeJson(res, 403, { error: "forbidden: loopback-only" });
        return;
      }
      const method = req.method ?? "GET";
      if (method === "GET") {
        try {
          const store = await readKeys(ctx);
          writeJson(res, 200, { ok: true, keys: store.keys, active: store.active });
        } catch (err) {
          const message = err && err.message ? err.message : String(err);
          writeJson(res, 200, { ok: false, error: "LIST_FAIL", message: message.slice(0, 200) });
        }
        return;
      }
      if (method === "POST") {
        try {
          const body = await readBody(req);
          const keys = Array.isArray(body.keys)
            ? body.keys.filter((k) => typeof k === "string" && k.trim() !== "")
            : [];
          let active = Number.isInteger(body.active) ? body.active : -1;
          if (active < 0 || active >= keys.length) active = keys.length > 0 ? 0 : -1;
          await ctx.credentials.set(KEYS_REF, JSON.stringify({ keys, active }));
          // 尽量把当前激活 key 同步到标准凭据引用（env 遮蔽时跳过，请求走 header 仍有效）
          let activeSource = "list";
          if (active >= 0) {
            try {
              await ctx.credentials.set(CRED_REF, keys[active]);
              activeSource = "credentials";
            } catch (err) {
              const m = err && err.message ? err.message : String(err);
              activeSource = m.indexOf("shadow") !== -1 ? "env" : "credentials-fail";
            }
          }
          writeJson(res, 200, { ok: true, keys, active, activeSource });
        } catch (err) {
          const message = err && err.message ? err.message : String(err);
          writeJson(res, 200, { ok: false, error: "SAVE_KEYS_FAIL", message: message.slice(0, 200) });
        }
        return;
      }
      writeJson(res, 405, { error: "method not allowed" });
    },
  };

  const disposers = [
    ctx.webServer.register(usageRoute),
    ctx.webServer.register(keyRoute),
    ctx.webServer.register(keyClearRoute),
    ctx.webServer.register(keysRoute),
  ];
  return () => {
    for (const d of disposers) d();
  };
}
