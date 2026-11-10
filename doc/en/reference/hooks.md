# Hooks API

All four hook classes share the same construction pattern. For a working example, see [lifecycle hooks](../guides/hooks.md).

## Shared constructor parameters

`new BeforeModelHook({ hookName, description?, hookFunction })`

The other hook classes accept the same three fields:

| Field | Required | Description |
| --- | --- | --- |
| `hookName: string` | Yes | Hook identifier; also a public readonly instance property |
| `description?: string` | No | Description; also a public readonly instance property |
| `hookFunction` | Yes | Callback, with the types listed below |

## Callback types

| Class | Input | Allowed return values |
| --- | --- | --- |
| `BeforeAgentHook` | `AgentRequest` | `AgentRequest \| void \| Promise<AgentRequest \| void>` |
| `BeforeModelHook` | `ModelRequest` | `ModelRequest \| void \| Promise<ModelRequest \| void>` |
| `AfterModelHook` | `AssistantMessage` | `AssistantMessage \| void \| Promise<AssistantMessage \| void>` |
| `AfterAgentHook` | `BaseMessages` | `BaseMessages \| void \| Promise<BaseMessages \| void>` |

All callbacks are awaited. Returning `undefined` preserves the current value; returning a replacement uses it instead. The implementation currently uses nullish coalescing, but the types do not permit returning `null`.

`AfterAgentHook` receives and returns a message array, not a complete `AgentResponse`.

## `execute()`

| Class | Public method |
| --- | --- |
| `BeforeAgentHook` | `execute(request: AgentRequest): Promise<AgentRequest>` |
| `BeforeModelHook` | `execute(request: ModelRequest): Promise<ModelRequest>` |
| `AfterModelHook` | `execute(message: AssistantMessage): Promise<AssistantMessage>` |
| `AfterAgentHook` | `execute(messages: BaseMessages): Promise<BaseMessages>` |

Agent or Model calls these methods automatically. When you call them directly, callback exceptions propagate to the caller.

## Timing and failures

- `beforeAgent`: once at the start of each run, before Agent adds its system prompt.
- `beforeModel`: before every model request, including calls after tool results.
- `afterModel`: after each complete assistant message, before Agent executes its tool calls. Streaming deltas do not pass through this hook.
- `afterAgent`: currently once after the loop completes successfully, before Agent wraps the final result.

Agent catches hook exceptions and returns or yields a failed result. Model-hook exceptions propagate when calling Model directly. `afterAgent` is currently skipped on model failure or early stream termination, so do not rely on it for guaranteed resource cleanup.

## Example

```ts
import { AfterAgentHook, AssistantMessage } from "@yong_xie/lighter";

const appendNotice = new AfterAgentHook({
  hookName: "append-notice",
  hookFunction: (messages) => [
    ...messages,
    // Return a message array for messages in the final Agent response.
    new AssistantMessage("This response is for reference only."),
  ],
});
```

Pass this instance to `new Agent({ model, hooks: { afterAgent: appendNotice } })`. This hook affects only the final returned messages. It does not trigger another model call or send the added content as a stream delta.

[← Tool API](tools.md) · [Next: Errors API →](errors.md)
