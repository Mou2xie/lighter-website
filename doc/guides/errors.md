# 处理错误

Agent 用 `status` 表示运行是否完成。模型或钩子失败时，先检查结果，再读取 `error`。

## 判断运行结果

以下示例沿用[快速开始](../getting-started/quickstart.md)中的环境变量和运行方式：

```ts
import { Agent, Model, ModelError, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

const agent = new Agent({
  model: new Model(new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    process.env.OPENAI_MODEL!,
  )),
});

const result = await agent.run({ messages: [new UserMessage("你好！")] });

if (result.status === "failed") {
  // error 是 unknown，先判断类型再读取错误字段。
  if (result.error instanceof ModelError) {
    console.error(result.error.code, result.error.message);
  } else {
    console.error("运行失败：", result.error);
  }
  // 如果之前执行过工具，这里可能仍有已完成的消息。
  console.log(result.messages);
  process.exitCode = 1;
} else {
  console.log(result.messages);
}
```

内置 Provider 将识别到的 SDK 错误归类为 `ModelError`。应用或钩子抛出的其他值会按原样保留，不保证一定是 `Error`，也可能是 `undefined`。

## 工具失败与运行失败

工具名不存在、参数无效或工具函数抛出异常时，Agent 会生成 `isError: true` 的 `ToolMessage`，交给模型继续处理。这不会直接将运行状态改为 `failed`。

因此，`completed` 表示循环正常结束，并不保证所有工具都执行成功，也不代表答案一定正确。

## 保留已经完成的进度

模型在后续轮次失败时，结果中的 `messages` 仍保留本次已经完成的助手与工具消息。应用可以保存这些消息，再决定是否继续。

继续时应保留完整的工具调用与结果配对。不能仅凭失败状态就重跑整个任务，否则可能重复执行已经产生副作用的工具。

## 常见排查

| 情况 | 检查项 |
| --- | --- |
| `auth_error` | API key、账号权限 |
| `invalid_request` | 模型 ID、参数、消息和工具定义 |
| `rate_limit` | 请求频率、并发量，以及服务返回的限流信息 |
| `network_error` | 网络、代理与服务连通性 |
| `bad_response` | 是否生成不完整、流中断或出现不支持的响应 |
| 模块加载失败 | ESM 配置与 TypeScript 运行方式 |

Lighter 没有独立的重试策略；底层 SDK 可能有自己的重试行为。完整错误码见 [Errors API](../reference/errors.md)。

直接调用 `Model` 或 Provider 时，错误会抛出；构造 Provider 时的配置错误也可能立即抛出。应用可用 `try/catch` 处理这些情况。

[← 使用钩子](hooks.md) · [下一步：选择 Provider →](../providers/index.md)
