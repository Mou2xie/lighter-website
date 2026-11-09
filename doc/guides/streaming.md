# 使用流式输出

用 `stream()` 代替 `run()`，可以在模型生成过程中逐步接收文本。两者执行相同的工具循环。

## 接收文本和最终结果

以下示例沿用[快速开始](../getting-started/quickstart.md)中的环境变量和运行方式：

```ts
import { Agent, Model, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));
const agent = new Agent({ model });

for await (const event of agent.stream({
  messages: [new UserMessage("用三句话介绍一家月球书店。")],
})) {
  // 最终结果带有 status，与增量事件的结构不同。
  if ("status" in event) {
    process.stdout.write("\n");
    if (event.status === "failed") {
      console.error("运行失败：", event.error);
      process.exitCode = 1;
    }
    // 要保存历史时，使用最终结果中的完整消息。
    console.log(event.messages);
  } else if (event.type === "text_delta") {
    process.stdout.write(event.text);
  }
}
```

## 会收到什么

| 内容 | 结构 | 用途 |
| --- | --- | --- |
| 文本增量 | `{ type: "text_delta", text }` | 逐步展示回复 |
| 推理增量 | `{ type: "reasoning_delta", text }` | 展示 Provider 提供的推理内容或摘要；不一定存在 |
| 最终结果 | `{ status, messages, error? }` | 判断完成状态，读取完整消息或失败原因 |

最终结果通过 `yield` 提供，正常消费到结束时可以在 `for await` 中收到。当前 Agent 在内部消费 Provider 的 `message` 事件，不把它作为单独事件传出。

有工具时，增量文本可能来自不同的模型轮次。工具消息和完整助手消息统一放在最终结果里；不要再把最终回复文本重复追加到已经展示的增量文本中。

## 失败与提前停止

流中断时，Agent 返回失败结果，并保留本次已经完成的消息。只收到部分文本、尚未形成完整消息的内容，不会放进 `messages`。

可以用 `break` 停止消费流，这会关闭迭代器，并阻止之后的工具与模型调用。提前停止后不会收到最终结果，也不能据此取消已经在运行的工具。

`afterModel` 钩子处理完整助手消息。如果它修改回复，最终消息可能与之前展示的增量文本不同。

[← 管理对话历史](conversations.md) · [下一步：使用钩子 →](hooks.md)
