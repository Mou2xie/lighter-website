# 快速开始

用一个最小示例，连接模型并获得第一条回复。以下使用 OpenAI，需要 Node.js 22+ 和一个使用 ESM 的 TypeScript 项目。

## 安装依赖

```sh
npm install @yong_xie/lighter
npm install --save-dev tsx
```

示例使用 `tsx` 运行 TypeScript；已有运行方式的项目可以省略它。

## 设置 API key

在终端设置 API key 和该账号可用的模型 ID：

```sh
export OPENAI_API_KEY="your-api-key"
export OPENAI_MODEL="your-model-id"
```

## 创建并运行 Agent

创建 `hello.ts`：

```ts
import { Agent, Model, OpenAIProvider, UserMessage } from "@yong_xie/lighter";

// 使用前面设置的 API key 和模型 ID 连接 OpenAI。
const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
);

// 将 Provider 包装为 Model，再用它创建 Agent。
const model = new Model(provider);
const agent = new Agent({ model });

// 用 UserMessage 表示用户输入，run() 会等待本次运行结束。
const result = await agent.run({
  messages: [new UserMessage("给一家开在月球上的书店起个名字，只返回店名。")],
});

if (result.status === "failed") {
  // 运行失败时读取 error，并让进程以失败状态退出。
  console.error("运行失败：", result.error);
  process.exitCode = 1;
} else {
  // 本例没有工具，最后一条新增消息就是助手回复。
  const reply = result.messages.at(-1);
  if (reply?.role === "assistant") {
    console.log(reply.content);
  }
}
```

`Provider` 连接模型服务，`Model` 封装模型调用，`Agent` 接收消息并执行。调用 `run()` 即可获得结果。

在同一终端运行：

```sh
node --import tsx hello.ts
```

输出类似下面这样，具体内容由模型生成：

```text
月光书局
```

## 理解返回结果

- `status` 为 `"completed"` 时运行完成，为 `"failed"` 时通过 `error` 查看原因。
- `messages` 只包含本次新增的消息，不包含传入的历史。
- 这个示例没有添加工具，成功时最后一条消息就是助手回复，文本在 `content` 中。

[← 返回文档首页](../index.md) · [下一步：核心概念 →](concepts.md)
