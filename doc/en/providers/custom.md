# Custom providers

Implement the `Provider` interface and pass it to `new Model(provider)` to connect another model service. Agent does not need to know the service's specific API.

## Minimal implementation

This `EchoProvider` repeats the latest user message without making a network request. Save it as `echo.ts` and run it using the [quickstart](../getting-started/quickstart.md) instructions. No API key is needed.

```ts
import {
  Agent, AssistantMessage, Model, ModelError, UserMessage,
  type Provider, type ProviderRequest, type ProviderStreamEvent,
} from "@yong_xie/lighter";

export class EchoProvider implements Provider {
  readonly name = "echo";

  async invoke(request: ProviderRequest): Promise<AssistantMessage> {
    // This example supports text only. Reject unsupported capabilities explicitly.
    if (request.toolSpecs?.length) {
      throw new ModelError("EchoProvider does not support tools.", "invalid_request");
    }

    const lastUser = [...request.messages].reverse()
      .find((message) => message.role === "user");
    return new AssistantMessage(`Received: ${lastUser?.content ?? ""}`);
  }

  async *stream(request: ProviderRequest): AsyncGenerator<ProviderStreamEvent> {
    const message = await this.invoke(request);
    // Simulate a text delta. A real provider should forward text as it arrives.
    yield { type: "text_delta", text: message.content };
    // Yield the complete assistant message last so Agent can advance the loop.
    yield { type: "message", message };
  }
}

const agent = new Agent({ model: new Model(new EchoProvider()) });
const result = await agent.run({ messages: [new UserMessage("The moon bookstore is open!")] });
console.log(result.messages);
```

## Connect a real service

| Part | What to implement |
| --- | --- |
| `name` | Provide a stable service identifier |
| `invoke()` | Convert input messages and tool definitions, then return a complete `AssistantMessage` |
| `stream()` | Forward text and optional reasoning deltas, then yield one complete `message` event |
| Tool calls | Convert service calls to `callId`, `toolName`, and JSON-string `arguments` |
| Tool results | Convert `ToolMessage` to the matching call result, preserving the call ID and error information |
| Errors | Detect failed or incomplete responses and throw an appropriate `ModelError` |

Providers handle communication and format conversion only. Agent executes tools. Do not store mutable history for an individual conversation in a shared Provider.

## Stream completion rules

`text_delta` and `reasoning_delta` are incremental events, not substitutes for the final `message`. If a stream ends without a complete message, Agent produces a `bad_response` failure.

Calling Model's stream directly does not add this validation. Custom providers should therefore also check whether the service ended normally rather than treating a dropped connection as success.

## Validate your integration

At a minimum, test ordinary replies, tool-call/result round trips, streaming deltas and completion events, service failures, and interrupted streams. When supporting tools, also check that IDs and arguments remain complete when a response contains multiple tool calls.

See [Model and Provider API](../reference/model-and-providers.md) for interface signatures.

[← Built-in providers](index.md) · [Next: use Model directly →](../advanced/model.md)
