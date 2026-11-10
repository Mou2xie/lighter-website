# Messages API

Messages use `role` to identify their purpose. For usage, see [conversation history](../guides/conversations.md).

## SystemMessage and UserMessage

```text
new SystemMessage(content: string)
new UserMessage(content: string)
```

| Class | `role` | Other fields |
| --- | --- | --- |
| `SystemMessage` | `"system"` | `content: string` |
| `UserMessage` | `"user"` | `content: string` |

Both `role` and `content` are readonly properties.

## AssistantMessage

```text
new AssistantMessage(content: string, options?: {
  reasoning?: string;
  toolCalls?: ToolCall[];
})
```

| Field | Type | Default or description |
| --- | --- | --- |
| `role` | `"assistant"` | Fixed role |
| `content` | `string` | Reply text; may be empty for tool calls |
| `reasoning` | `string \| undefined` | Optional reasoning content or summary supplied by the provider |
| `toolCalls` | `ToolCall[]` | Defaults to `[]`; tool calls requested by the model |

These properties are declared readonly, but that does not deeply freeze arrays or their objects. Original messages may also carry provider-specific context. Avoid modifying or cloning them casually.

## ToolCall

| Field | Type | Description |
| --- | --- | --- |
| `callId` | `string` | Identifies the call and matches it to a tool result |
| `toolName` | `string` | Tool name |
| `arguments` | `string` | JSON string containing arguments that have not yet been parsed or validated |

All three fields are readonly. `arguments` is not an argument object: Agent first calls `JSON.parse()`, then passes the result to the tool for validation.

## ToolMessage

```text
new ToolMessage({
  callId: string,
  toolName: string,
  toolOutput: string,
  isError?: boolean,
})
```

| Field | Type | Default or description |
| --- | --- | --- |
| `role` | `"tool"` | Fixed role |
| `callId` | `string` | Matches `ToolCall.callId` |
| `toolName` | `string` | Tool name |
| `toolOutput` | `string` | Output text; successful tool results are JSON-serialized |
| `isError` | `boolean` | Defaults to `false`; `true` means tool execution failed |

All these properties are readonly.

## BaseMessage and BaseMessages

```ts
import type {
  SystemMessage, UserMessage, AssistantMessage, ToolMessage,
} from "@yong_xie/lighter";

type BaseMessage = SystemMessage | UserMessage | AssistantMessage | ToolMessage;
type BaseMessages = BaseMessage[];
```

`BaseMessage` is a type union, not a class you can instantiate.

## Construct messages

This manually constructed tool round trip illustrates the message structure. In normal runs, providers and Agent usually generate assistant and tool messages.

```ts
import {
  AssistantMessage, ToolMessage, UserMessage, type BaseMessages,
} from "@yong_xie/lighter";

const messages: BaseMessages = [
  new UserMessage("Calculate 19 + 23."),
  new AssistantMessage("", {
    toolCalls: [{
      callId: "call_add_1",
      toolName: "add",
      arguments: JSON.stringify({ a: 19, b: 23 }),
    }],
  }),
  // callId links the tool result to the earlier call.
  new ToolMessage({ callId: "call_add_1", toolName: "add", toolOutput: "42" }),
  new AssistantMessage("19 + 23 = 42."),
];

for (const message of messages) {
  // Read toolOutput for tool messages and content for other messages.
  console.log(message.role, message.role === "tool" ? message.toolOutput : message.content);
}
```

[← Model and Provider API](model-and-providers.md) · [Next: Tool API →](tools.md)
