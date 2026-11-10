# Configure an agent

Only `model` is required when creating an Agent. Add tools, a system prompt, and lifecycle hooks as needed.

## Set a system prompt

This example uses the environment variables and runner from the [quickstart](../getting-started/quickstart.md):

```ts
import {
  Agent, Model, OpenAIProvider, SystemMessage, UserMessage,
} from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

const agent = new Agent({
  model,
  // Set the role, task scope, and response style with SystemMessage.
  systemPrompt: new SystemMessage("You are a bookstore advisor. Answer questions briefly in English."),
});

const result = await agent.run({
  // Put the question for each run in messages.
  messages: [new UserMessage("Suggest three events for a bookstore on the moon.")],
});

console.log(result);
```

If you omit `systemPrompt`, the default is `You are a helpful assistant.` A custom value replaces this default.

Agent automatically prepends the system prompt to the context for each run. You do not need to add it again when maintaining conversation history.

## Where configuration belongs

| Setting | Where to configure it |
| --- | --- |
| API key, model ID, provider-specific options | Provider constructor |
| Model, tools, system prompt, hooks | `new Agent({ ... })` |
| User messages and existing conversation history | `run({ messages })` or `stream({ messages })` |

You cannot currently override the model or tools in an individual Agent request. Create another Agent when you need a different configuration.

## Extend as needed

- Use [Tool](tools.md) to let an agent run your functions.
- Use [Hook](hooks.md) to observe or modify a run.
- Adjust output length, reasoning, and other options in the [provider configuration](../providers/index.md).

See [Agent API](../reference/agent.md) for all parameters.

[← Core concepts](../getting-started/concepts.md) · [Next: add tools →](tools.md)
