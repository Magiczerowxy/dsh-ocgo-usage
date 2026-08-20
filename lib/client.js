window.__ModuleLoader__.load({
  id: "@magiczerowxy/dsh-ocgo-usage",
  factory: (require) => {
    const React = require("react");
    const USAGE_PATH = "/api/dsh-ocgo-usage/usage";
    const KEY_PATH = "/api/dsh-ocgo-usage/key";
    const KEY_CLEAR_PATH = "/api/dsh-ocgo-usage/key/clear";
    const KEYS_SAVE_PATH = "/api/dsh-ocgo-usage/keys";

    const inject = ["theme"];

    function apply(ctx) {
      const style = document.createElement("style");
      style.dataset.plugin = "@magiczerowxy/dsh-ocgo-usage";
      style.textContent = `
        .ds-oc {
          position: fixed; left: 18px; bottom: 196px; width: 206px; z-index: 2;
          pointer-events: auto;
          box-sizing: border-box;
          display: flex; flex-direction: column; gap: 4px;
          padding: 9px 10px; border-radius: 12px;
          /* 毛玻璃：半透明底 + 背景模糊 + 外围淡阴影 */
          background: rgba(255, 255, 255, 0.25);
          -webkit-backdrop-filter: blur(16px) saturate(1.35);
          backdrop-filter: blur(16px) saturate(1.35);
          border: 1px solid rgba(255, 255, 255, 0.30);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.06);
          color: var(--dsw-alias-label-primary);
          font-size: 12px;
          font-family: "Microsoft YaHei", "Microsoft YaHei UI", "微软雅黑", sans-serif;
          contain: layout paint style;
          overflow: hidden;
          transform-origin: left bottom;
          transform: translateZ(0) scale(1);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out, height 0.3s ease-out, bottom 0.2s ease-out, visibility 0s linear 0s;
        }
        /* 侧边栏收起/展开：JS 添加的收缩动画类（portal 渲染后原后代选择器失效） */
        .ds-frame-collapsed {
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          transform-origin: left center !important;
          transform: translateZ(0) scaleX(0) !important;
          transition: opacity 0.2s ease-out, transform 0.2s ease-out, visibility 0s linear 0.2s !important;
        }
        .ds-oc.ds-oc-dark {
          background: rgba(16, 16, 22, 0.60);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32), 0 2px 8px rgba(0, 0, 0, 0.18);
        }
        .ds-oc-main { display: flex; flex-direction: column; gap: 5px; }
        .ds-oc-head {
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
          font-size: 12px; color: var(--dsw-alias-label-secondary);
          margin-bottom: 2px;
        }
        /* 标题弹性收缩：窗口过窄时溢出文字显示省略号，不换行撑高窗口 */
        .ds-oc-title {
          flex: 1; min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ds-oc-actions { display: flex; gap: 4px; }
        .ds-oc-btn {
          background: none; border: none; cursor: pointer;
          color: var(--dsw-alias-label-secondary); font-size: 13px;
          padding: 0 2px; line-height: 1;
        }
        .ds-oc-btn:hover { color: var(--dsw-alias-brand-primary); }
        .ds-oc-row {
          display: flex; align-items: center; gap: 6px;
        }
        .ds-oc-label {
          flex: none; width: 28px;
          font-size: 11px; color: var(--dsw-alias-label-secondary);
        }
        .ds-oc-track {
          flex: 1; height: 7px; border-radius: 999px;
          background: var(--dsw-alias-interactive-bg-hover);
          overflow: hidden;
        }
        .ds-oc-fill {
          height: 100%; border-radius: 999px;
          transition: width 0.3s ease-out;
        }
        .ds-oc-fill-ok { background: #3B82F6; }
        .ds-oc-fill-na { background: var(--dsw-alias-label-tertiary); }
        .ds-oc-pct {
          flex: none; width: 36px; text-align: right;
          font-size: 11px; font-weight: 600;
          font-family: "Microsoft YaHei", "Microsoft YaHei UI", "微软雅黑", sans-serif;
          font-variant-numeric: tabular-nums;
        }
        /* 用量行悬浮提示层（固定定位，不受窗口 overflow 裁剪） */
        .ds-oc-tip {
          position: fixed;
          z-index: 2;
          pointer-events: none;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 11px; line-height: 1.6;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.14);
          color: #333;
          white-space: nowrap;
        }
        .ds-oc-tip-dark {
          background: rgba(28, 28, 36, 0.95);
          border-color: rgba(255, 255, 255, 0.10);
          color: #e6e6e6;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
        }
        .ds-oc-tip-line { font-variant-numeric: tabular-nums; }
        .ds-oc-tip-line:first-child { font-weight: 600; }
        .ds-oc-muted { color: var(--dsw-alias-label-secondary); }
        .ds-oc-link {
          color: var(--dsw-alias-label-secondary);
          font-size: 11px;
          text-decoration: none;
          margin-top: 5px;
        }
        .ds-oc-link:hover { color: var(--dsw-alias-brand-primary); text-decoration: underline; }
        .ds-oc-err {
          color: var(--dsw-alias-state-error-primary);
          font-size: 11px; word-break: break-all;
        }
        /* 长条（strip）形态：一行数据 + 右侧按钮 */
        .ds-oc-strip-body {
          display: none;
          flex-direction: row; align-items: center; gap: 6px;
          font-size: 12px;
        }
        /* 长条左侧标签（Opencode）保持粗体，数据（百分比）常规 */
        .ds-oc-strip-info > span:first-child { font-weight: 700; }
        .ds-oc-strip-info {
          flex: 1;
          display: flex; flex-direction: row; align-items: center; justify-content: space-between;
          gap: 6px;
          min-width: 0;
        }
        .ds-oc-strip-data { margin-right: 3px; font-variant-numeric: tabular-nums; }
        .ds-oc-state-strip .ds-oc-main { display: none; }
        .ds-oc-state-strip .ds-oc-strip-body { display: flex; }
        .ds-oc-state-strip { padding: 4px 10px; }
        /* chip 态：大窗/长条容器隐藏 */
        .ds-oc-state-chip {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform-origin: left bottom;
          transform: translateZ(0) scale(0.15);
          transition: opacity 0.2s ease-out, transform 0.2s ease-out, visibility 0s linear 0.2s;
        }
        /* 来自长条：宽度向左缩短 */
        .ds-oc-state-chip.ds-oc-from-strip {
          transform: translateZ(0) scaleX(0);
          transform-origin: left center;
          transition: opacity 0.2s ease-out, transform 0.2s ease-out, visibility 0s linear 0.2s;
        }
        /* 圆片：默认隐藏，仅 chip 态显示 */
        .ds-oc-chip {
          position: fixed; left: 18px; bottom: 196px; z-index: 2;
          pointer-events: none;
          background: rgba(255, 255, 255, 0.25);
          -webkit-backdrop-filter: blur(16px) saturate(1.35);
          backdrop-filter: blur(16px) saturate(1.35);
          border: 1px solid rgba(255, 255, 255, 0.30);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.10), 0 2px 6px rgba(0, 0, 0, 0.06);
          border-radius: 999px;
          color: var(--dsw-alias-label-primary);
          cursor: pointer;
          font-size: 12px; font-weight: 600;
          font-family: "Microsoft YaHei", "Microsoft YaHei UI", "微软雅黑", sans-serif;
          padding: 5px 12px;
          contain: layout paint style;
          transform-origin: left bottom;
          transform: translateZ(0) scale(0.15);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease-out, transform 0.3s ease-out, bottom 0.3s ease-out, visibility 0s linear 0s;
        }
        .ds-oc-chip.ds-oc-dark {
          background: rgba(16, 16, 22, 0.60);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.32), 0 2px 8px rgba(0, 0, 0, 0.18);
        }
        .ds-oc-state-chip ~ .ds-oc-chip {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translateZ(0) scale(1);
        }
        /* 窗口处于长条态时，圆片以宽度收缩形态隐藏（保证长条→圆片是纯宽度伸缩） */
        .ds-oc-state-strip ~ .ds-oc-chip {
          transform: translateZ(0) scaleX(0);
          transform-origin: left center;
        }
        .ds-oc-chip:hover { border-color: var(--dsw-alias-brand-primary); }
        /* 侧边栏收起（窄轨道）：隐藏大窗/长条与圆片 */
        [data-sidebar-collapsed] .ds-oc,
        [data-sidebar-collapsed] .ds-oc-chip {
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform-origin: left center;
          transform: translateZ(0) scaleX(0);
          transition: opacity 0.2s ease-out, transform 0.2s ease-out, visibility 0s linear 0.2s;
        }
        /* API Key 设置对话框 */
        .ds-set-modal {
          position: fixed; inset: 0; z-index: 10;
          pointer-events: auto;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0, 0, 0, 0.35);
        }
        .ds-set-card {
          width: 280px; box-sizing: border-box;
          display: flex; flex-direction: column; gap: 8px;
          padding: 12px 14px; border-radius: 12px;
          background: var(--dsw-alias-bg-overlay);
          border: 1px solid var(--dsw-alias-border-l1);
          color: var(--dsw-alias-label-primary);
          font-size: 12px;
          font-family: "Microsoft YaHei", "Microsoft YaHei UI", "微软雅黑", sans-serif;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
        }
        .ds-set-card.ds-set-dark { background: var(--dsw-alias-bg-base); }
        .ds-set-title { font-size: 13px; font-weight: 600; }
        .ds-set-label { color: var(--dsw-alias-label-tertiary); font-size: 11px; }
        .ds-set-input {
          box-sizing: border-box; width: 100%; height: 30px;
          color: var(--dsw-alias-label-primary);
          background: var(--dsw-alias-bg-layer-1);
          border: 1px solid var(--dsw-alias-border-l2);
          border-radius: 6px;
          font-size: 12px; padding: 0 8px;
          outline: none;
        }
        .ds-set-input:focus { border-color: var(--dsw-alias-brand-primary); }
        .ds-set-actions { display: flex; justify-content: flex-end; gap: 6px; }
        .ds-set-btn {
          border: 1px solid var(--dsw-alias-border-l2);
          background: none; color: var(--dsw-alias-label-secondary);
          border-radius: 6px; cursor: pointer;
          font-size: 12px; padding: 4px 10px;
        }
        .ds-set-btn:hover { border-color: var(--dsw-alias-brand-primary); color: var(--dsw-alias-label-primary); }
        .ds-set-btn-primary {
          background: var(--dsw-alias-brand-primary);
          color: var(--dsw-alias-label-primary-foreground);
          border: none;
        }
        .ds-set-btn-primary:hover { opacity: 0.9; color: var(--dsw-alias-label-primary-foreground); }
        .ds-set-hint {
          font-size: 11px;
          color: var(--dsw-alias-label-tertiary);
          word-break: break-all;
        }
        .ds-set-hint-err {
          font-size: 11px;
          color: var(--dsw-alias-state-error-primary);
          word-break: break-all;
        }
        /* 多 key 设置：标题行 + 输入行列表 */
        .ds-set-title-row {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .ds-set-add {
          border: 1px dashed var(--dsw-alias-border-l2);
          background: none; color: var(--dsw-alias-brand-primary);
          border-radius: 6px; cursor: pointer;
          font-size: 11px; padding: 2px 8px; white-space: nowrap;
        }
        .ds-set-add:hover {
          border-color: var(--dsw-alias-brand-primary);
          background: rgba(59, 130, 246, 0.08);
        }
        .ds-set-row { display: flex; align-items: center; gap: 6px; }
        .ds-set-row .ds-set-input { flex: 1; }
        .ds-set-del {
          flex: none; border: none; background: none;
          color: var(--dsw-alias-label-tertiary); cursor: pointer;
          font-size: 13px; padding: 0 2px; line-height: 1;
        }
        .ds-set-del:hover { color: var(--dsw-alias-state-error-primary); }
        /* 右上角 ··· 多 key 切换菜单 */
        .ds-key-backdrop { position: fixed; inset: 0; z-index: 15; pointer-events: auto; }
        .ds-key-menu {
          position: fixed; z-index: 20;
          min-width: 160px; max-width: 248px;
          box-sizing: border-box;
          background: var(--dsw-alias-bg-overlay);
          border: 1px solid var(--dsw-alias-border-l1);
          border-radius: 10px;
          padding: 4px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          display: flex; flex-direction: column; gap: 2px;
          pointer-events: auto;
          font-family: "Microsoft YaHei", "Microsoft YaHei UI", "微软雅黑", sans-serif;
        }
        .ds-key-menu.ds-key-dark { background: var(--dsw-alias-bg-base); }
        .ds-key-item {
          display: flex; align-items: center; justify-content: space-between; gap: 8px;
          padding: 6px 10px; border-radius: 6px;
          cursor: pointer; border: none; text-align: left;
          background: none;
          font-size: 12px; font-family: inherit;
          color: var(--dsw-alias-label-primary);
          white-space: nowrap;
        }
        .ds-key-item:hover { background: var(--dsw-alias-interactive-bg-hover); }
        .ds-key-item.ds-key-active { color: var(--dsw-alias-brand-primary); font-weight: 600; }
        .ds-key-mask { overflow: hidden; text-overflow: ellipsis; }
        .ds-key-check { flex: none; }
        .ds-key-sys {
          color: var(--dsw-alias-label-secondary);
          border-top: 1px solid var(--dsw-alias-border-l2);
          margin-top: 2px; border-radius: 6px;
        }
        .ds-key-empty { padding: 10px; color: var(--dsw-alias-label-tertiary); font-size: 12px; text-align: center; }
      `;
      document.head.appendChild(style);

      const store = { dark: false, listeners: [] };
      function notify() {
        for (const fn of store.listeners) fn();
      }
      function refreshDark() {
        try {
          const snap = ctx.theme.getTheme();
          if (snap) {
            store.dark = snap.colorScheme === "dark" || snap.mode === "dark" || snap.id === "dark";
          }
        } catch (err) { /* keep previous */ }
        notify();
      }
      refreshDark();
      ctx.on("theme/change", refreshDark);
      function subscribe(fn) {
        store.listeners.push(fn);
        return () => { store.listeners = store.listeners.filter((f) => f !== fn); };
      }

      const GROUPS = [
        { key: "rolling", label: "滚动" },
        { key: "weekly", label: "每周" },
        { key: "monthly", label: "每月" },
      ];

      function errorText(res) {
        if (!res) return "获取失败";
        switch (res.error) {
          case "NO_KEY": return "未配置 OPENCODE_API_KEY";
          case "CREDENTIALS_FAIL": return "读取密钥失败";
          case "HTTP_FAIL": return "请求失败 (exit " + String(res.exitCode) + ")";
          case "API_ERROR": return "接口错误: " + String(res.message || "").slice(0, 80);
          case "BAD_RESPONSE": return "响应解析失败";
          case "FETCH_FAIL": return "请求异常: " + String(res.message || "").slice(0, 80);
          default: return "获取失败";
        }
      }

      // 进度条颜色按「余量」分级：已用<=50% 绿（余量充足）；50~80% 黄（预警）；>80% 红（余量不足）
      function fillClass(pct) {
        if (pct === null) return "ds-oc-fill-na";
        return "ds-oc-fill-ok";
      }
      function fmtPct(pct) {
        if (pct === null || pct === undefined || Number.isNaN(pct)) return "--%";
        return Math.round(pct) + "%";
      }
      // 重置剩余时长：X天Y小时 / X小时Y分钟 / X分钟
      function durText(ms) {
        if (!(ms > 0)) return "--";
        const totalMin = Math.max(0, Math.floor(ms / 60000));
        const d = Math.floor(totalMin / 1440);
        const h = Math.floor((totalMin % 1440) / 60);
        const m = totalMin % 60;
        if (d > 0) return d + "天" + h + "小时";
        if (h > 0) return h + "小时" + m + "分钟";
        return m + "分钟";
      }
      // 重置时间（北京时间）：rolling 只显示 HH:mm，weekly/monthly 显示 M月D日 HH:mm
      function resetTimeText(key, iso) {
        if (!iso) return "--";
        const d = new Date(new Date(iso).getTime() + 8 * 3600 * 1000);
        if (Number.isNaN(d.getTime())) return "--";
        const hh = ("0" + d.getUTCHours()).slice(-2);
        const mm = ("0" + d.getUTCMinutes()).slice(-2);
        if (key === "rolling") return hh + ":" + mm;
        return (d.getUTCMonth() + 1) + "月" + d.getUTCDate() + "日 " + hh + ":" + mm;
      }

      // ---- 侧边栏宽度跟踪：窗口宽度随侧边栏伸缩，右边界保持 18px，最小 206px ----
      const WIN_MIN_WIDTH = 206;
      const SIDEBAR_GAP = 18;
      let winNode = null;
      let frameNode = null;
      let frameObs = null;

      let frameWaitObs = null;
      let widthRaf = null;
      let lastW = -1;
      let stableFrames = 0;

      function findFrame() {
        try {
          const d = document.querySelector(".dshDesktopFrame");
          if (d !== null) return d;
          const c = document.querySelector("[data-sidebar-collapsed]");
          if (c !== null) return c;
          for (const el of document.querySelectorAll("div")) {
            try {
              const cols = el.style && el.style.gridTemplateColumns;
              if (typeof cols === "string" && cols.indexOf("px") !== -1) return el;
            } catch (err) { /* ignore */ }
          }
        } catch (err) { /* ignore */ }
        return null;
      }

      function applyCollapsed() {
        if (frameNode === null) return;
        try {
          const collapsed = frameNode.hasAttribute("data-sidebar-collapsed");
          for (const el of [ocgoWinNode, ocgoChipNode]) {
            if (el === null) continue;
            if (collapsed) el.classList.add("ds-frame-collapsed");
            else el.classList.remove("ds-frame-collapsed");
          }
        } catch (err) { /* ignore */ }
      }

      // 读取布局 frame 当前实际（含动画插值）的第一列宽度并应用到窗口
      function applyWidth(node) {
        if (frameNode === null) return -1;
        try {
          const cs = getComputedStyle(frameNode);
          const cols = String(cs.gridTemplateColumns || frameNode.style.gridTemplateColumns || "").split(/\s+/);
          const m = /^([\d.]+)px$/.exec(cols[0] || "");
          const w = m ? parseFloat(m[1]) : 0;
          if (w > 0) {
            const target = Math.max(WIN_MIN_WIDTH, w - SIDEBAR_GAP - SIDEBAR_GAP);
            node.style.width = target + "px";
            return target;
          }
        } catch (err) { /* ignore */ }
        return -1;
      }

      // rAF 跟随：侧边栏动画/拖拽期间逐帧读取实际宽度，连续稳定后停止
      function followWidth() {
        if (winNode === null || frameNode === null) { stopFollow(); return; }
        const w = applyWidth(winNode);
        if (w === lastW) {
          stableFrames += 1;
          if (stableFrames >= 2) { stopFollow(); return; }
        } else {
          stableFrames = 0;
          lastW = w;
        }
        widthRaf = window.requestAnimationFrame(followWidth);
      }
      function stopFollow() {
        if (widthRaf !== null) { try { window.cancelAnimationFrame(widthRaf); } catch (err) { /* ignore */ } }
        widthRaf = null;
      }

      function startFrameObs() {
        if (frameObs !== null) return;
        try {
          frameObs = new MutationObserver(() => {
            if (frameNode === null || !frameNode.isConnected) {
              frameNode = findFrame();
              if (frameNode !== null) {
                try { frameObs.disconnect(); } catch (err) { /* ignore */ }
                frameObs = null;
                startFrameObs();
              }
            }
            if (winNode !== null) {
              applyCollapsed();
              followWidth();
            }
          });
          frameObs.observe(frameNode, { attributes: true, attributeFilter: ["style", "data-sidebar-collapsed"] });
        } catch (err) { /* ignore */ }
      }

      function bindWindowNode(node) {
        if (node === null) {
          winNode = null;
          return;
        }
        winNode = node;
        if (frameNode === null) frameNode = findFrame();
        if (frameNode === null) {
          // 布局可能尚未渲染：等待其出现后绑定
          if (frameWaitObs === null) {
            try {
              frameWaitObs = new MutationObserver(() => {
                if (frameNode === null) frameNode = findFrame();
                if (frameNode !== null && frameWaitObs !== null) {
                  try { frameWaitObs.disconnect(); } catch (err) { /* ignore */ }
                  frameWaitObs = null;
                  if (winNode !== null) { applyCollapsed(); followWidth(); }
                  startFrameObs();
                }
              });
              frameWaitObs.observe(document.body, { childList: true, subtree: true });
            } catch (err) { /* ignore */ }
          }
          return;
        }
        applyCollapsed();
        followWidth();
        startFrameObs();
      }

      // ---- 垂直定位：叠在 DeepSeek 余额窗口上方，随其形态（大窗/长条/圆片）自动调整 ----
      const BALANCE_BOTTOM = 104;
      const STACK_GAP = 9;
      let ocgoWinNode = null;
      let ocgoChipNode = null;
      let balanceWinEl = null;
      let balanceChipEl = null;
      let stackObs = null;
      let stackDocObs = null;

      function balanceVisibleHeight() {
        try {
          if (balanceWinEl === null) {
            balanceWinEl = document.querySelector(".ds-win");
            balanceChipEl = document.querySelector(".ds-win-chip");
          }
          if (balanceWinEl === null) return null;
          const cls = balanceWinEl.className || "";
          if (cls.indexOf("ds-win-state-chip") !== -1) {
            if (balanceChipEl !== null && balanceChipEl.offsetHeight > 0) return balanceChipEl.offsetHeight;
            return 28;
          }
          return balanceWinEl.offsetHeight;
        } catch (err) { return null; }
      }

      function applyStackBottom() {
        const h = balanceVisibleHeight();
        if (h === null || h <= 0) return;
        const bottom = (BALANCE_BOTTOM + h + STACK_GAP) + "px";
        try { if (ocgoWinNode !== null) ocgoWinNode.style.bottom = bottom; } catch (err) { /* ignore */ }
        try { if (ocgoChipNode !== null) ocgoChipNode.style.bottom = bottom; } catch (err) { /* ignore */ }
      }

      function attachStackObservers() {
        if (stackObs !== null) return;
        const win = document.querySelector(".ds-win");
        if (win === null) return;
        balanceWinEl = win;
        balanceChipEl = document.querySelector(".ds-win-chip");
        let mo = null;
        let ro = null;
        try {
          mo = new MutationObserver(() => applyStackBottom());
          mo.observe(win, { attributes: true, attributeFilter: ["class"] });
          if (balanceChipEl !== null) mo.observe(balanceChipEl, { attributes: true, attributeFilter: ["class"] });
        } catch (err) { /* ignore */ }
        try {
          ro = new ResizeObserver(() => applyStackBottom());
          ro.observe(win);
          if (balanceChipEl !== null) ro.observe(balanceChipEl);
        } catch (err) { /* ignore */ }
        stackObs = () => {
          try { if (mo !== null) mo.disconnect(); } catch (err) { /* ignore */ }
          try { if (ro !== null) ro.disconnect(); } catch (err) { /* ignore */ }
        };
        applyStackBottom();
      }

      function ensureStackTarget() {
        if (balanceWinEl !== null) return;
        if (document.querySelector(".ds-win") !== null) { attachStackObservers(); return; }
        if (stackDocObs === null) {
          try {
            stackDocObs = new MutationObserver(() => {
              if (document.querySelector(".ds-win") !== null) {
                try { stackDocObs.disconnect(); } catch (err) { /* ignore */ }
                stackDocObs = null;
                attachStackObservers();
              }
            });
            stackDocObs.observe(document.body, { childList: true, subtree: true });
          } catch (err) { /* ignore */ }
        }
      }

      function bindStackWin(node) {
        // 宽度跟随侧边栏 + 垂直堆叠定位 + 高度管理，合并到同一个 ref
        ocgoWinNode = node;
        bindWindowNode(node);
        if (node !== null) { applyCollapsed(); ensureStackTarget(); }
      }
      function bindStackChip(node) {
        ocgoChipNode = node;
        if (node !== null) { applyCollapsed(); ensureStackTarget(); }
      }

      const STORE_KEY = "dsh.ocgo.apiKey";
      const STRIP_HEIGHT = 28;
      let bigHeightCache = null;

      // 展开/收起箭头图标（SVG，颜色跟随 currentColor）
      function ChevronUp() {
        return React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 16 16", style: { display: "block" } },
          React.createElement("path", {
            d: "M4 10.5 L8 5.5 L12 10.5",
            stroke: "currentColor",
            strokeWidth: 2,
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }),
        );
      }
      function ChevronDown() {
        return React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 16 16", style: { display: "block" } },
          React.createElement("path", {
            d: "M4 5.5 L8 10.5 L12 5.5",
            stroke: "currentColor",
            strokeWidth: 2,
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }),
        );
      }
      function ChevronLeft() {
        return React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 16 16", style: { display: "block" } },
          React.createElement("path", {
            d: "M10.5 4 L5.5 8 L10.5 12",
            stroke: "currentColor",
            strokeWidth: 2,
            fill: "none",
            strokeLinecap: "round",
            strokeLinejoin: "round",
          }),
        );
      }
      function GearIcon() {
        return React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", style: { display: "block" } },
          React.createElement("path", {
            d: "M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z",
            fill: "currentColor",
          }),
        );
      }
      function ThreeDotsIcon() {
        return React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", style: { display: "block" } },
          React.createElement("circle", { cx: 5.5, cy: 12, r: 1.9, fill: "currentColor" }),
          React.createElement("circle", { cx: 12, cy: 12, r: 1.9, fill: "currentColor" }),
          React.createElement("circle", { cx: 18.5, cy: 12, r: 1.9, fill: "currentColor" }),
        );
      }
      // 脱敏显示：sk-abc****wxyz
      function maskKey(k) {
        const s = String(k || "");
        if (s.length <= 10) return s;
        return s.slice(0, 6) + "****" + s.slice(-4);
      }
      function RefreshIcon() {
        return React.createElement("svg", { width: 14, height: 14, viewBox: "0 0 24 24", style: { display: "block" } },
          React.createElement("path", {
            d: "M17.65,6.35C16.2,4.9 14.21,4 12,4c-4.42,0 -7.99,3.58 -7.99,8s3.57,8 7.99,8c3.73,0 6.84,-2.55 7.73,-6h-2.08c-0.82,2.33 -3.04,4 -5.65,4 -3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6c1.66,0 3.14,0.69 4.22,1.78L13,11h7V4L17.65,6.35z",
            fill: "currentColor",
          }),
        );
      }

      function UsageWindow() {
        const [state, setState] = React.useState({ status: "loading", data: null, error: null });
        // 三态：big 大窗口 / strip 长条 / chip 小圆片
        const [winState, setWinState] = React.useState("big");
        const [fromStrip, setFromStrip] = React.useState(false);
        const [settingsOpen, setSettingsOpen] = React.useState(false);
        const [keyHint, setKeyHint] = React.useState("");
        // 本机已配置状态：null=探测中, true=已配置(可回退使用), false=未配置
        const [keyReady, setKeyReady] = React.useState(null);
        const [keyReadySource, setKeyReadySource] = React.useState("");
        // 多 key：keys=已保存列表, activeKey=当前使用下标(-1=用本机配置), draftKeys=设置弹窗编辑副本
        const [keys, setKeys] = React.useState([]);
        const [activeKey, setActiveKey] = React.useState(-1);
        const [draftKeys, setDraftKeys] = React.useState([]);
        // 右上角 ··· 多 key 切换菜单
        const [menuOpen, setMenuOpen] = React.useState(false);
        const [menuPos, setMenuPos] = React.useState({ left: 0, top: 0 });
        // 供异步回调读取最新 keys/activeKey（避免闭包过期）
        const stateRef = React.useRef({ keys, activeKey });
        stateRef.current = { keys, activeKey };
        const autosaveTimer = React.useRef(null);
        // 用量行悬浮提示：{left, top, key}（null=隐藏）
        const [ocTip, setOcTip] = React.useState(null);
        // 半分钟重绘一次，保证「重置于」剩余时长实时倒数
        const [nowTick, setNowTick] = React.useState(Date.now());
        React.useEffect(() => {
          const t = window.setInterval(() => setNowTick(Date.now()), 30000);
          return () => { try { window.clearInterval(t); } catch (err) { /* ignore */ } };
        }, []);
        React.useEffect(() => subscribe(() => setState((s) => ({ ...s }))), []);

        const readStoredKey = () => {
          try { return localStorage.getItem(STORE_KEY) || ""; } catch (err) { return ""; }
        };

        const load = (explicitKey) => {
          try {
            setState((s) => ({ ...s, status: "loading", error: null }));
            const s = stateRef.current;
            let key = "";
            if (explicitKey !== undefined) key = explicitKey;
            else if (s.activeKey >= 0 && s.keys[s.activeKey]) key = s.keys[s.activeKey];
            else key = readStoredKey();
            fetch(USAGE_PATH, key !== "" ? { headers: { "X-DSH-API-KEY": key } } : {})
              .then((r) => r.json())
              .then((res) => {
                if (res && res.ok) setState({ status: "ok", data: res, error: null });
                else setState({ status: "error", data: null, error: res || {} });
              })
              .catch((err) => setState({ status: "error", data: null, error: { message: String(err) } }));
          } catch (err) {
            setState({ status: "error", data: null, error: { message: String(err) } });
          }
        };

        const sourceText = (s) => {
          if (s === "credentials") return "本机凭据";
          if (s === "file") return "本机文件";
          if (s === "env") return "环境变量";
          return s || "";
        };

        // 输入即存（防抖 600ms）：多个 key 永不因关闭/刷新丢失
        const persistDraft = (draft) => {
          const cleaned = draft.map((s) => String(s).trim()).filter((s) => s !== "");
          const s = stateRef.current;
          let act = s.activeKey;
          if (act < 0 || act >= cleaned.length) act = cleaned.length > 0 ? 0 : -1;
          return fetch(KEYS_SAVE_PATH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keys: cleaned, active: act }),
          })
            .then((r) => r.json().catch(() => null))
            .then((res) => {
              if (res && res.ok && Array.isArray(res.keys)) {
                setKeys(res.keys);
                const a = Number.isInteger(res.active) && res.active >= 0 ? res.active : (res.keys.length > 0 ? 0 : -1);
                setActiveKey(a);
                return res;
              }
              return null;
            })
            .catch(() => null);
        };
        const scheduleAutosave = (draft) => {
          if (autosaveTimer.current !== null) { try { window.clearTimeout(autosaveTimer.current); } catch (err) { /* ignore */ } }
          autosaveTimer.current = window.setTimeout(() => {
            autosaveTimer.current = null;
            const d = draft.map((s) => String(s).trim()).filter((s) => s !== "");
            if (d.length === 0 && stateRef.current.keys.length === 0) return; // 空表且无存量不写
            persistDraft(draft).then((res) => {
              if (res) setKeyHint("已自动保存 " + res.keys.length + " 个 API key（窗口 ··· 菜单可切换）");
            });
          }, 600);
        };
        const flushAutosave = () => {
          if (autosaveTimer.current !== null) { try { window.clearTimeout(autosaveTimer.current); } catch (err) { /* ignore */ } autosaveTimer.current = null; }
          const d = draftKeys.map((s) => String(s).trim()).filter((s) => s !== "");
          if (d.length === 0 && stateRef.current.keys.length === 0) return;
          persistDraft(draftKeys);
        };
        const saveKeys = () => {
          const cleaned = draftKeys.map((s) => String(s).trim()).filter((s) => s !== "");
          let act = activeKey;
          if (act < 0 || act >= cleaned.length) act = cleaned.length > 0 ? 0 : -1;
          if (cleaned.length === 0) {
            setKeyHint("请至少填写一个 API Key");
            return;
          }
          fetch(KEYS_SAVE_PATH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keys: cleaned, active: act }),
          })
            .then((r) => r.json().catch(() => null))
            .then((res) => {
              if (res && res.ok) {
                setKeys(cleaned);
                setActiveKey(act);
                setKeyHint("已保存 " + cleaned.length + " 个 API key，当前使用第 " + (act + 1) + " 个（窗口 ··· 菜单可切换）");
                load(act >= 0 && cleaned[act] ? cleaned[act] : undefined);
              } else {
                // 旧版宿主还没有 /keys 路由（需重启应用）：回退单 key 保存
                legacySave(cleaned[0]);
              }
            })
            .catch(() => legacySave(cleaned[0]));
        };
        // 旧版单 key 保存回退（POST /key → credentials.set）
        const legacySave = (key) => {
          try { localStorage.setItem(STORE_KEY, key); } catch (err) { /* ignore */ }
          fetch(KEY_PATH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key }),
          })
            .then((r) => r.json().catch(() => null))
            .then((res) => {
              if (res && res.ok) {
                setKeys([key]);
                setActiveKey(0);
                setKeyHint("已保存到本机（" + sourceText(res.source) + "）。重启应用后可保存多个 Key");
                load(key);
              } else {
                const hint = (res && res.hint) || ("保存失败：" + ((res && (res.message || res.error)) || "未知错误"));
                if (hint.indexOf("环境变量") !== -1) {
                  // 环境变量遮蔽凭据写入：改走请求头，当前会话立即可用该 Key
                  setKeys([key]);
                  setActiveKey(0);
                  setKeyHint("已使用你填写的 Key（本次会话生效，查询请求已携带）。重启应用后请再保存一次以持久化");
                  load(key);
                } else {
                  setKeyHint(hint);
                }
              }
            })
            .catch((err) => setKeyHint("保存失败：" + String(err)));
        };
        const closeSettings = () => {
          flushAutosave(); // 关闭前落盘，保证输入不丢
          setKeyHint("");
          setSettingsOpen(false);
        };
        const cancelSettings = () => {
          setDraftKeys(keys.length > 0 ? keys.slice() : [""]);
          setKeyHint("");
          setSettingsOpen(false);
        };
        // 应用已保存的 key 列表（显式传入并立即用该 key 加载，避免闭包过期）
        const applyKeys = (ks, act) => {
          setKeys(ks);
          const a = Number.isInteger(act) ? act : -1;
          setActiveKey(a);
          if (a >= 0 && ks[a]) load(ks[a]);
        };
        // 探测本机配置 + 读取已保存 key 列表
        const probe = () => {
          setKeyReady(null);
          fetch(KEY_PATH)
            .then((r) => r.json().catch(() => null))
            .then((res) => {
              if (res && res.ok) {
                setKeyReady(Boolean(res.configured));
                setKeyReadySource(res.configured ? sourceText(res.source) : "");
                if (Array.isArray(res.keys)) applyKeys(res.keys, res.active);
              }
            })
            .catch(() => { /* ignore */ });
          // 列表路由：新宿主 /key 已带 keys；旧宿主在此单独拉取（404 时忽略）
          fetch(KEYS_SAVE_PATH)
            .then((r) => r.json().catch(() => null))
            .then((kr) => {
              if (kr && kr.ok && Array.isArray(kr.keys)) applyKeys(kr.keys, kr.active);
            })
            .catch(() => { /* ignore */ });
        };
        const openSettings = () => {
          setKeyHint("");
          setDraftKeys(keys.length > 0 ? keys.slice() : [""]);
          setSettingsOpen(true);
          probe();
        };
        // 切换当前使用的 key（i=-1 表示回退到本机配置 env/凭据）
        const switchKey = (i) => {
          setMenuOpen(false);
          if (i === activeKey) return;
          setActiveKey(i);
          if (i >= 0 && keys[i]) {
            load(keys[i]);
          } else {
            load(""); // 强制不带 header，走 env/凭据
          }
          fetch(KEYS_SAVE_PATH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keys, active: i }),
          }).catch(() => { /* ignore */ });
        };

        React.useEffect(() => {
          load();
          probe();
          const id = window.setInterval(load, 5 * 60 * 1000);
          return () => {
            window.clearInterval(id);
            if (autosaveTimer.current !== null) { try { window.clearTimeout(autosaveTimer.current); } catch (err) { /* ignore */ } autosaveTimer.current = null; }
          };
        }, []);
                // 高度管理：big 用缓存/实测高度（支持过渡），strip 固定 28px
        const fixHeight = () => {
          const el = winNode;
          if (!el) return;
          if (winState === "strip") {
            el.style.height = STRIP_HEIGHT + "px";
            return;
          }
          if (winState === "chip") return;
          if (bigHeightCache !== null) {
            // 28px -> 缓存px：两个显式值之间必然产生过渡动画
            el.style.height = bigHeightCache + "px";
            return;
          }
          // 首次进入大窗：测量并缓存（此时处于自然高度，不会跳变）
          el.style.height = "auto";
          window.requestAnimationFrame(() => {
            if (winNode !== null && winNode === el) {
              bigHeightCache = el.offsetHeight;
              el.style.height = bigHeightCache + "px";
            }
          });
        };
        React.useEffect(() => { fixHeight(); }, [winState, state.status]);
        // 内容变化（如加载完成）时刷新缓存；仅在大窗状态下重测（无跳变）
        React.useEffect(() => {
          if (winState !== "big") return;
          const el = winNode;
          if (!el) return;
          el.style.height = "auto";
          window.requestAnimationFrame(() => {
            if (winNode !== null) {
              bigHeightCache = winNode.offsetHeight;
              winNode.style.height = bigHeightCache + "px";
            }
          });
        }, [state.status]);

        const darkClass = store.dark ? " ds-oc-dark" : "";
        const data = state.data;
        const rolling = state.status === "ok" && data ? data.rolling : null;
        const chipLabel = state.status === "loading"
          ? "…"
          : (rolling && typeof rolling.percent === "number"
            ? "OC " + fmtPct(rolling.percent)
            : "!");

        // 长条数据：滚动/每周/每月百分比（percent 为数字即显示，不要求 status===ok）
        const stripPcts = GROUPS.map((g) => {
          const group = state.status === "ok" && data ? data[g.key] : null;
          const pct = group && typeof group.percent === "number" ? group.percent : null;
          return fmtPct(pct);
        });

        let body;
        if (state.status === "loading") {
          body = React.createElement("div", { className: "ds-oc-muted" }, "查询中…");
        } else if (state.status === "error") {
          body = React.createElement("div", { className: "ds-oc-err" }, errorText(state.error));
        } else {
          body = React.createElement(React.Fragment, null,
            GROUPS.map((g) => {
              const group = data[g.key];
              // percent 为数字即显示（rate-limited 等状态也有 percent 值）
              const pct = group && typeof group.percent === "number" ? group.percent : null;
              const pctText = pct !== null && pct >= 0 && pct <= 100 ? pct : null;
              return React.createElement("div", {
                className: "ds-oc-row",
                key: g.key,
                onMouseEnter: (e) => {
                  try {
                    const r = e.currentTarget.getBoundingClientRect();
                    const vw = window.innerWidth || 800;
                    const vh = window.innerHeight || 600;
                    let left = r.left;
                    let top = r.bottom + 6;
                    if (left > vw - 190) left = vw - 190;
                    if (left < 8) left = 8;
                    if (top > vh - 112) top = r.top - 112;
                    if (top < 8) top = 8;
                    setOcTip({ left, top, key: g.key });
                  } catch (err) { /* ignore */ }
                },
                onMouseLeave: () => setOcTip(null),
              },
                React.createElement("span", { className: "ds-oc-label" }, g.label),
                React.createElement("div", { className: "ds-oc-track" },
                  React.createElement("div", {
                    className: "ds-oc-fill " + fillClass(pctText),
                    style: { width: (pctText !== null ? Math.max(2, Math.min(100, pctText)) : 0) + "%" },
                  }),
                ),
                React.createElement("span", { className: "ds-oc-pct" }, fmtPct(pct)),
              );
            }),
            React.createElement("a", {
              className: "ds-oc-link",
              href: "https://opencode.ai/workspace/wrk_01KZCZ6CNQYFV2E8YF5FP1DRMQ/go",
              target: "_blank",
              rel: "noopener noreferrer",
            }, "Go 使用量 >"),
          );
        }

        const main = React.createElement("div", { className: "ds-oc-main" },
          React.createElement("div", { className: "ds-oc-head" },
            React.createElement("span", { className: "ds-oc-title" }, "OpenCode Go用量"),
            React.createElement("span", { className: "ds-oc-actions" },
              React.createElement("button", {
                className: "ds-oc-btn",
                title: "已保存的 API Key（点击切换）",
                onClick: (e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  let left = r.right - 176;
                  left = Math.max(8, Math.min(left, (window.innerWidth || 800) - 184));
                  setMenuPos({ left, top: r.bottom + 6 });
                  setMenuOpen((v) => !v);
                },
              }, React.createElement(ThreeDotsIcon)),
              React.createElement("button", {
                className: "ds-oc-btn",
                title: "API Key 设置",
                onClick: openSettings,
              }, React.createElement(GearIcon)),
              React.createElement("button", { className: "ds-oc-btn", title: "刷新", onClick: load }, React.createElement(RefreshIcon)),
              React.createElement("button", {
                className: "ds-oc-btn",
                title: "收起为长条",
                onClick: () => setWinState("strip"),
              }, React.createElement(ChevronDown)),
              React.createElement("button", {
                className: "ds-oc-btn",
                title: "收起为小窗口",
                onClick: () => { setFromStrip(false); setWinState("chip"); },
              }, React.createElement(ChevronLeft)),
            ),
          ),
          body,
        );

        const stripBody = React.createElement("div", { className: "ds-oc-strip-body" },
          React.createElement("span", { className: "ds-oc-strip-info" },
            React.createElement("span", null, "Opencode"),
            React.createElement("span", { className: "ds-oc-strip-data" }, stripPcts.join("\u00A0\u00A0")),
          ),
          React.createElement("span", { className: "ds-oc-actions" },
            React.createElement("button", {
              className: "ds-oc-btn",
              title: "展开为大窗口",
              onClick: () => setWinState("big"),
            }, React.createElement(ChevronUp)),
            React.createElement("button", {
              className: "ds-oc-btn",
              title: "收起为小窗口",
              onClick: () => { setFromStrip(true); setWinState("chip"); },
            }, React.createElement(ChevronLeft)),
          ),
        );

        return React.createElement(React.Fragment, null,
          React.createElement("div", {
            ref: bindStackWin,
            className: "ds-oc" + darkClass + " ds-oc-state-" + winState + (fromStrip ? " ds-oc-from-strip" : ""),
          },
            main,
            stripBody,
          ),
          React.createElement("button", {
            ref: bindStackChip,
            className: "ds-oc-chip" + darkClass,
            title: "OpenCode Go 用量，点击展开",
            onClick: () => { setFromStrip(false); setWinState("big"); },
          }, chipLabel),
          menuOpen ? React.createElement(React.Fragment, null,
            React.createElement("div", { className: "ds-key-backdrop", onClick: () => setMenuOpen(false) }),
            React.createElement("div", {
              className: "ds-key-menu" + (store.dark ? " ds-key-dark" : ""),
              style: { left: menuPos.left + "px", top: menuPos.top + "px" },
            },
              keys.length === 0 ? React.createElement("div", { className: "ds-key-empty" }, "暂无已保存的 Key，点齿轮添加") : null,
              keys.map((k, i) => React.createElement("button", {
                key: i,
                className: "ds-key-item" + (i === activeKey ? " ds-key-active" : ""),
                title: k,
                onClick: () => switchKey(i),
              },
                React.createElement("span", { className: "ds-key-mask" }, maskKey(k)),
                i === activeKey ? React.createElement("span", { className: "ds-key-check" }, "✓") : null,
              )),
              keyReady === true ? React.createElement("button", {
                className: "ds-key-item ds-key-sys" + (activeKey === -1 ? " ds-key-active" : ""),
                onClick: () => switchKey(-1),
              },
                React.createElement("span", { className: "ds-key-mask" }, "本机配置（" + keyReadySource + "）"),
                activeKey === -1 ? React.createElement("span", { className: "ds-key-check" }, "✓") : null,
              ) : null,
            ),
          ) : null,
          settingsOpen ? React.createElement("div", {
            className: "ds-set-modal",
            onClick: (e) => { if (e.target === e.currentTarget) setSettingsOpen(false); },
          },
            React.createElement("div", { className: "ds-set-card" + darkClass },
              React.createElement("div", { className: "ds-set-title-row" },
                React.createElement("div", { className: "ds-set-title" }, "API Key 设置"),
                React.createElement("button", {
                  className: "ds-set-add",
                  title: "新增一个 API Key",
                  onClick: () => setDraftKeys((d) => [...d, ""]),
                }, "+新增key"),
              ),
              React.createElement("div", { className: "ds-set-label" }, "API key（可多个，用窗口右上角 ··· 切换）"),
              draftKeys.map((k, i) => React.createElement("div", { className: "ds-set-row", key: i },
                React.createElement("input", {
                  className: "ds-set-input",
                  type: "text",
                  value: k,
                  placeholder: "sk-...",
                  onChange: (e) => {
                    const d = draftKeys.slice();
                    d[i] = e.target.value;
                    setDraftKeys(d);
                    scheduleAutosave(d);
                  },
                  onKeyDown: (e) => { if (e.key === "Enter") saveKeys(); },
                }),
                React.createElement("button", {
                  className: "ds-set-del",
                  title: "删除此 Key",
                  onClick: () => {
                    const d = draftKeys.filter((_, j) => j !== i);
                    setDraftKeys(d);
                    scheduleAutosave(d);
                  },
                }, "✕"),
              )),
              keyHint !== "" ? React.createElement("div", {
                className: keyHint.indexOf("失败") !== -1 ? "ds-set-hint-err" : "ds-set-hint",
              }, keyHint) : null,
              keys.length === 0 && keyReady === true ? React.createElement("div", { className: "ds-set-hint" },
                "已经读取本机配置（" + keyReadySource + "），无需填写",
              ) : (keys.length > 0 ? React.createElement("div", { className: "ds-set-hint" },
                "已保存 " + keys.length + " 个 API key，当前使用第 " + (activeKey >= 0 ? (activeKey + 1) : "—") + " 个（··· 菜单切换）",
              ) : null),
              React.createElement("div", { className: "ds-set-actions" },
                React.createElement("button", { className: "ds-set-btn", onClick: closeSettings }, "关闭"),
                React.createElement("button", { className: "ds-set-btn", onClick: cancelSettings }, "取消"),
                React.createElement("button", { className: "ds-set-btn ds-set-btn-primary", onClick: saveKeys }, "保存"),
              ),
            ),
          ) : null,
          ocTip ? (() => {
            const g = GROUPS.find((x) => x.key === ocTip.key) || GROUPS[0];
            const grp = data && data[g.key] ? data[g.key] : null;
            const p = grp && typeof grp.percent === "number" ? grp.percent : null;
            const pct = p !== null && p >= 0 && p <= 100 ? fmtPct(p) : "--%";
            const rAt = grp && grp.resetsAt ? grp.resetsAt : null;
            const dur = rAt ? durText(new Date(rAt).getTime() - nowTick) : "--";
            const tm = resetTimeText(g.key, rAt);
            return React.createElement("div", {
              className: "ds-oc-tip" + (store.dark ? " ds-oc-tip-dark" : ""),
              style: { left: ocTip.left + "px", top: ocTip.top + "px" },
            },
              React.createElement("div", { className: "ds-oc-tip-line" }, g.label + "用量 " + pct),
              React.createElement("div", { className: "ds-oc-tip-line" }, "重置于 " + dur),
              React.createElement("div", { className: "ds-oc-tip-line" }, "重置时间 " + tm),
            );
          })() : null,
        );
      }

      // ---- 渲染：直接挂到 body 的低层级容器（z-index 2）----
      // 不挂 shell.overlay：兼容模式宿主 overlayLayer(z20) 正常，但高级模式宿主
      // .dshDesktopOverlay 是 z-index 1000，会把窗口抬到所有 dsh 浮层之上。
      // body 级 z-index 2 在两种模式下都低于 dsh 全部浮层（20/30/100/1000）。
      const ReactDOM = require("react-dom");
      const host = document.createElement("div");
      host.dataset.plugin = "@magiczerowxy/dsh-ocgo-usage";
      host.style.cssText = "position: fixed; inset: 0; z-index: 2; pointer-events: none;";
      document.body.appendChild(host);
      const uiRoot = ReactDOM.createRoot(host);
      uiRoot.render(React.createElement(UsageWindow));

      ctx.effect(() => () => {
        try { uiRoot.unmount(); } catch (err) { /* ignore */ }
        try { host.remove(); } catch (err) { /* ignore */ }
        try { style.remove(); } catch (err) { /* ignore */ }
        try { if (frameObs !== null) { frameObs.disconnect(); frameObs = null; } } catch (err) { /* ignore */ }
        try { if (frameWaitObs !== null) { frameWaitObs.disconnect(); frameWaitObs = null; } } catch (err) { /* ignore */ }
        stopFollow();
        try { if (stackObs !== null) { stackObs(); stackObs = null; } } catch (err) { /* ignore */ }
        try { if (stackDocObs !== null) { stackDocObs.disconnect(); stackDocObs = null; } } catch (err) { /* ignore */ }
      }, "dsh-ocgo-usage: ui");
    }

    return { apply, inject };
  },
});
