# Lighter

Lighter 是一个用于构建 AI agent 的轻量 TypeScript 框架。它负责模型调用与工具执行之间的循环，让你用少量代码搭建自己的 agent。

Lighter 的设计受到 [Pi](https://pi.dev/) 的启发：保持核心精简，同时保留灵活的自定义能力。易用性同样是设计重点，API 简单直观，让不同经验水平的开发者都能轻松上手。

你可以用它：

- **调用模型**：通过统一接口接入 OpenAI、Claude 或 DeepSeek。
- **执行工具**：把自己的函数交给模型调用，完成查询、计算等任务。
- **构建交互**：接收流式回复，用应用维护的历史继续对话。
- **定制行为**：通过生命周期钩子记录请求、修改输入或处理回复。

## 开始使用

从[快速开始](getting-started/quickstart.md)入手，完成安装、连接模型并运行第一个 Agent。你只需要准备 Node.js、一个模型服务的 API key，以及可用的模型 ID。

## 核心组成

Lighter 的最小组合是 `Provider → Model → Agent`：

| 组件 | 职责 |
| --- | --- |
| Provider | 与模型服务通信，转换请求和响应 |
| Model | 封装模型调用，执行模型调用前后的钩子 |
| Agent | 组织消息，执行模型与工具之间的循环 |

工具是可选的。没有工具时，Agent 获取模型回复后结束；模型请求工具时，Agent 执行工具、回传结果，再次调用模型，直到模型不再请求工具。

## 文档导航

| 分类 | 内容 |
| --- | --- |
| 开始使用 | [快速开始](getting-started/quickstart.md) · [核心概念](getting-started/concepts.md) |
| 使用指南 | [配置 Agent](guides/configuration.md) · [工具](guides/tools.md) · [对话历史](guides/conversations.md) · [流式输出](guides/streaming.md) · [钩子](guides/hooks.md) · [错误处理](guides/errors.md) |
| 模型接入 | [内置 Provider](providers/index.md) · [自定义 Provider](providers/custom.md) |
| 进阶用法 | [直接调用 Model](advanced/model.md) · [运行边界](advanced/limits.md) |
| API 参考 | [Agent](reference/agent.md) · [Model 与 Provider](reference/model-and-providers.md) · [Messages](reference/messages.md) · [Tool](reference/tools.md) · [Hooks](reference/hooks.md) · [Errors](reference/errors.md) |

AI agent 可以从 [llms.txt](llms.txt) 按需查找文档，也可以读取[完整合并文档](llms-full.txt)。

## 版本与边界

本文档对应 **Lighter 0.1.0**。当前为 Alpha 版本，API 可能发生破坏性变化。

Lighter 提供核心循环，对话存储、最大运行轮数、业务权限和工具隔离由应用负责。

[开始：运行第一个 Agent →](getting-started/quickstart.md)
