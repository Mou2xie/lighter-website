# Model 与 Provider API

用法见[直接调用 Model](../advanced/model.md)、[内置 Provider](../providers/index.md)与[自定义 Provider](../providers/custom.md)。

## Model

`new Model(provider: Provider)`

| 成员 | 类型或签名 | 说明 |
| --- | --- | --- |
| `provider` | `readonly Provider` | 构造时传入的 Provider |
| `invoke()` | `invoke(request: ModelRequest, hooks?): Promise<AssistantMessage>` | 一次调用，返回完整助手消息 |
| `stream()` | `stream(request: ModelRequest, hooks?): AsyncGenerator<ProviderStreamEvent>` | 转发 Provider 流式事件 |

`hooks` 是可选对象，可含 `beforeModel?: BeforeModelHook` 和 `afterModel?: AfterModelHook`。两个方法都会等待相应钩子执行；流式 `afterModel` 仅处理完整的 `message` 事件。

Model 不添加默认系统提示词，不执行工具，不维护循环，也不把异常包装为 Agent 结果。Provider 或钩子异常会向调用方抛出。

## 请求类型

`ModelRequest` 是 `ProviderRequest` 的类型别名：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `messages` | `BaseMessages` | 是 | 本次发送的完整上下文 |
| `toolSpecs` | `ToolSpec[]` | 否 | 供模型了解的工具定义；不包含执行函数 |

## Provider 接口

```ts
import type {
  AssistantMessage, ProviderRequest, ProviderStreamEvent,
} from "@yong_xie/lighter";

interface Provider {
  readonly name: string;
  invoke(request: ProviderRequest): Promise<AssistantMessage>;
  stream(request: ProviderRequest): AsyncGenerator<ProviderStreamEvent>;
}
```

调用 Provider 的方法会绕过 Model 钩子。Provider 自身负责识别不完整或失败响应并抛出错误。

## ProviderStreamEvent

| `type` | 其他字段 | 含义 |
| --- | --- | --- |
| `text_delta` | `text: string` | 文本增量 |
| `reasoning_delta` | `text: string` | 推理或摘要增量，按能力与配置提供 |
| `message` | `message: AssistantMessage` | 完整助手消息，包含完整文本及工具调用 |

Provider 的流在正常结束前应产生一次完整 `message` 事件。Agent 会用它推进循环；Model 直接转发，不额外验证是否缺失。

## OpenAIProvider

```text
new OpenAIProvider(apiKey, modelID, options?: OpenAIProviderOptions)
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `apiKey` | `string` | API key |
| `modelID` | OpenAI SDK 的 `ResponseCreateParamsNonStreaming["model"]` 去除空值后的类型 | 模型 ID |
| `options.reasoning` | OpenAI SDK 的 `ResponseCreateParamsNonStreaming["reasoning"]` | 推理选项，可省略 |
| `options.maxOutputTokens` | `number` | 映射为 `max_output_tokens`，可省略 |

`options` 默认 `{}`，`name` 为 `"openai"`，使用 Responses API，固定发送 `store: false`。推理文本来自摘要，原生上下文的保留规则见 [Provider 指南](../providers/index.md)。

## ClaudeProvider

```text
new ClaudeProvider(apiKey: string, modelID: string, options?: ClaudeProviderOptions)
```

| 选项 | 类型 | 默认值或约束 |
| --- | --- | --- |
| `maxOutputTokens` | `number` | 默认 `8192`，必须是正的安全整数 |
| `thinking` | Anthropic SDK 的 `MessageCreateParamsNonStreaming["thinking"]` | 默认不传入；能力取决于模型 |

`options` 默认 `{}`，`name` 为 `"claude"`。`thinking.type` 为 `"enabled"` 时，`budget_tokens` 必须是至少 `1024` 且小于 `maxOutputTokens` 的安全整数，否则构造时抛出 `ModelError("...", "invalid_request")`。

系统消息被合并到请求的 `system` 字段。当前接受 `end_turn`、`tool_use`、`stop_sequence`、`refusal` 结束原因；其他结束原因作为 `bad_response` 抛出，并在 `responseStatus` 中保留，包括达到输出上限、`pause_turn` 等情况。

## DeepSeekProvider

```text
new DeepSeekProvider(apiKey: string, modelID: "deepseek-flash" | "deepseek-v4-pro")
```

`name` 为 `"deepseek"`。地址固定为 `https://api.deepseek.com`，使用 OpenAI SDK 的 Responses 接口，没有公开的第三个选项参数。

模型 ID 类型描述的是当前代码接受的值，不能作为真实服务兼容性的证明。

三个内置 Provider 均实现相同的 `invoke()` 与 `stream()`。`OpenAIProviderOptions` 和 `ClaudeProviderOptions` 是公开导出类型；内部模型 ID 类型别名不单独导出。

[← Agent API](agent.md) · [下一页：Messages API →](messages.md)
