# 管理消息与对话历史

Lighter 不自动保存对话。每次运行传入已有历史，再把返回的新增消息追加进去，就能继续对话。

## 继续上一轮对话

以下示例沿用[快速开始](../getting-started/quickstart.md)中的环境变量和运行方式：

```ts
import {
  Agent, Model, OpenAIProvider, UserMessage, type BaseMessages,
} from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));
const agent = new Agent({ model });
const history: BaseMessages = [new UserMessage("给一家月球书店起个名字。")];

const first = await agent.run({ messages: history });
if (first.status === "failed") throw first.error;

// 返回值只包含本次新增消息，手动追加以保留上下文。
history.push(...first.messages);
history.push(new UserMessage("再给我三个风格相近的名字。"));

const second = await agent.run({ messages: history });
if (second.status === "failed") throw second.error;
history.push(...second.messages);

console.log(second.messages);
```

Agent 不会向传入的数组追加消息。只保存最后一段回复会丢失工具调用与结果，因此有工具时也应保留完整的新增消息。

## 按角色读取消息

| `role` | 消息类型 | 主要内容 |
| --- | --- | --- |
| `system` | `SystemMessage` | 系统指令，文本在 `content` |
| `user` | `UserMessage` | 用户输入，文本在 `content` |
| `assistant` | `AssistantMessage` | 回复 `content`、工具调用 `toolCalls`、可选的 `reasoning` |
| `tool` | `ToolMessage` | 工具输出 `toolOutput`、调用标识 `callId`、错误标记 `isError` |

工具调用可能没有助手文本，读取消息前应先判断 `role`。完整字段见 [Messages API](../reference/messages.md)。

## 多个对话

同一个 Agent 可以处理多次独立运行，但每个对话应使用各自的历史数组。工具、钩子或应用状态中的共享数据，仍需由应用处理并发访问。

## 保存与恢复的边界

历史可以由应用写入数据库。OpenAI 和 Claude 返回的消息还可能携带后续请求需要的原生上下文；普通 JSON 序列化、克隆或重新创建消息不会完整保留这些信息。

对于依赖推理上下文的工具往返，优先保留 Provider 返回的原始消息实例。持久化恢复需要应用额外设计，不能仅凭保存 `content` 和 `reasoning` 就保证恢复原生上下文。

[← 添加工具](tools.md) · [下一步：使用流式输出 →](streaming.md)
