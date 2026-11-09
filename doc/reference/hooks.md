# Hooks API

四种钩子使用相同的构造方式。运行示例见[使用生命周期钩子](../guides/hooks.md)。

## 公共构造参数

`new BeforeModelHook({ hookName, description?, hookFunction })`

其他钩子类同样接收这三个字段：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `hookName: string` | 是 | 钩子标识，也是实例的公开只读属性 |
| `description?: string` | 否 | 描述，也是实例的公开只读属性 |
| `hookFunction` | 是 | 回调函数，具体类型见下表 |

## 回调类型

| 类 | 输入 | 允许的返回值 |
| --- | --- | --- |
| `BeforeAgentHook` | `AgentRequest` | `AgentRequest \| void \| Promise<AgentRequest \| void>` |
| `BeforeModelHook` | `ModelRequest` | `ModelRequest \| void \| Promise<ModelRequest \| void>` |
| `AfterModelHook` | `AssistantMessage` | `AssistantMessage \| void \| Promise<AssistantMessage \| void>` |
| `AfterAgentHook` | `BaseMessages` | `BaseMessages \| void \| Promise<BaseMessages \| void>` |

所有回调都会被等待。返回 `undefined` 时保留当前值；返回替换值时采用替换值。当前实现使用空值合并，但类型不允许返回 `null`。

`AfterAgentHook` 的输入与返回值是消息数组，不是完整的 `AgentResponse`。

## `execute()`

| 类 | 公开方法 |
| --- | --- |
| `BeforeAgentHook` | `execute(request: AgentRequest): Promise<AgentRequest>` |
| `BeforeModelHook` | `execute(request: ModelRequest): Promise<ModelRequest>` |
| `AfterModelHook` | `execute(message: AssistantMessage): Promise<AssistantMessage>` |
| `AfterAgentHook` | `execute(messages: BaseMessages): Promise<BaseMessages>` |

这些方法由 Agent 或 Model 自动调用。直接调用时，回调异常会向调用方抛出。

## 调用时机与失败

- `beforeAgent`：每次运行开始时一次，尚未加入 Agent 的系统提示词。
- `beforeModel`：每次模型请求前，包括工具结果返回后的下一次调用。
- `afterModel`：每次获得完整助手消息后，早于 Agent 执行其中的工具调用。流式增量不经过此钩子。
- `afterAgent`：当前在循环成功结束后一次，早于 Agent 包装最终结果。

Agent 捕获这些钩子的异常后返回或产生失败结果；直接调用 Model 时，模型钩子异常直接抛出。当前模型失败或提前结束流时跳过 `afterAgent`，不能将它用作保证执行的资源清理钩子。

## 示例

```ts
import { AfterAgentHook, AssistantMessage } from "@yong_xie/lighter";

const appendNotice = new AfterAgentHook({
  hookName: "append-notice",
  hookFunction: (messages) => [
    ...messages,
    // 返回消息数组，Agent 会将它放入最终响应的 messages。
    new AssistantMessage("本次回复仅供参考。"),
  ],
});
```

将此实例传给 `new Agent({ model, hooks: { afterAgent: appendNotice } })`。此钩子只影响最终返回的消息，不会追加一次模型调用，也不会将内容作为流式增量发送。

[← Tool API](tools.md) · [下一页：Errors API →](errors.md)
