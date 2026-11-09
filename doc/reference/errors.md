# Errors API

用法见[处理错误](../guides/errors.md)。内置 Provider 用 `ModelError` 表示可识别的模型调用错误。

## ModelError

```text
new ModelError(message: string, code: ModelErrorCode, options?: {
  httpStatus?: number;
  responseStatus?: string;
})
```

`ModelError` 继承 `Error`，并提供以下只读字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `"ModelError"` | 固定名称 |
| `code` | `ModelErrorCode` | 统一错误分类 |
| `httpStatus` | `number \| undefined` | 服务的 HTTP 错误状态码 |
| `responseStatus` | `string \| undefined` | 生成状态或结束原因，例如 `incomplete`、`max_tokens` |

`message` 和 `stack` 等字段继承自 `Error`。`httpStatus` 与 `responseStatus` 相互独立，网络错误可能两者都没有。

## ModelErrorCode

`ModelErrorCode` 是以下字符串的类型联合：

| 错误码 | 含义 |
| --- | --- |
| `auth_error` | 认证或访问权限失败 |
| `rate_limit` | 服务限流 |
| `invalid_request` | 请求格式、参数或模型等不合法 |
| `network_error` | 连接或网络错误 |
| `server_error` | 模型服务端失败 |
| `bad_response` | 响应不完整、失败、无法解析或存在不支持的内容 |
| `aborted` | 请求取消或服务返回已取消状态 |
| `unknown` | 未归入其他类别的 SDK 错误 |

## 在自定义 Provider 中使用

```ts
import { ModelError } from "@yong_xie/lighter";

// 示例：构造并检查一个生成不完整的错误。
const error = new ModelError("模型输出达到上限，生成未完成。", "bad_response", {
  responseStatus: "incomplete",
});

console.log(error.code, error.responseStatus, error.message);
```

自定义 Provider 应在服务出错时抛出适当错误。使用统一分类后，应用可以按 `code` 处理不同服务的常见失败。

## 与 AgentResponse 的关系

`AgentResponse.error` 的类型仍是可选的 `unknown`。只有确认 `error instanceof ModelError` 后，才能直接读取 `code`、`httpStatus` 等字段。

直接调用 Model 或 Provider 时，错误向调用方抛出；通过 Agent 运行时，被捕获的模型和钩子错误放入失败结果。工具函数内部的错误则通过 `ToolMessage.isError` 表示。

[← Hooks API](hooks.md) · [返回文档首页](../index.md)
