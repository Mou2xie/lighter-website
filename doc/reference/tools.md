# Tool API

`Tool` 封装参数校验、函数执行和工具结果。用法见[添加工具](../guides/tools.md)。

## 构造参数

`new Tool({ name, description, parametersZodSchema, func })`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 工具名称，建议在一个 Agent 中保持唯一 |
| `description` | `string` | 向模型说明用途与适用条件 |
| `parametersZodSchema` | `ZSchema extends z.ZodObject` | Zod 对象格式，用于生成 JSON Schema 与本地参数校验 |
| `func` | `(args: z.infer<ZSchema>) => unknown \| Promise<unknown>` | 同步或异步执行函数 |

四项均必填。`Tool` 通过泛型推断 `func` 的参数类型；构造参数使用的内部 `ToolConfig` 类型没有单独导出。

实例的 `name`、`description`、`parametersZodSchema` 和 `func` 均是公开的只读属性。

## `execute()`

```text
execute(args: unknown, options: { callId: string }): Promise<ToolMessage>
```

执行顺序为：使用 Zod 的同步 `parse()` 校验参数 → 等待 `func()` → 使用 `JSON.stringify()` 序列化结果。

- 成功时返回 `isError: false` 的 `ToolMessage`。
- 参数校验、函数执行或序列化抛出异常时，返回 `isError: true` 的 `ToolMessage`，`toolOutput` 为 `String(error)`。
- `callId` 由调用方提供，保留在结果中，用于关联工具调用。

请返回能被 `JSON.stringify()` 转成字符串的值。避免 `undefined`、函数、Symbol 等不能产生有效输出文本的值；BigInt、循环引用等可能导致序列化失败。

Agent 通常会自动调用这个方法。直接执行工具的示例：

```ts
import { Tool } from "@yong_xie/lighter";
import * as z from "zod";

const add = new Tool({
  name: "add",
  description: "计算两个数的和。",
  parametersZodSchema: z.strictObject({ a: z.number(), b: z.number() }),
  func: ({ a, b }) => a + b,
});

// 参数先校验再执行；结果中的 toolOutput 是字符串 "42"。
const result = await add.execute({ a: 19, b: 23 }, { callId: "call_add_1" });
console.log(result);
```

## `getSpec()`

```text
getSpec(): ToolSpec
```

将参数格式转换成 JSON Schema，返回可提供给模型的工具定义，不包含执行函数。转换使用 Zod 的输入模式；无法转换的格式可能在此处抛出异常。

`ToolSpec` 字段如下：

| 字段 | 类型 | `getSpec()` 当前返回值 |
| --- | --- | --- |
| `type` | `"function"` | `"function"` |
| `name` | `string` | 工具名称 |
| `description` | `string` | 工具描述 |
| `parameters` | `Record<string, unknown>` | Zod 生成的 JSON Schema |
| `strict` | `boolean` | 固定为 `false` |

`strict: false` 是发送给 Provider 的定义选项，不会关闭工具执行前的本地 Zod 校验。

[← Messages API](messages.md) · [下一页：Hooks API →](hooks.md)
