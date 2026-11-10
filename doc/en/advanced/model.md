# Use Model directly

Use `Model` directly when you need a single model call or want to control tool execution yourself.

## Get a complete reply

This example uses the environment variables and runner from the [quickstart](../getting-started/quickstart.md):

```ts
import { Model, OpenAIProvider, SystemMessage, UserMessage } from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

try {
  const message = await model.invoke({
    // Model does not add a system prompt; include one when needed.
    messages: [
      new SystemMessage("You are a bookstore advisor. Keep your answers brief."),
      new UserMessage("Name a bookstore on the moon."),
    ],
  });
  console.log(message.content);
} catch (error) {
  // Model throws errors directly instead of returning an AgentResponse with status.
  console.error("Model call failed:", error);
  process.exitCode = 1;
}
```

`invoke()` returns one `AssistantMessage`. If the model requests tools, the calls are in `toolCalls`. Model does not execute tools or start another round automatically.

## Stream a reply

```ts
import { Model, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

try {
  for await (const event of model.stream({ messages: [new UserMessage("Hello!")] })) {
    if (event.type === "text_delta") {
      process.stdout.write(event.text);
    } else if (event.type === "message") {
      // Unlike Agent, Model yields the complete message event directly.
      console.log("\nComplete message:", event.message);
    }
  }
} catch (error) {
  console.error("Streaming failed:", error);
  process.exitCode = 1;
}
```

Model streams `text_delta`, `reasoning_delta`, and `message` events. It does not yield a final `AgentResponse`.

## Tools and hooks

Pass `tool.getSpec()` in the request's `toolSpecs` to describe tools to the model. After receiving a call, your application handles parameter parsing, execution, and the next request. Use Agent to automate these steps.

The second argument of `invoke(request, hooks?)` and `stream(request, hooks?)` accepts `beforeModel` and `afterModel`, just like [Agent's model hooks](../guides/hooks.md). Calling a Provider directly bypasses these hooks.

[← Custom providers](../providers/custom.md) · [Next: runtime limits →](limits.md)
