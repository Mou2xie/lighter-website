# Use lifecycle hooks

Hooks let you read or modify requests and results at specific points. Use them for logging, input preprocessing, and response checks.

## Log model requests

This example uses the environment variables and runner from the [quickstart](../getting-started/quickstart.md):

```ts
import {
  Agent, BeforeModelHook, Model, OpenAIProvider, UserMessage,
} from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

const logRequest = new BeforeModelHook({
  hookName: "log-model-request",
  hookFunction: (request) => {
    // Runs before every model call, including rounds after tool results.
    console.log("Message count:", request.messages.length);
    // Return nothing to keep the current request.
  },
});

const agent = new Agent({ model, hooks: { beforeModel: logRequest } });
const result = await agent.run({ messages: [new UserMessage("Hello!")] });
console.log(result);
```

## When hooks run

| Configuration | Hook class | Input | Effect of a replacement value |
| --- | --- | --- | --- |
| `beforeAgent` | `BeforeAgentHook` | `AgentRequest` | Replaces input messages for this run |
| `beforeModel` | `BeforeModelHook` | `ModelRequest` | Replaces this model request, including messages and tool definitions |
| `afterModel` | `AfterModelHook` | `AssistantMessage` | Replaces the assistant message used for context and tool execution |
| `afterAgent` | `AfterAgentHook` | `BaseMessages` | Replaces the final array of new messages |

A run calls `beforeAgent` first. Every model round executes `beforeModel → Provider → afterModel`. After the loop completes successfully, `afterAgent` runs.

The request passed to `beforeAgent` does not yet include Agent's system prompt. Context passed to `beforeModel` already includes it.

## Modify a request

Replace `logRequest` from the earlier example with this hook:

```ts
import { BeforeModelHook, SystemMessage } from "@yong_xie/lighter";

const requireEnglish = new BeforeModelHook({
  hookName: "require-english",
  hookFunction: (request) => ({
    ...request,
    // Return a new request with an extra instruction for this model call only.
    messages: [...request.messages, new SystemMessage("Please reply in English.")],
  }),
});
```

All hooks support synchronous or asynchronous functions. Returning `undefined` keeps the current value; returning a new value replaces it. Each configuration field accepts one hook instance. Compose multiple operations within the callback when needed.

## Things to keep in mind

- A hook exception makes Agent return a failed result. When calling Model directly, model-hook exceptions propagate to the caller.
- Currently, `afterAgent` does not run when a model call fails or the stream is stopped early. Put essential resource cleanup in your application's `finally` block.
- Modifying tool definitions in `beforeModel` does not register new executable tools with Agent.
- Separate request arrays do not imply deep copies of message objects. Prefer returning new arrays over mutating shared messages.
- Original OpenAI and Claude assistant messages carry native context. Replacing, cloning, or modifying them may lose reasoning replay information. Preserve original messages when you only need to log them.

See [Hooks API](../reference/hooks.md) for complete callback types.

[← Streaming](streaming.md) · [Next: error handling →](errors.md)
