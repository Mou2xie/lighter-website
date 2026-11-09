# Agent API

本页对应 Lighter 0.1.0。用法见[配置 Agent](../guides/configuration.md)与[流式输出](../guides/streaming.md)。

## 构造函数

`new Agent(config: AgentConfig)`

| 配置项 | 类型 | 必填 | 默认值 |
| --- | --- | --- | --- |
| `model` | `Model` | 是 | 无 |
| `tools` | `Tool[]` | 否 | `[]` |
| `systemPrompt` | `SystemMessage` | 否 | `new SystemMessage("You are a helpful assistant.")` |
| `hooks` | 钩子配置对象，见下表 | 否 | `{}` |

| `hooks` 字段 | 类型 |
| --- | --- |
| `beforeAgent` | `BeforeAgentHook` |
| `beforeModel` | `BeforeModelHook` |
| `afterModel` | `AfterModelHook` |
| `afterAgent` | `AfterAgentHook` |

四个钩子字段均可省略，每个字段接收一个实例。构造函数只保存配置，不发送模型请求。

## `run()`

```text
run(request: AgentRequest): Promise<AgentResponse>
```

`AgentRequest` 只有一个必填字段：`messages: BaseMessages`。Agent 将系统提示词与这些消息组成上下文，然后执行循环。

`AgentResponse` 的公开类型为：

```ts
import type { BaseMessages } from "@yong_xie/lighter";

type AgentResponse = {
  status: "completed" | "failed";
  messages: BaseMessages;
  error?: unknown;
};
```

| 字段 | 行为 |
| --- | --- |
| `status` | 循环及结束钩子成功完成时为 `completed`；捕获到模型或钩子异常时为 `failed` |
| `messages` | 本次新增消息，不包含输入历史及自动加入的系统提示词；`afterAgent` 可以替换它 |
| `error` | 失败时保留捕获的原始值，类型为 `unknown`，也可能为 `undefined` |

这个类型不是按状态区分字段的判别联合；检查 `status` 后，仍需判断 `error` 的具体类型。

输入消息数组不会被 Agent 追加，但消息对象并未深拷贝。工具错误以 `ToolMessage` 回传模型，不会直接使状态变为 `failed`。

## `stream()`

```text
stream(request: AgentRequest): AsyncGenerator<AgentStreamEvent>
```

通过异步迭代消费后才开始运行。正常消费到结束时，依次产生增量事件，最后 `yield` 一个 `AgentResponse`。

公开类型定义为 `AgentStreamEvent = ProviderStreamEvent | AgentResponse`。其中 `ProviderStreamEvent` 包含 `message` 分支，但当前 Agent 会在内部消费这一分支，实际向外提供的是：

- `{ type: "text_delta", text: string }`
- `{ type: "reasoning_delta", text: string }`，是否存在取决于 Provider 与模型配置。
- `{ status, messages, error? }`，本次运行的最终结果。

使用 `"status" in event` 区分最终结果。完整助手与工具消息放在最终结果中，部分增量文本不会作为完整消息保存。

提前停止迭代不会提供最终结果，也不会保证取消已经在执行的工具。

## 最小示例

```ts
import { Agent, Model, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

const agent = new Agent({
  model: new Model(new OpenAIProvider(
    process.env.OPENAI_API_KEY!,
    process.env.OPENAI_MODEL!,
  )),
});

const result = await agent.run({ messages: [new UserMessage("你好！")] });
// 先检查状态，再使用新增消息。
if (result.status === "completed") console.log(result.messages);
else console.error(result.error);
```

[← 运行边界](../advanced/limits.md) · [下一页：Model 与 Provider API →](model-and-providers.md)
