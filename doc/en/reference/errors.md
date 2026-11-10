# Errors API

For usage, see [error handling](../guides/errors.md). Built-in providers use `ModelError` for recognized model-call errors.

## ModelError

```text
new ModelError(message: string, code: ModelErrorCode, options?: {
  httpStatus?: number;
  responseStatus?: string;
})
```

`ModelError` extends `Error` and provides these readonly fields:

| Field | Type | Description |
| --- | --- | --- |
| `name` | `"ModelError"` | Fixed name |
| `code` | `ModelErrorCode` | Unified error category |
| `httpStatus` | `number \| undefined` | HTTP error status returned by the service |
| `responseStatus` | `string \| undefined` | Generation status or stop reason, such as `incomplete` or `max_tokens` |

`message`, `stack`, and related fields are inherited from `Error`. `httpStatus` and `responseStatus` are independent. Network errors may have neither.

## ModelErrorCode

`ModelErrorCode` is a union of these strings:

| Code | Meaning |
| --- | --- |
| `auth_error` | Authentication or access-permission failure |
| `rate_limit` | Service rate limit |
| `invalid_request` | Invalid request format, parameters, model, or related settings |
| `network_error` | Connection or network error |
| `server_error` | Model-service failure |
| `bad_response` | Incomplete, failed, unparseable, or unsupported response |
| `aborted` | Request cancellation or a cancelled status returned by the service |
| `unknown` | SDK error not classified elsewhere |

## Use in a custom provider

```ts
import { ModelError } from "@yong_xie/lighter";

// Example: create and inspect an incomplete-generation error.
const error = new ModelError("The model reached the output limit before generation completed.", "bad_response", {
  responseStatus: "incomplete",
});

console.log(error.code, error.responseStatus, error.message);
```

Custom providers should throw suitable errors when the service fails. Unified categories let applications handle common failures across providers using `code`.

## Relationship to AgentResponse

`AgentResponse.error` remains an optional `unknown`. Only read `code`, `httpStatus`, and related fields after confirming `error instanceof ModelError`.

Errors propagate when calling Model or a Provider directly. When running through Agent, caught model and hook errors are included in the failed result. Errors inside tool functions are represented by `ToolMessage.isError` instead.

[← Hooks API](hooks.md) · [Back to introduction](../index.md)
