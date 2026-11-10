const exampleCopy = {
  zh: {
    connect: '连接你的模型服务', run: '运行你的第一个 Agent',
    namePrompt: '为月球书店起个名字。', addDescription: '返回两个数的和',
    addPrompt: '用 add 计算 19 + 23', streaming: '在模型生成时逐步接收文本', greeting: '你好！',
    basicOutput: '月光书局', toolOutput: '工具返回 42 → Agent 回复 19 + 23 = 42。', streamOutput: '你好！有什么可以帮你？',
  },
  en: {
    connect: 'Connect your model provider', run: 'Run your first agent',
    namePrompt: 'Name a bookstore on the moon.', addDescription: 'Return the sum of two numbers',
    addPrompt: 'Use add to calculate 19 + 23', streaming: 'Receive text as the model generates it', greeting: 'Hello!',
    basicOutput: 'Moonlight Books', toolOutput: 'Tool returns 42 → Agent replies 19 + 23 = 42.', streamOutput: 'Hello! How can I help?',
  },
};

export function getSamples(locale: 'zh' | 'en') {
  const copy = exampleCopy[locale];
  return {
 basic:{file:'hello.ts',output:copy.basicOutput,source:`import { Agent, Model, OpenAIProvider,
  UserMessage } from "@yong_xie/lighter";

// ${copy.connect}
const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!
);
const agent = new Agent({
  model: new Model(provider)
});

// ${copy.run}
const result = await agent.run({
  messages: [new UserMessage(${JSON.stringify(copy.namePrompt)})]
});

console.log(result.messages.at(-1));`},
 tool:{file:'tool.ts',output:copy.toolOutput,source:`import { Agent, Model, OpenAIProvider,
  Tool, UserMessage } from "@yong_xie/lighter";
import * as z from "zod";

const add = new Tool({
  name: "add",
  description: ${JSON.stringify(copy.addDescription)},
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
  messages: [new UserMessage(${JSON.stringify(copy.addPrompt)})]
});
console.log(result.messages);`},
 stream:{file:'stream.ts',output:copy.streamOutput,source:`import { Agent, Model, OpenAIProvider,
  UserMessage } from "@yong_xie/lighter";

const provider = new OpenAIProvider(
  process.env.OPENAI_API_KEY!,
  process.env.OPENAI_MODEL!
);
const agent = new Agent({
  model: new Model(provider)
});

// ${copy.streaming}
for await (const event of agent.stream({
  messages: [new UserMessage(${JSON.stringify(copy.greeting)})]
})) {
  if ("type" in event &&
      event.type === "text_delta") {
    process.stdout.write(event.text);
  }
}`}
};
}
