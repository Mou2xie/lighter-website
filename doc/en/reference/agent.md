# Agent API

This page covers Lighter 0.1.0. For usage, see [configure an agent](../guides/configuration.md) and [streaming](../guides/streaming.md).

## Constructor

`new Agent(config: AgentConfig)`

| Setting | Type | Required | Default |
| --- | --- | --- | --- |
| `model` | `Model` | Yes | None |
| `tools` | `Tool[]` | No | `[]` |
| `systemPrompt` | `SystemMessage` | No | `new SystemMessage("You are a helpful assistant.")` |
| `hooks` | Hook configuration object, shown below | No | `{}` |

| `hooks` field | Type |
| --- | --- |
| `beforeAgent` | `BeforeAgentHook` |
| `beforeModel` | `BeforeModelHook` |
| `afterModel` | `AfterModelHook` |
| `afterAgent` | `AfterAgentHook` |

All four hook fields are optional. Each accepts one instance. The constructor only stores configuration; it does not send model requests.

## `run()`

```text
run(request: AgentRequest): Promise<AgentResponse>
```

`AgentRequest` has one required field: `messages: BaseMessages`. Agent combines its system prompt and these messages into context, then runs the loop.

The public `AgentResponse` type is:

```ts
import type { BaseMessages } from "@yong_xie/lighter";

type AgentResponse = {
  status: "completed" | "failed";
  messages: BaseMessages;
  error?: unknown;
};
```

| Field | Behavior |
| --- | --- |
| `status` | `completed` when the loop and final hook succeed; `failed` when a model or hook exception is caught |
| `messages` | New messages only, excluding input history and the automatically prepended system prompt; `afterAgent` can replace this array |
| `error` | The original caught value on failure, typed as `unknown`; it may also be `undefined` |

This type is not a discriminated union with status-specific fields. Even after checking `status`, narrow the type of `error` before using it.

Agent does not append to the input message array, but message objects are not deep-copied. Tool errors are returned to the model through `ToolMessage` and do not directly set the run status to `failed`.

## `stream()`

```text
stream(request: AgentRequest): AsyncGenerator<AgentStreamEvent>
```

Execution starts only when the asynchronous iterator is consumed. When consumed normally to completion, it yields incremental events followed by one `AgentResponse`.

The public type is `AgentStreamEvent = ProviderStreamEvent | AgentResponse`. Although `ProviderStreamEvent` includes a `message` branch, Agent currently consumes that branch internally. The events actually exposed are:

- `{ type: "text_delta", text: string }`
- `{ type: "reasoning_delta", text: string }`, depending on provider and model configuration.
- `{ status, messages, error? }`, the final result of this run.

Use `"status" in event` to identify the final result. Complete assistant and tool messages are included in that result. Partial incremental text is not saved as a complete message.

Stopping iteration early provides no final result and does not guarantee cancellation of tools already running.

## Minimal example

```ts
import { Agent, Model, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

const agent = new Agent({
  model: new Model(new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    process.env.OPENAI_MODEL!,
  )),
});

const result = await agent.run({ messages: [new UserMessage("Hello!")] });
// Check the status before using the new messages.
if (result.status === "completed") console.log(result.messages);
else console.error(result.error);
```

[← Runtime limits](../advanced/limits.md) · [Next: Model and Provider API →](model-and-providers.md)
