# Runtime limits and application responsibilities

Lighter handles the core loop between the model and tools. Your application adds storage, execution limits, permissions, and monitoring as needed.

## Current boundaries

| Requirement | Current behavior |
| --- | --- |
| Conversation persistence and history trimming | The application maintains and supplies history |
| Maximum number of model calls | No built-in limit; use application logic or hooks |
| Request timeouts and cancellation | No extra unified control interface; behavior depends on the underlying SDK |
| Automatic retries | No Lighter-specific retry policy; the underlying SDK may retry |
| Parallel tool execution | Tools are currently awaited sequentially |
| Tool isolation and permissions | Tools run with application permissions; no built-in sandbox |
| Logging, tracing, and usage statistics | No built-in monitoring panel or unified usage field; integrate through hooks |

## Limit model calls

The following application-level limit creates a separate counter on every function call, so requests do not interfere with one another:

```ts
import {
  Agent, BeforeModelHook, Model, OpenAIProvider,
  type BaseMessages, type Tool,
} from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

export async function runWithLimit(messages: BaseMessages, tools: Tool[] = []) {
  let calls = 0;
  const beforeModel = new BeforeModelHook({
    hookName: "limit-model-calls",
    hookFunction: () => {
      // Throw before the ninth call; Agent marks this run as failed.
      if (++calls > 8) throw new Error("The limit of 8 model calls has been reached.");
    },
  });

  const agent = new Agent({ model, tools, hooks: { beforeModel } });
  return agent.run({ messages });
}
```

This limits only the number of model calls, not the duration of a request or tool execution. Reaching the limit does not undo side effects from tools that have already run.

## Tool permissions and side effects

Zod validates parameter shape only. Before accessing databases, files, or external services, tools must also check the current user's business permissions.

Run tools in a separate process or service when isolation is required. For side effects such as payments or sending messages, your application designs confirmation flows, idempotency, and audit records.

## Concurrency, stopping, and recovery

Each Agent run has its own message array, but tools, hooks, and application state may be shared. Your application must coordinate access to shared counters, database connections, and mutable data.

Stopping stream consumption prevents subsequent work but does not guarantee cancellation of a tool already running. Failed results preserve completed messages, but do not provide crash recovery or exactly-once side effects.

Persistence also needs to account for provider-native message context. See [conversation history](../guides/conversations.md).

[← Use Model directly](model.md) · [Next: Agent API →](../reference/agent.md)
