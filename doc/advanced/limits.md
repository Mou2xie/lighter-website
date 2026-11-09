# 运行边界与应用责任

Lighter 负责模型与工具之间的核心循环。应用需要根据任务补充存储、运行限制、权限与监控。

## 当前能力边界

| 需求 | 当前行为 |
| --- | --- |
| 对话持久化、历史裁剪 | 由应用维护和传入历史 |
| 最大模型调用次数 | 没有内置上限，可通过应用逻辑或钩子限制 |
| 请求超时、取消 | 没有额外的统一控制接口，受底层 SDK 行为影响 |
| 自动重试 | 没有 Lighter 自己的重试策略，底层 SDK 可能重试 |
| 工具并行执行 | 当前按顺序等待执行 |
| 工具隔离与权限 | 工具使用应用权限，没有内置沙箱 |
| 日志、追踪与用量统计 | 没有内置监控面板或统一用量字段，可用钩子接入应用逻辑 |

## 限制模型调用次数

下面是应用层的限制方式。每次调用函数时创建独立计数器，避免多个请求相互影响：

```ts
import {
  Agent, BeforeModelHook, Model, OpenAIProvider,
  type BaseMessages, type Tool,
} from "@yong_xie/lighter";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

export async function runWithLimit(messages: BaseMessages, tools: Tool[] = []) {
  let calls = 0;
  const beforeModel = new BeforeModelHook({
    hookName: "limit-model-calls",
    hookFunction: () => {
      // 第九次调用前抛出异常，Agent 会将本次运行标记为 failed。
      if (++calls > 8) throw new Error("已达到 8 次模型调用上限。");
    },
  });

  const agent = new Agent({ model, tools, hooks: { beforeModel } });
  return agent.run({ messages });
}
```

这只限制模型调用次数，不限制单次请求或单个工具的执行时间。工具已经产生的副作用不会因达到上限而撤销。

## 工具的权限与副作用

Zod 校验只检查参数格式。访问数据库、文件系统或外部服务前，工具还需要检查当前用户的业务权限。

需要隔离时，在独立进程或服务中执行工具。涉及付款、发送消息等副作用时，由应用设计确认流程、幂等控制和审计记录。

## 并发、停止与恢复

Agent 每次运行都有自己的消息数组，但工具、钩子和应用状态可能被共享。共享计数器、数据库连接或可变数据需要应用自行协调。

停止消费流可以阻止后续执行，不能保证中止正在运行的工具。失败结果能保留已完成的消息，但不提供崩溃恢复或副作用恰好执行一次的保证。

持久化也需要考虑 Provider 原生消息上下文，见[管理对话历史](../guides/conversations.md)。

[← 直接调用 Model](model.md) · [下一步：Agent API →](../reference/agent.md)
