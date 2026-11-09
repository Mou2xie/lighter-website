# 直接调用 Model

如果只需要一次模型调用，或希望自己控制工具执行过程，可以直接使用 `Model`。

## 获取完整回复

以下示例沿用[快速开始](../getting-started/quickstart.md)中的环境变量和运行方式：

```ts
import { Model, OpenAIProvider, SystemMessage, UserMessage } from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

try {
  const message = await model.invoke({
    // Model 不会自动添加系统提示词，需要时自行传入。
    messages: [
      new SystemMessage("你是一位书店顾问，简短回答。"),
      new UserMessage("给月球书店起个名字。"),
    ],
  });
  console.log(message.content);
} catch (error) {
  // Model 直接抛出错误，不返回带 status 的 AgentResponse。
  console.error("模型调用失败：", error);
  process.exitCode = 1;
}
```

`invoke()` 返回单条 `AssistantMessage`。如果模型请求工具，调用信息在 `toolCalls` 中，Model 不会自动执行工具或发起后续轮次。

## 接收流式回复

```ts
import { Model, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

try {
  for await (const event of model.stream({ messages: [new UserMessage("你好！")] })) {
    if (event.type === "text_delta") {
      process.stdout.write(event.text);
    } else if (event.type === "message") {
      // 与 Agent 不同，Model 会直接提供完整 message 事件。
      console.log("\n完整消息：", event.message);
    }
  }
} catch (error) {
  console.error("流式调用失败：", error);
  process.exitCode = 1;
}
```

Model 的流式事件包含 `text_delta`、`reasoning_delta` 和 `message`，没有最终的 `AgentResponse`。

## 工具与钩子

将 `tool.getSpec()` 放入请求的 `toolSpecs`，可以让模型了解工具；收到调用后，参数解析、执行和再次请求都由应用负责。希望自动处理这些步骤时，使用 Agent。

`invoke(request, hooks?)` 和 `stream(request, hooks?)` 的第二个参数可传入 `beforeModel`、`afterModel`，用法与 [Agent 的模型钩子](../guides/hooks.md)相同。直接调用 Provider 会绕过这层钩子。

[← 自定义 Provider](../providers/custom.md) · [下一步：运行边界 →](limits.md)
