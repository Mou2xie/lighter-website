# Model and Provider API

For usage, see [use Model directly](../advanced/model.md), [built-in providers](../providers/index.md), and [custom providers](../providers/custom.md).

## Model

`new Model(provider: Provider)`

| Member | Type or signature | Description |
| --- | --- | --- |
| `provider` | `readonly Provider` | The Provider passed to the constructor |
| `invoke()` | `invoke(request: ModelRequest, hooks?): Promise<AssistantMessage>` | One call returning a complete assistant message |
| `stream()` | `stream(request: ModelRequest, hooks?): AsyncGenerator<ProviderStreamEvent>` | Forwards provider streaming events |

`hooks` is an optional object with `beforeModel?: BeforeModelHook` and `afterModel?: AfterModelHook`. Both methods await the relevant hooks. Streaming `afterModel` processes complete `message` events only.

Model does not add a default system prompt, execute tools, maintain a loop, or wrap exceptions in Agent results. Provider or hook exceptions propagate to the caller.

## Request types

`ModelRequest` is a type alias for `ProviderRequest`:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `messages` | `BaseMessages` | Yes | Complete context for this request |
| `toolSpecs` | `ToolSpec[]` | No | Tool definitions for the model, without execution functions |

## Provider interface

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

Calling Provider methods bypasses Model hooks. The provider is responsible for detecting incomplete or failed responses and throwing errors.

## ProviderStreamEvent

| `type` | Other fields | Meaning |
| --- | --- | --- |
| `text_delta` | `text: string` | Text increment |
| `reasoning_delta` | `text: string` | Reasoning or summary increment, depending on capabilities and configuration |
| `message` | `message: AssistantMessage` | Complete assistant message with full text and tool calls |

A provider stream should yield one complete `message` event before ending normally. Agent uses it to advance the loop. Model forwards it without additional validation for missing messages.

## OpenAIProvider

```text
new OpenAIProvider(apiKey, modelID, options?: OpenAIProviderOptions)
```

| Parameter | Type | Description |
| --- | --- | --- |
| `apiKey` | `string` | API key |
| `modelID` | Non-nullable OpenAI SDK `ResponseCreateParamsNonStreaming["model"]` | Model ID |
| `options.reasoning` | OpenAI SDK `ResponseCreateParamsNonStreaming["reasoning"]` | Optional reasoning configuration |
| `options.maxOutputTokens` | `number` | Optional; maps to `max_output_tokens` |

`options` defaults to `{}` and `name` is `"openai"`. This provider uses the Responses API and always sends `store: false`. Reasoning text comes from summaries. See the [provider guide](../providers/index.md) for native context preservation rules.

## ClaudeProvider

```text
new ClaudeProvider(apiKey: string, modelID: string, options?: ClaudeProviderOptions)
```

| Option | Type | Default or constraint |
| --- | --- | --- |
| `maxOutputTokens` | `number` | Defaults to `8192`; must be a positive safe integer |
| `thinking` | Anthropic SDK `MessageCreateParamsNonStreaming["thinking"]` | Omitted by default; availability depends on the model |

`options` defaults to `{}` and `name` is `"claude"`. When `thinking.type` is `"enabled"`, `budget_tokens` must be a safe integer of at least `1024` and less than `maxOutputTokens`. Otherwise, construction throws `ModelError("...", "invalid_request")`.

System messages are merged into the request's `system` field. The accepted stop reasons are currently `end_turn`, `tool_use`, `stop_sequence`, and `refusal`. Other reasons, including output-limit exhaustion and `pause_turn`, throw `bad_response` and are preserved in `responseStatus`.

## DeepSeekProvider

```text
new DeepSeekProvider(apiKey: string, modelID: "deepseek-flash" | "deepseek-v4-pro")
```

`name` is `"deepseek"`. The base URL is fixed to `https://api.deepseek.com`. This provider uses the OpenAI SDK's Responses interface and exposes no third options argument.

The model ID type describes values accepted by the current code. It does not establish compatibility with the live service.

All three built-in providers implement the same `invoke()` and `stream()` interface. `OpenAIProviderOptions` and `ClaudeProviderOptions` are public exported types. Internal model-ID type aliases are not exported separately.

[← Agent API](agent.md) · [Next: Messages API →](messages.md)
