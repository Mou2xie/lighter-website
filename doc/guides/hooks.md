# 使用生命周期钩子

钩子让你在特定时机读取或修改请求与结果，适合日志、输入预处理和回复检查。

## 记录模型请求

以下示例沿用[快速开始](../getting-started/quickstart.md)中的环境变量和运行方式：

```ts
import {
  Agent, BeforeModelHook, Model, OpenAIProvider, UserMessage,
} from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

const logRequest = new BeforeModelHook({
  hookName: "log-model-request",
  hookFunction: (request) => {
    // 每次调用模型前都会执行，包括工具返回后的后续轮次。
    console.log("消息数：", request.messages.length);
    // 不返回值，继续使用当前请求。
  },
});

const agent = new Agent({ model, hooks: { beforeModel: logRequest } });
const result = await agent.run({ messages: [new UserMessage("你好！")] });
console.log(result);
```

## 执行时机

| 配置项 | 钩子类 | 接收的值 | 返回替换值时影响什么 |
| --- | --- | --- | --- |
| `beforeAgent` | `BeforeAgentHook` | `AgentRequest` | 本次运行的输入消息 |
| `beforeModel` | `BeforeModelHook` | `ModelRequest` | 本次模型请求，包括消息和工具定义 |
| `afterModel` | `AfterModelHook` | `AssistantMessage` | 加入上下文并用于工具执行的助手消息 |
| `afterAgent` | `AfterAgentHook` | `BaseMessages` | 最终返回的新增消息数组 |

一次运行先调用 `beforeAgent`，每个模型轮次执行 `beforeModel → Provider → afterModel`，循环成功结束后再执行 `afterAgent`。

`beforeAgent` 收到的请求尚未加入 Agent 的系统提示词；`beforeModel` 收到的上下文已经包含系统提示词。

## 修改请求

下面的钩子可以替换前面示例中的 `logRequest`：

```ts
import { BeforeModelHook, SystemMessage } from "@yong_xie/lighter";

const requireChinese = new BeforeModelHook({
  hookName: "require-chinese",
  hookFunction: (request) => ({
    ...request,
    // 返回新请求，仅为这次模型调用增加一条指令。
    messages: [...request.messages, new SystemMessage("请使用中文回答。")],
  }),
});
```

所有钩子都支持同步或异步函数。返回 `undefined` 时保留当前值；返回新值时使用新值。每个配置项接收一个钩子实例，需要多个操作时在回调内组合。

## 注意事项

- 钩子抛出的异常会使 Agent 返回失败结果。直接调用 Model 时，模型钩子异常会向调用方抛出。
- 当前实现中，模型调用失败或流被提前停止时，不会执行 `afterAgent`。必须执行的资源清理应放在应用的 `finally` 中。
- `beforeModel` 修改的是发给模型的工具定义，不会给 Agent 注册新的工具函数。
- 请求数组独立不代表消息对象被深拷贝，优先返回新数组，避免原地修改共享消息。
- OpenAI 和 Claude 的原始助手消息携带原生上下文。替换、克隆或修改它们可能丢失推理重放信息；只读取日志时应保留原消息。

完整回调类型见 [Hooks API](../reference/hooks.md)。

[← 使用流式输出](streaming.md) · [下一步：处理错误 →](errors.md)
