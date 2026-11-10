# Choose and configure a provider

Providers connect to model services. After switching providers, you still use the same message and tool interfaces through `Model` and `Agent`.

## Built-in providers

| Class | `name` | Current integration | Optional configuration |
| --- | --- | --- | --- |
| `OpenAIProvider` | `"openai"` | OpenAI Responses API | `reasoning`, `maxOutputTokens` |
| `ClaudeProvider` | `"claude"` | Anthropic Messages API | `thinking`, `maxOutputTokens` |
| `DeepSeekProvider` | `"deepseek"` | DeepSeek Responses interface through the OpenAI SDK | No third configuration argument |

The following examples create a Model only. Pass your chosen `model` to `new Agent({ model })` to use it in an agent.

## OpenAI

```ts
import { Model, OpenAIProvider } from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
  // Optional: limit the output length of this model call.
  { maxOutputTokens: 2048 },
));
```

`maxOutputTokens` maps to `max_output_tokens`. If omitted, the service decides the limit. The provider always sends `store: false`.

`reasoning` uses the underlying SDK's configuration type. To request a reasoning summary, set `{ reasoning: { summary: "auto" } }` with a model that supports it. The adapter extracts `reasoning` and `reasoning_delta` from summaries; reasoning content may not be available when a summary is not configured.

## Claude

Set `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`, then create the provider:

```ts
import { ClaudeProvider, Model } from "@yong_xie/lighter";

const model = new Model(new ClaudeProvider(
  process.env.ANTHROPIC_API_KEY!,
  process.env.ANTHROPIC_MODEL!,
  {
    maxOutputTokens: 8192,
    // Use only with models that support this configuration; the budget must be below the output limit.
    thinking: { type: "enabled", budget_tokens: 2048 },
  },
));
```

`maxOutputTokens` defaults to `8192` and must be a positive safe integer. When explicitly enabling `thinking`, `budget_tokens` must be a safe integer of at least `1024` and less than the output limit. Otherwise, the constructor immediately throws `ModelError`.

Omit `thinking` when you do not need it. Option availability depends on the selected model.

## DeepSeek

Set `DEEPSEEK_API_KEY` first:

```ts
import { DeepSeekProvider, Model } from "@yong_xie/lighter";

const model = new Model(new DeepSeekProvider(
  process.env.DEEPSEEK_API_KEY!,
  // The current constructor type accepts this ID and deepseek-v4-pro.
  "deepseek-flash",
));
```

The current implementation fixes the base URL to `https://api.deepseek.com` and calls the SDK's `responses.create()`. The constructor's model ID type is limited to `"deepseek-flash" | "deepseek-v4-pro"`.

These details describe the current adapter and type constraints. They do not establish compatibility for every account or live service request. Built-in provider tests use mocked HTTP rather than real model services.

## History and reasoning context

OpenAI and Claude preserve native response information on returned messages for replay in later requests. This path is available only while the original messages and their relevant contents remain unchanged.

Cloning, replacing, reconstructing serialized messages, or modifying assistant messages causes requests to be rebuilt from public fields instead, which may lose native reasoning context. In particular, Claude's signed thinking blocks cannot be reconstructed from `reasoning` text, and subsequent tool-result requests may fail.

The shared interface remains available when switching providers, but provider-specific context in existing history is not guaranteed to work across services.

See [Model and Provider API](../reference/model-and-providers.md) for complete signatures. To connect another service, see [custom providers](custom.md).

[← Error handling](../guides/errors.md) · [Next: custom providers →](custom.md)
