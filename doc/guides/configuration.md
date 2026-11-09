# 配置 Agent

创建 Agent 时只有 `model` 必填。按需添加工具、系统提示词和生命周期钩子。

## 设置系统提示词

以下示例沿用[快速开始](../getting-started/quickstart.md)中的环境变量和运行方式：

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
  // 用 SystemMessage 设置角色、任务范围和回复风格。
  systemPrompt: new SystemMessage("你是一位书店顾问。用简短的中文回答问题。"),
});

const result = await agent.run({
  // 每次运行的具体问题放在 messages 中。
  messages: [new UserMessage("推荐三种适合月球书店的活动。")],
});

console.log(result);
```

省略 `systemPrompt` 时，默认内容为 `You are a helpful assistant.`。传入自定义值会替换默认提示词。

Agent 会自动把系统提示词放在本次上下文前面，维护对话历史时不需要重复添加它。

## 配置放在哪里

| 内容 | 设置位置 |
| --- | --- |
| API key、模型 ID、Provider 特有选项 | Provider 构造参数 |
| Model、工具、系统提示词、钩子 | `new Agent({ ... })` |
| 用户消息和已有对话历史 | `run({ messages })` 或 `stream({ messages })` |

当前不能通过单次 Agent 请求覆盖模型或工具。需要不同配置时，创建另一个 Agent。

## 按需扩展

- 用 [Tool](tools.md) 让 Agent 执行自己的函数。
- 用 [Hook](hooks.md) 记录或修改运行过程。
- 在 [Provider 配置](../providers/index.md)中调整输出长度、推理等选项。

完整参数见 [Agent API](../reference/agent.md)。

[← 核心概念](../getting-started/concepts.md) · [下一步：添加工具 →](tools.md)
