export const samples={
 basic:{file:'hello.ts',output:'月光书局',source:`import { Agent, Model, OpenAIProvider,
  UserMessage } from "@yong_xie/lighter";

// 连接你的模型服务
const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!
);
const agent = new Agent({
  model: new Model(provider)
});

// 运行你的第一个 Agent
const result = await agent.run({
  messages: [new UserMessage("为月球书店起个名字。")]
});

console.log(result.messages.at(-1));`},
 tool:{file:'tool.ts',output:'工具返回 42 → Agent 回复 19 + 23 = 42。',source:`import { Agent, Model, OpenAIProvider,
  Tool, UserMessage } from "@yong_xie/lighter";
import * as z from "zod";

const add = new Tool({
  name: "add",
  description: "返回两个数的和",
  parametersZodSchema: z.strictObject({
    a: z.number(), b: z.number()
  }),
  func: ({ a, b }) => a + b
});
const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!
);
const agent = new Agent({
  model: new Model(provider), tools: [add]
});
const result = await agent.run({
  messages: [new UserMessage("用 add 计算 19 + 23")]
});
console.log(result.messages);`},
 stream:{file:'stream.ts',output:'你好！有什么可以帮你？',source:`import { Agent, Model, OpenAIProvider,
  UserMessage } from "@yong_xie/lighter";

const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!
);
const agent = new Agent({
  model: new Model(provider)
});

// 在模型生成时逐步接收文本
for await (const event of agent.stream({
  messages: [new UserMessage("你好！")]
})) {
  if ("type" in event &&
      event.type === "text_delta") {
    process.stdout.write(event.text);
  }
}`}
};

