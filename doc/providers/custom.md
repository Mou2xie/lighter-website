# 自定义 Provider

接入其他模型服务时，实现 `Provider` 接口，再传给 `new Model(provider)`。Agent 不需要了解服务的具体 API。

## 最小实现

下面的 `EchoProvider` 直接复述最后一条用户消息，不访问网络。可以保存为 `echo.ts`，按[快速开始](../getting-started/quickstart.md)中的方式运行，也不需要 API key。

```ts
import {
  Agent, AssistantMessage, Model, ModelError, UserMessage,
  type Provider, type ProviderRequest, type ProviderStreamEvent,
} from "@yong_xie/lighter";

export class EchoProvider implements Provider {
  readonly name = "echo";

  async invoke(request: ProviderRequest): Promise<AssistantMessage> {
    // 此示例只支持文本；不支持的能力应明确报错。
    if (request.toolSpecs?.length) {
      throw new ModelError("EchoProvider 不支持工具。", "invalid_request");
    }

    const lastUser = [...request.messages].reverse()
      .find((message) => message.role === "user");
    return new AssistantMessage(`收到：${lastUser?.content ?? ""}`);
  }

  async *stream(request: ProviderRequest): AsyncGenerator<ProviderStreamEvent> {
    const message = await this.invoke(request);
    // 模拟增量输出；真实接入时应逐步转发服务返回的文本。
    yield { type: "text_delta", text: message.content };
    // 最后必须提供完整助手消息，供 Agent 决定是否继续循环。
    yield { type: "message", message };
  }
}

const agent = new Agent({ model: new Model(new EchoProvider()) });
const result = await agent.run({ messages: [new UserMessage("月球书店开业了！")] });
console.log(result.messages);
```

## 接入真实服务

| 部分 | 需要完成的工作 |
| --- | --- |
| `name` | 提供稳定的服务标识 |
| `invoke()` | 转换输入消息和工具定义，返回完整 `AssistantMessage` |
| `stream()` | 转发文本与可选推理增量，最后返回一次完整 `message` 事件 |
| 工具调用 | 将服务返回的调用转换为 `callId`、`toolName`、JSON 字符串 `arguments` |
| 工具结果 | 将 `ToolMessage` 转换为对应调用的结果，保留调用标识与错误信息 |
| 错误 | 识别失败或不完整响应，抛出合适的 `ModelError` |

Provider 只负责通信和格式转换，工具执行由 Agent 完成。不要把单个对话的可变历史保存在共享 Provider 中。

## 流式结束规则

`text_delta` 和 `reasoning_delta` 只是增量，不能替代最终的 `message`。流结束前没有完整消息时，Agent 会返回 `bad_response` 失败结果。

直接调用 Model 的流不会额外校验这个规则，因此自定义 Provider 自身也应检查服务是否正常结束，不要把断流当成成功。

## 验证接入

至少检查普通回复、工具调用与结果往返、流式增量与结束事件，以及服务失败和中途断流。支持工具时，还应检查一次回复中多个工具调用的标识与参数是否完整。

接口签名见 [Model 与 Provider API](../reference/model-and-providers.md)。

[← 内置 Provider](index.md) · [下一步：直接调用 Model →](../advanced/model.md)
