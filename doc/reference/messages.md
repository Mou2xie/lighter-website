# Messages API

消息通过 `role` 区分用途。用法见[管理对话历史](../guides/conversations.md)。

## SystemMessage 与 UserMessage

```text
new SystemMessage(content: string)
new UserMessage(content: string)
```

| 类 | `role` | 其他字段 |
| --- | --- | --- |
| `SystemMessage` | `"system"` | `content: string` |
| `UserMessage` | `"user"` | `content: string` |

`role` 和 `content` 均为只读属性。

## AssistantMessage

```text
new AssistantMessage(content: string, options?: {
  reasoning?: string;
  toolCalls?: ToolCall[];
})
```

| 字段 | 类型 | 默认值或说明 |
| --- | --- | --- |
| `role` | `"assistant"` | 固定角色 |
| `content` | `string` | 回复文本；工具调用时可以为空字符串 |
| `reasoning` | `string \| undefined` | 可选推理内容或摘要，由 Provider 提供 |
| `toolCalls` | `ToolCall[]` | 默认 `[]`，模型请求的工具调用 |

这些属性均声明为只读，但数组及其中的对象没有因此被深度冻结。原始消息可能还携带 Provider 特有的上下文，应避免随意修改或克隆。

## ToolCall

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `callId` | `string` | 本次调用的标识，用于匹配工具结果 |
| `toolName` | `string` | 工具名称 |
| `arguments` | `string` | JSON 字符串，尚未解析或校验的参数 |

三个字段均为只读。`arguments` 不是参数对象，Agent 会先 `JSON.parse()`，再交给工具校验。

## ToolMessage

```text
new ToolMessage({
  callId: string,
  toolName: string,
  toolOutput: string,
  isError?: boolean,
})
```

| 字段 | 类型 | 默认值或说明 |
| --- | --- | --- |
| `role` | `"tool"` | 固定角色 |
| `callId` | `string` | 对应 `ToolCall.callId` |
| `toolName` | `string` | 工具名称 |
| `toolOutput` | `string` | 工具输出文本，成功执行工具时由 JSON 序列化得到 |
| `isError` | `boolean` | 默认 `false`；`true` 表示工具执行失败 |

这些属性均为只读。

## BaseMessage 与 BaseMessages

```ts
import type {
  SystemMessage, UserMessage, AssistantMessage, ToolMessage,
} from "@yong_xie/lighter";

type BaseMessage = SystemMessage | UserMessage | AssistantMessage | ToolMessage;
type BaseMessages = BaseMessage[];
```

`BaseMessage` 是类型联合，不是可实例化的类。

## 构造消息

下面手工构造一个工具往返，仅用于展示消息结构；实际运行时，助手与工具消息通常由 Provider 和 Agent 生成。

```ts
import {
  AssistantMessage, ToolMessage, UserMessage, type BaseMessages,
} from "@yong_xie/lighter";

const messages: BaseMessages = [
  new UserMessage("计算 19 + 23。"),
  new AssistantMessage("", {
    toolCalls: [{
      callId: "call_add_1",
      toolName: "add",
      arguments: JSON.stringify({ a: 19, b: 23 }),
    }],
  }),
  // 工具结果通过 callId 与前面的调用对应。
  new ToolMessage({ callId: "call_add_1", toolName: "add", toolOutput: "42" }),
  new AssistantMessage("19 + 23 = 42。"),
];

for (const message of messages) {
  // 工具消息读取 toolOutput，其他消息读取 content。
  console.log(message.role, message.role === "tool" ? message.toolOutput : message.content);
}
```

[← Model 与 Provider API](model-and-providers.md) · [下一页：Tool API →](tools.md)
