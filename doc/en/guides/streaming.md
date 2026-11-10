# Stream responses

Use `stream()` instead of `run()` to receive text as the model generates it. Both methods execute the same tool loop.

## Receive text and the final result

This example uses the environment variables and runner from the [quickstart](../getting-started/quickstart.md):

```ts
import { Agent, Model, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));
const agent = new Agent({ model });

for await (const event of agent.stream({
  messages: [new UserMessage("Describe a bookstore on the moon in three sentences.")],
})) {
  // The final result has status, unlike incremental events.
  if ("status" in event) {
    process.stdout.write("\n");
    if (event.status === "failed") {
      console.error("Run failed:", event.error);
      process.exitCode = 1;
    }
    // Use complete messages from the final result when saving history.
    console.log(event.messages);
  } else if (event.type === "text_delta") {
    process.stdout.write(event.text);
  }
}
```

## Events you receive

| Content | Shape | Purpose |
| --- | --- | --- |
| Text delta | `{ type: "text_delta", text }` | Display the reply incrementally |
| Reasoning delta | `{ type: "reasoning_delta", text }` | Display reasoning content or summaries provided by the provider; not always available |
| Final result | `{ status, messages, error? }` | Check completion and read complete messages or the failure cause |

The final result is yielded, so a `for await` loop receives it when the stream is consumed to completion. Agent consumes the provider's `message` event internally rather than forwarding it as a separate event.

With tools, text deltas may come from different model rounds. Tool messages and complete assistant messages are all included in the final result. Do not append the final reply text again to text you have already displayed incrementally.

## Failures and early stopping

If the stream is interrupted, Agent produces a failed result that preserves completed messages from the run. Partial text that has not become a complete message is not included in `messages`.

Use `break` to stop consuming the stream. This closes the iterator and prevents subsequent tool and model calls. You will not receive a final result after stopping early, and this does not cancel tools already running.

The `afterModel` hook processes the complete assistant message. If it modifies the reply, the final message may differ from the deltas already displayed.

[← Conversation history](conversations.md) · [Next: lifecycle hooks →](hooks.md)
