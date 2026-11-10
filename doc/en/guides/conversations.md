# Manage messages and conversation history

Lighter does not automatically save conversations. Pass existing history into each run, then append the new messages from its result to continue the conversation.

## Continue a conversation

This example uses the environment variables and runner from the [quickstart](../getting-started/quickstart.md):

```ts
import {
  Agent, Model, OpenAIProvider, UserMessage, type BaseMessages,
} from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));
const agent = new Agent({ model });
const history: BaseMessages = [new UserMessage("Name a bookstore on the moon.")];

const first = await agent.run({ messages: history });
if (first.status === "failed") throw first.error;

// The result contains only new messages. Append them to preserve context.
history.push(...first.messages);
history.push(new UserMessage("Give me three more names in a similar style."));

const second = await agent.run({ messages: history });
if (second.status === "failed") throw second.error;
history.push(...second.messages);

console.log(second.messages);
```

Agent does not append to the input array. Saving only the final reply loses tool calls and results, so preserve all new messages when tools are involved.

## Read messages by role

| `role` | Message type | Main fields |
| --- | --- | --- |
| `system` | `SystemMessage` | System instructions in `content` |
| `user` | `UserMessage` | User input in `content` |
| `assistant` | `AssistantMessage` | Reply `content`, `toolCalls`, and optional `reasoning` |
| `tool` | `ToolMessage` | `toolOutput`, call identifier `callId`, and error flag `isError` |

Tool calls may have no assistant text. Check `role` before reading a message. See [Messages API](../reference/messages.md) for the full field definitions.

## Multiple conversations

One Agent can handle independent runs, but each conversation should have its own history array. Your application must still coordinate concurrent access to shared state in tools, hooks, or application code.

## Persistence and recovery boundaries

Your application can save history to a database. Messages returned by OpenAI and Claude may also carry native context required by subsequent requests. Ordinary JSON serialization, cloning, or recreating messages does not preserve all of that information.

For tool round trips that depend on reasoning context, prefer the original message instances returned by the provider. Persistent recovery needs additional application design: saving `content` and `reasoning` alone does not guarantee that native context can be restored.

[← Add tools](tools.md) · [Next: streaming →](streaming.md)
