# @magiczerowxy/dsh-ocgo-usage

OpenCode Go 订阅用量浮窗 for DeepSeek Harness web GUI：悬浮窗显示滚动/周/月用量进度条，每 5 分钟自动刷新。

An OpenCode Go subscription quota widget for the DeepSeek Harness web GUI: a floating window showing rolling/weekly/monthly usage with progress bars, refreshed every 5 minutes.

## 功能 Features

- **用量浮窗**：显示 OpenCode Go 的滚动、周、月配额用量进度条
- **自动刷新**：每 5 分钟自动查询；可手动刷新
- **API Key 管理**：在浮窗中保存/清除 `OPENCODE_API_KEY`（经 DSH credentials 服务持久化，重启不丢失，不回传密钥值）
- **状态提示**：未配置 Key / 请求失败等状态清晰提示

## 安装 Install

包已发布到 npm（`@magiczerowxy/dsh-ocgo-usage`），用官方 `dsh plugin` 命令安装：

```bash
dsh plugin --profile <profile> add @magiczerowxy/dsh-ocgo-usage
```

> `<profile>` 换成你自己的 profile 名：桌面版用 `desktop`，Web 版用 `web`，不带 `--profile` 操作默认 profile。
> 命令会自动把包写入 profile 依赖，并因声明了 `dsh.bundle` 自动加入 layer stack。

## 配置 API Key

两种方式任选其一：

1. **环境变量**：设置 `OPENCODE_API_KEY=xxx` 后重启 DSH
2. **浮窗内保存**：点击浮窗 → 填入 Key → 保存（写入 `~/.dsh/.credentials.yaml`）

## 卸载 Uninstall

```bash
dsh plugin --profile <profile> remove @magiczerowxy/dsh-ocgo-usage
```

## 结构 Structure

```
dsh-ocgo-usage/
├── lib/
│   ├── index.js    # Host 半区：/api/dsh-ocgo-usage/* 路由（查询、Key 保存/清除）
│   └── client.js   # Client 半区：浮窗 UI + 进度条 + 自动刷新
├── cordis.patch.yml  # bundle patch（entry id: ocgo-usage）
└── package.json
```

## License

MIT
