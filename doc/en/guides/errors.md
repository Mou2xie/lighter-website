# Handle errors

Agent uses `status` to indicate whether a run completed. When a model or hook fails, check the result before reading `error`.

## Check the run result

This example uses the environment variables and runner from the [quickstart](../getting-started/quickstart.md):

```ts
import { Agent, Model, ModelError, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

const agent = new Agent({
  model: new Model(new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    process.env.OPENAI_MODEL!,
  )),
});

const result = await agent.run({ messages: [new UserMessage("Hello!")] });

if (result.status === "failed") {
  // error is unknown. Narrow its type before reading error fields.
  if (result.error instanceof ModelError) {
    console.error(result.error.code, result.error.message);
  } else {
    console.error("Run failed:", result.error);
  }
  // Completed messages may remain here if tools have already run.
  console.log(result.messages);
  process.exitCode = 1;
} else {
  console.log(result.messages);
}
```

Built-in providers classify recognized SDK errors as `ModelError`. Other values thrown by applications or hooks are preserved as-is. They are not guaranteed to be `Error` instances and may even be `undefined`.

## Tool failures and run failures

When a tool is missing, arguments are invalid, or a tool function throws, Agent creates a `ToolMessage` with `isError: true` and lets the model handle it. This does not directly change the run status to `failed`.

Therefore, `completed` means the loop ended normally. It does not guarantee that every tool succeeded or that the answer is correct.

## Preserve completed progress

If the model fails in a later round, the result's `messages` still contains completed assistant and tool messages from this run. Your application can save them before deciding whether to continue.

Keep complete tool-call/result pairs when continuing. Do not rerun the entire task solely because its status is failed: doing so may repeat tools that have already produced side effects.

## Troubleshooting

| Situation | What to check |
| --- | --- |
| `auth_error` | API key and account permissions |
| `invalid_request` | Model ID, parameters, messages, and tool definitions |
| `rate_limit` | Request rate, concurrency, and rate-limit details returned by the service |
| `network_error` | Network, proxy, and service connectivity |
| `bad_response` | Incomplete generation, stream interruption, or unsupported responses |
| Module loading failure | ESM configuration and the TypeScript runner |

Lighter has no independent retry policy. The underlying SDK may implement its own retries. See [Errors API](../reference/errors.md) for all error codes.

Calling `Model` or a Provider directly throws errors. Invalid provider configuration may also throw during construction. Handle these cases with `try/catch` in your application.

[← Lifecycle hooks](hooks.md) · [Next: choose a provider →](../providers/index.md)
