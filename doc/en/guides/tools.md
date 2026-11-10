# Add tools

Tools let the model call functions you define. You describe the tool and implement its logic; Agent validates arguments, runs the function, and returns the result to the model.

## Define and register a tool

Install Zod to define parameter schemas:

```sh
npm install zod@4
```

This example uses the environment variables and runner from the [quickstart](../getting-started/quickstart.md):

```ts
import { Agent, Model, OpenAIProvider, Tool, UserMessage } from "@yong_xie/lighter";
import * as z from "zod";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

const add = new Tool({
  name: "add",
  description: "Calculate the sum of two numbers.",
  // The schema is sent to the model and used for local validation before execution.
  parametersZodSchema: z.strictObject({ a: z.number(), b: z.number() }),
  // The TypeScript types of a and b are inferred from the schema.
  func: ({ a, b }) => a + b,
});

const agent = new Agent({ model, tools: [add] });
const result = await agent.run({
  messages: [new UserMessage("Use the add tool to calculate 19 + 23.")],
});

// Inspect tool calls, tool results, and the subsequent reply.
console.log(result);
```

When the model requests `add`, Agent executes the function, obtains `42`, and sends the result back so the model can generate a reply. The model decides whether to call a tool.

## Asynchronous tools

`func` can also be asynchronous. This simulated lookup does not access real inventory:

```ts
import { Tool } from "@yong_xie/lighter";
import * as z from "zod";

const getStock = new Tool({
  name: "get_stock",
  description: "Look up stock for the specified book.",
  parametersZodSchema: z.strictObject({ bookId: z.string() }),
  func: async ({ bookId }) => {
    // Replace this with a database query or external API request in your app.
    const stock = await Promise.resolve({ bookId, available: 12 });
    return stock;
  },
});
```

Add `getStock` to the Agent's `tools` to make it available. Multiple tool calls are awaited sequentially; they do not currently run in parallel.

## Arguments, results, and failures

- Names should be unique. Descriptions should explain when and why to use the tool.
- Parameters must use a Zod object schema. After validation, `func` receives the value parsed by Zod.
- Return JSON-serializable values. Successful results are converted to `toolOutput` using `JSON.stringify()`, so string results include JSON quotation marks.
- If a tool is missing, argument JSON is invalid, validation fails, or the function throws, Agent sends the model a tool message with `isError: true` and continues the loop.

A tool failure does not necessarily fail the whole run. The model may retry with different arguments or reply directly. Tools execute with application permissions, so implement business permission checks inside them.

See [Tool API](../reference/tools.md) for all parameters and methods.

[← Configure an agent](configuration.md) · [Next: conversation history →](conversations.md)
