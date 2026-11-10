# Lighter

Lighter is a lightweight TypeScript framework for building AI agents. It handles the loop between model calls and tool execution so you can build an agent with just a few lines of code.

Inspired by [Pi](https://pi.dev/), Lighter keeps its core small while leaving room for customization. Its straightforward API makes it easy to get started, whatever your experience level.

Use it to:

- **Call models** through a shared interface for OpenAI, Claude, or DeepSeek.
- **Run tools** by giving the model access to your own functions for queries, calculations, and other tasks.
- **Build interactions** with streaming replies and conversation history maintained by your application.
- **Customize behavior** with lifecycle hooks that log requests, modify inputs, or process replies.

## Getting started

Follow the [quickstart](getting-started/quickstart.md) to install Lighter, connect a model, and run your first agent. You need Node.js, an API key for a model provider, and an available model ID.

## Core components

The smallest Lighter setup is `Provider → Model → Agent`:

| Component | Responsibility |
| --- | --- |
| Provider | Communicates with the model service and converts requests and responses |
| Model | Wraps model calls and runs hooks before and after them |
| Agent | Organizes messages and runs the loop between the model and tools |

Tools are optional. Without tools, the agent finishes after receiving a model reply. When the model requests tools, the agent executes them, returns their results, and calls the model again until it stops requesting tools.

## Documentation

| Section | Topics |
| --- | --- |
| Getting started | [Quickstart](getting-started/quickstart.md) · [Core concepts](getting-started/concepts.md) |
| Guides | [Configuration](guides/configuration.md) · [Tools](guides/tools.md) · [Conversation history](guides/conversations.md) · [Streaming](guides/streaming.md) · [Hooks](guides/hooks.md) · [Errors](guides/errors.md) |
| Providers | [Built-in providers](providers/index.md) · [Custom providers](providers/custom.md) |
| Advanced | [Use Model directly](advanced/model.md) · [Runtime limits](advanced/limits.md) |
| API reference | [Agent](reference/agent.md) · [Model and Provider](reference/model-and-providers.md) · [Messages](reference/messages.md) · [Tool](reference/tools.md) · [Hooks](reference/hooks.md) · [Errors](reference/errors.md) |

AI agents can use [llms.txt](llms.txt) to find documentation on demand, or read the [complete documentation](llms-full.txt).

## Version and scope

This documentation covers **Lighter 0.1.0**, currently in alpha. Breaking API changes are possible.

Lighter provides the core loop. Your application handles conversation storage, loop limits, business permissions, and tool isolation.

[Start: run your first agent →](getting-started/quickstart.md)
