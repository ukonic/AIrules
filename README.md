# Clash Verge Rev AI 分流

`ClashVergeRev-AI.js` 是用于 Clash Verge Rev（Mihomo 内核）的订阅扩展脚本。它优先匹配五份 AI 规则，将命中的连接交给手动选择的美国节点。

[打开脚本的 GitHub Raw 地址](https://raw.githubusercontent.com/ukonic/AIrules/main/ClashVergeRev-AI.js)

## 使用方法

1. 在 Clash Verge Rev 的「订阅」页导入并选中机场订阅。
2. 右键目标订阅，打开「编辑扩展脚本」或「扩展脚本」，粘贴 Raw 页面中的完整脚本并保存。要应用到所有订阅，可粘贴到「全局扩展脚本」。
3. 刷新或重新选中该订阅。切换到「规则」模式，在「代理」页查看策略组。默认优先显示 `🔰 手动选择`、`🤖 AI`、`🇺🇸 美国节点`、`🔍 Google`。
4. 在「代理」页展开 `🇺🇸 美国节点`，点选要使用的节点。规则提供者的下载状态可在规则页或内核日志中查看。

## 让 AI 和 Google 共用美国节点

如果订阅已有名为 `🔍 Google` 的手动选择组，脚本会在它的可选项中加入 `🇺🇸 美国节点`。在「代理 → 🔍 Google」里手动选中它一次，之后只需在 `🇺🇸 美国节点` 里换节点，两个组的流量就会使用同一节点。Google 组的原有选项保留。

## 手动调整策略组顺序

在扩展脚本顶部编辑 `PROXY_GROUP_ORDER`，从上到下填写完整组名，包含表情和空格。比如把两个 AI 组排到「🔰 手动选择」前面：

```javascript
const PROXY_GROUP_ORDER = [
  AI_GROUP,
  US_GROUP,
  "🔰 手动选择",
];
```

可以填写全部组名，也可以只列出想排在前面的组。未列出的组按原有相对顺序排在后面。订阅中没有的组名会跳过，重复填写时以首次出现的位置为准。保存脚本后重新选中订阅。

## 分流架构

| 策略组 | 类型 | 内容 |
| --- | --- | --- |
| `🤖 AI` | `select` | 唯一选项为 `🇺🇸 美国节点` |
| `🇺🇸 美国节点` | `select` | 按名称筛选美国节点，由用户手动切换 |

Mihomo 从订阅内联节点和 `proxy-providers` 中筛选候选，订阅刷新或代理提供者更新后可识别新节点。筛选识别美国旗帜、常见中英文地名及独立的 `US`、`USA` 缩写，也支持 `US01` 等编号形式。流量、剩余、到期、官网、订阅等提示会被排除。名称用于筛选候选，实际出口地区取决于机场节点。

美国节点组已关闭自动测速。首次使用或原选节点被订阅移除时，Mihomo 默认使用候选列表的第一项，更新订阅后可在「代理」页确认当前节点。

美国节点组为空时，`empty-fallback: REJECT` 会拒绝匹配的 AI 流量。请使用支持该字段的 Mihomo 内核，本机验证版本为 v1.19.33。

## 远程规则

按 OpenAI、Claude、BardAI、Gemini、AI-Supplement 的顺序添加五条独立的 `RULE-SET`，统一指向 `🤖 AI`，并放在原订阅规则之前。Mihomo 使用 `http` 提供者下载 YAML，按 `classical` 解析，每 86400 秒更新一次。

| 规则集 | 上游 |
| --- | --- |
| OpenAI | [blackmatrix7 / OpenAI.yaml](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI.yaml) |
| Claude | [blackmatrix7 / Claude.yaml](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml) |
| BardAI | [blackmatrix7 / BardAI.yaml](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/BardAI/BardAI.yaml) |
| Gemini | [blackmatrix7 / Gemini.yaml](https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Gemini/Gemini.yaml) |
| AI-Supplement | [ukonic / AI-Supplement.yaml](https://raw.githubusercontent.com/ukonic/AIrules/main/AI-Supplement.yaml) |

规则提供者使用 `AIrules-` 前缀，遇到不同内容的同名提供者时会选用带编号的名称。若代理节点或代理提供者占用了两个 AI 策略组的名称，脚本会报错，避免输出有命名冲突的配置。

参考 [Clash Verge Rev 自定义脚本文档](https://www.clashverge.dev/guide/script.html)、[Mihomo 代理组通用字段](https://wiki.metacubex.one/config/proxy-groups/)、[Mihomo select](https://wiki.metacubex.one/config/proxy-groups/select/)和 [Mihomo rule-providers](https://wiki.metacubex.one/config/rule-providers/)。
