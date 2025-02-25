#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";

import dotenv from "dotenv";
import { isValidImageGenerationArgs } from "./types.js";
import { ImageGenerator } from "./image-generator.js";
import { FileSaver } from "./file-saver.js";

dotenv.config();

const imageSaver = FileSaver.CreateDesktopFileSaver('generated-images');

class ImageGeneratorServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: "image-generator",
      version: "0.1.0"
    }, {
      capabilities: {
        resources: {},
        tools: {}
      }
    });

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    console.error("Setting up tool handlers");
    
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => {
        console.error("Received ListToolsRequest");
        return {
          tools: [{
            name: "generate_image",
            description: "Generate an image from a prompt.",
            inputSchema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "A prompt detailing what image to generate."
                },
                imageName: {
                  type: "string",
                  description: "The filename for the image excluding any extensions."
                },
                useHostedApi: {
                  type: "boolean",
                  description: "Whether to use the hosted API at imagegen.sololink.cloud (true) or generate directly with OpenAI (false).",
                  default: true
                }
              },
              required: ["prompt", "imageName"]
            }
          }]
        };
      }
    );

    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        console.error(`Received CallToolRequest for tool: ${request.params.name}`);
        
        if (request.params.name !== "generate_image") {
          console.error(`Unknown tool requested: ${request.params.name}`);
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
        }

        if (!isValidImageGenerationArgs(request.params.arguments)) {
          console.error(`Invalid arguments: ${JSON.stringify(request.params.arguments)}`);
          throw new McpError(
            ErrorCode.InvalidParams,
            "Invalid image generation arguments"
          )
        };
        
        try {
          console.error("Processing image generation request");
          const { prompt, imageName, useHostedApi = true } = request.params.arguments;
          console.error(`Using hosted API: ${useHostedApi}`);
          
          const imageGenerator = new ImageGenerator(process.env.OPENAI_API_KEY, useHostedApi);
          const base64 = await imageGenerator.generateImage(prompt);
          
          if (!base64) {
            console.error("No base64 image data returned");
            throw new Error("Failed to generate image: No image data returned");
          }
          
          const fileName = `${imageName.replace(/\..*$/, '')}.png`;
          console.error(`Saving image with filename: ${fileName}`);
          const filepath = await imageSaver.saveBase64(fileName, base64);
          console.error(`Image saved successfully to: ${filepath}`);

          return {
            content: [
              {
                type: 'text',
                text: `Image generated and saved to: ${filepath}`
              }
            ]
          }
        } catch (error) {
          console.error(`Error in generate_image tool: ${error instanceof Error ? error.message : String(error)}`);
          throw new McpError(
            ErrorCode.InternalError,
            `Failed to generate image: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    )
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // Although this is just an informative message, we must log to stderr,
    // to avoid interfering with MCP communication that happens on stdout
    console.error("Image Generator MCP server running on stdio");
    console.error(`Server version: 0.1.0`);
    console.error(`Server started at: ${new Date().toISOString()}`);
  }
}

const server = new ImageGeneratorServer();
server.run().catch(console.error);
