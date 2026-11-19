# Clash Verge Rev 扩展脚本维护规范

## 本对话的维护范围

- 本对话负责 `ClashVergeRev-AI.js` 及相关使用说明和维护规范。动手前先阅读现有脚本和 README，在现有实现上完成需求。
- `.list` 文件和 `AI-Supplement.yaml` 由用户在另一个对话维护。此脚本通过远程 URL 使用 `AI-Supplement.yaml`。Quantumult X 和第三方规则仓库也不属于本对话的维护范围。
- 保留 `main(config, profileName)` 入口。使用客户端支持的 JavaScript，规则下载由 Mihomo 的 `rule-providers` 完成。

## 配置约定

- `🤖 AI` 固定为 `select`，唯一成员为 `🇺🇸 美国节点`。后者固定为 `url-test`，使用 Google 204 地址、300 秒间隔、50 ms 容差和按需测速。未经用户明确要求，保持名称、层级与测速参数。
- 按名称筛选美国节点，排除订阅提示。验证正则在 Mihomo 中的行为，覆盖缩写误匹配、空组和代理提供者。空组必须拒绝流量，并避免策略组循环引用。
- 保持 OpenAI、Claude、BardAI、Gemini 和 AI-Supplement 五份 YAML 独立引用。统一使用 `http`、`classical`、`yaml` 和 86400 秒更新间隔。禁止复制或合并上游规则内容。
- 五条 AI 规则置于原订阅规则之前并指向 `🤖 AI`。重复运行应得到相同结果。同名规则提供者存在冲突时，保留用户的配置。保留 DNS、节点、其他策略组和其他规则。
- 新增内核字段前，核对 Mihomo 官方文档与本机版本的实际支持情况。按需同步 README。

## 验证和发布

1. 运行 `node --check ClashVergeRev-AI.js`，再用样例配置调用 `main(config, profileName)`。
2. 覆盖组创建、同名组更新、节点筛选、空组回退、规则提供者命名冲突、规则前置与去重、重复执行、循环引用和订阅原有配置保留。
3. 检查五个远程地址、YAML 格式、`classical` 类型、更新间隔和 `RULE-SET` 引用关系。
4. 本机有 Mihomo 时，用独立临时目录及生成的样例配置执行 `mihomo -t -d <临时目录> -f <配置文件>`。如需验证候选和空组行为，使用隔离的内核实例或测试订阅。记录无法完成的验证。
5. 验证通过后，使用本机 GitHub 权限提交并推送至 `main`。核对远端提交和 Raw 内容，汇报改动、验证结果、提交记录和最新 Raw 地址。
