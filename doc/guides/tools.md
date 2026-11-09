# 添加工具

工具让模型调用你定义的函数。你负责描述工具并实现逻辑，Agent 负责校验参数、执行函数和回传结果。

## 定义并注册工具

先安装用于定义参数格式的 Zod：

```sh
npm install zod@4
```

以下示例沿用[快速开始](../getting-started/quickstart.md)中的环境变量和运行方式：

```ts
import { Agent, Model, OpenAIProvider, Tool, UserMessage } from "@yong_xie/lighter";
import * as z from "zod";

const model = new Model(new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!,
));

const add = new Tool({
  name: "add",
  description: "计算两个数的和。",
  // 参数格式会提供给模型，也会在执行前进行本地校验。
  parametersZodSchema: z.strictObject({ a: z.number(), b: z.number() }),
  // a、b 的 TypeScript 类型由参数格式推断。
  func: ({ a, b }) => a + b,
});

const agent = new Agent({ model, tools: [add] });
const result = await agent.run({
  messages: [new UserMessage("请调用 add 工具计算 19 + 23。")],
});

// 查看完整过程，包括助手的工具调用、工具结果和后续回复。
console.log(result);
```

模型请求 `add` 时，Agent 执行函数，得到 `42`，再把结果发给模型生成回复。模型是否调用工具由模型决定。

## 异步工具

`func` 也可以是异步函数。下面是一个模拟查询，不会访问真实库存：

```ts
import { Tool } from "@yong_xie/lighter";
import * as z from "zod";

const getStock = new Tool({
  name: "get_stock",
  description: "查询指定图书的库存。",
  parametersZodSchema: z.strictObject({ bookId: z.string() }),
  func: async ({ bookId }) => {
    // 在实际应用中，替换成数据库查询或外部 API 请求。
    const stock = await Promise.resolve({ bookId, available: 12 });
    return stock;
  },
});
```

把 `getStock` 加入 Agent 的 `tools` 即可使用。多个工具调用按顺序等待执行，当前不会并行执行。

## 参数、结果与失败

- 名称应唯一，描述应说明工具的用途和适用条件。
- 参数必须使用 Zod 对象格式；校验通过后，`func` 收到的是 Zod 解析后的值。
- 返回可 JSON 序列化的值。成功结果通过 `JSON.stringify()` 转为 `toolOutput`，字符串也会带上 JSON 引号。
- 工具不存在、参数 JSON 无效、参数校验失败或函数抛出异常时，Agent 会向模型提供 `isError: true` 的工具消息，并继续循环。

工具失败不等于整个运行失败：模型可能调整参数再次尝试，也可能直接回复用户。工具以应用权限执行，业务权限检查需要写在工具内部。

完整参数和方法见 [Tool API](../reference/tools.md)。

[← 配置 Agent](configuration.md) · [下一步：管理对话历史 →](conversations.md)
