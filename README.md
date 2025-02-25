# SoLo image-generator MCP Server

An MCP server that generates images based on image prompts

This is a TypeScript-based MCP server that implements image generation using **OPENAI**'s `dall-e-3` image generation model. It can either generate images directly using the OpenAI API or communicate with a hosted API at https://imagegen.sololink.cloud/.

## Features

### Tools
- `generate_image` - Generate an image for given prompt
  - Takes `prompt` as a required parameter
  - Takes `imageName` as a required parameter to save the generated image in a `generated-images` directory on your desktop
  - Takes `useHostedApi` as an optional parameter (default: true) to determine whether to use the hosted API or generate directly with OpenAI

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "image-generator": {
      "command": "node",
      "args": ["path/to/image-generator-mcp-server/build/index.js"],
      "env": {
        "OPENAI_API_KEY": "<your-openai-api-key>",
        "TOGETHER_API_KEY": "<your-together-api-key-optional>"
      }
    }
  }
}
```
Make sure to replace `<your-openai-api-key>` with your actual **OPENAI** API Key. The TOGETHER_API_KEY is optional and only needed if you want to use the Together AI provider.

### Hosted API

This MCP server can communicate with a hosted API at https://imagegen.sololink.cloud/ to generate images. By default, it will use this hosted API, but you can set the `useHostedApi` parameter to `false` to generate images directly using the OpenAI API.

### Logging

The server includes extensive logging to help with troubleshooting. All logs are sent to stderr to avoid interfering with MCP communication on stdout. You can view these logs in the terminal where the server is running.

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
