# 选择和配置 Provider

Provider 负责连接模型服务。更换 Provider 后，仍然通过 `Model` 和 `Agent` 使用相同的消息与工具接口。

## 内置 Provider

| 类 | `name` | 当前接入方式 | 可选配置 |
| --- | --- | --- | --- |
| `OpenAIProvider` | `"openai"` | OpenAI Responses API | `reasoning`、`maxOutputTokens` |
| `ClaudeProvider` | `"claude"` | Anthropic Messages API | `thinking`、`maxOutputTokens` |
| `DeepSeekProvider` | `"deepseek"` | 使用 OpenAI SDK 调用 DeepSeek Responses 接口 | 无第三个配置参数 |

以下示例只创建 Model。将选用的 `model` 传给 `new Agent({ model })` 即可运行。

## OpenAI

```ts
import { Model, OpenAIProvider } from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
  // 可选：限制本次模型生成的输出长度。
  { maxOutputTokens: 2048 },
));
```

`maxOutputTokens` 映射为 `max_output_tokens`，省略时由服务决定。Provider 固定发送 `store: false`。

`reasoning` 使用底层 SDK 的配置类型。需要推理摘要时，可以在支持该能力的模型上设置 `{ reasoning: { summary: "auto" } }`。当前适配器从摘要提取 `reasoning` 与 `reasoning_delta`，未配置摘要时不一定有推理内容可读。

## Claude

先设置 `ANTHROPIC_API_KEY` 和 `ANTHROPIC_MODEL` 环境变量，再创建 Provider：

```ts
import { ClaudeProvider, Model } from "@yong_xie/lighter";

const model = new Model(new ClaudeProvider(
  process.env.ANTHROPIC_API_KEY!,
  process.env.ANTHROPIC_MODEL!,
  {
    maxOutputTokens: 8192,
    // 仅用于支持此配置的模型；预算必须小于输出上限。
    thinking: { type: "enabled", budget_tokens: 2048 },
  },
));
```

`maxOutputTokens` 默认 `8192`，必须是正的安全整数。显式启用 `thinking` 时，`budget_tokens` 必须是至少 `1024` 且小于输出上限的安全整数；不满足时，构造函数立即抛出 `ModelError`。

不需要思考配置时，省略 `thinking`。具体选项是否可用取决于所选模型。

## DeepSeek

先设置 `DEEPSEEK_API_KEY` 环境变量：

```ts
import { DeepSeekProvider, Model } from "@yong_xie/lighter";

const model = new Model(new DeepSeekProvider(
  process.env.DEEPSEEK_API_KEY!,
  // 当前构造参数的类型接受此 ID 和 deepseek-v4-pro。
  "deepseek-flash",
));
```

当前实现将地址固定为 `https://api.deepseek.com`，通过 SDK 的 `responses.create()` 发起请求。构造参数的模型 ID 限定为 `"deepseek-flash" | "deepseek-v4-pro"`。

以上描述的是当前代码适配方式与类型限制，不代表所有账号或真实服务请求都已通过兼容性验证。内置 Provider 的测试使用模拟 HTTP，不访问真实模型服务。

## 历史与推理上下文

OpenAI 和 Claude 会在返回的消息中保留原生响应信息，供后续请求重放。只有原始消息及相关内容未被修改时，才能沿用这条路径。

克隆、替换、序列化后重建或修改助手消息，会改为根据公开字段重建请求，可能丢失原生推理上下文。尤其是 Claude 的签名思考块，不能从 `reasoning` 文本重建，后续工具结果请求可能因此失败。

切换 Provider 时，统一接口可以继续使用；原有历史中的 Provider 特有上下文不保证跨服务兼容。

完整签名见 [Model 与 Provider API](../reference/model-and-providers.md)。接入其他服务见[自定义 Provider](custom.md)。

[← 处理错误](../guides/errors.md) · [下一步：自定义 Provider →](custom.md)
