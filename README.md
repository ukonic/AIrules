# Clash Verge Rev AI 分流

`ClashVergeRev-AI.js` 是用于 Clash Verge Rev（Mihomo 内核）的订阅扩展脚本。它优先匹配五份 AI 规则，将命中的连接交给美国节点测速组。

[打开脚本的 GitHub Raw 地址](https://raw.githubusercontent.com/ukonic/AIrules/main/ClashVergeRev-AI.js)

## 使用方法

1. 在 Clash Verge Rev 的「订阅」页导入并选中机场订阅。
2. 右键目标订阅，打开「编辑扩展脚本」或「扩展脚本」，粘贴 Raw 页面中的完整脚本并保存。要应用到所有订阅，可粘贴到「全局扩展脚本」。
3. 刷新或重新选中该订阅。切换到「规则」模式，在「代理」页确认出现 `🤖 AI` 和 `🇺🇸 美国节点`。
4. 展开美国节点组检查候选列表；规则提供者的下载状态可在规则页或内核日志中查看。

## 分流架构

| 策略组 | 类型 | 内容 |
| --- | --- | --- |
| `🤖 AI` | `select` | 唯一选项为 `🇺🇸 美国节点` |
| `🇺🇸 美国节点` | `url-test` | 按节点名称筛选美国节点，使用 `https://www.gstatic.com/generate_204` 测速，间隔 300 秒，容差 50 ms，`lazy: true` |

Mihomo 从订阅内联节点和 `proxy-providers` 中筛选候选，订阅刷新或代理提供者更新后可识别新节点。筛选识别美国旗帜、常见中英文地名及独立的 `US`、`USA` 缩写，也支持 `US01` 等编号形式。流量、剩余、到期、官网、订阅等提示会被排除。名称用于筛选候选，实际出口地区取决于机场节点。

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

规则提供者使用 `AIrules-` 前缀，遇到不同内容的同名提供者时会选用带编号的名称。脚本会在原位置更新两个同名策略组，并保留原有 DNS、节点、其他策略组、规则提供者及其他规则的相对顺序。若代理节点或代理提供者占用了这两个策略组名称，脚本会报错，避免输出有命名冲突的配置。

参考 [Clash Verge Rev 自定义脚本文档](https://www.clashverge.dev/guide/script.html)、[Mihomo 代理组通用字段](https://wiki.metacubex.one/config/proxy-groups/)、[Mihomo url-test](https://wiki.metacubex.one/config/proxy-groups/url-test/)和 [Mihomo rule-providers](https://wiki.metacubex.one/config/rule-providers/)。
