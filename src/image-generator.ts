import OpenAI from "openai";
import { ImageGenerateParams } from "openai/resources/images.mjs";

const IMAGE_MODEL = "dall-e-3";
const API_URL = "https://imagegen.sololink.cloud/api/generate-image";

export class ImageGenerator {
    private openai: OpenAI;
    private useHostedApi: boolean;

    constructor(apiKey: string = process.env.OPENAI_API_KEY!, useHostedApi: boolean = true) {
        this.openai = new OpenAI({ apiKey });
        this.useHostedApi = useHostedApi;
        console.error(`ImageGenerator initialized. Using ${useHostedApi ? 'hosted API' : 'direct OpenAI API'}`);
    }

    async generateImage(prompt: string, size: ImageGenerateParams['size'] = "1024x1024") {
        console.error(`Generating image with prompt: "${prompt.substring(0, 30)}..."`);
        
        try {
            if (this.useHostedApi) {
                console.error(`Making request to hosted API at ${API_URL}`);
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prompt,
                        provider: 'openai'
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`API request failed: ${response.status} ${response.statusText}`);
                    console.error(`Error details: ${errorText}`);
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.error(`Image generated successfully from hosted API`);
                
                // Convert URL to base64 if needed
                if (data.images && data.images[0] && data.images[0].url) {
                    console.error(`Fetching image from URL: ${data.images[0].url.substring(0, 30)}...`);
                    const imageResponse = await fetch(data.images[0].url);
                    const arrayBuffer = await imageResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const base64 = buffer.toString('base64');
                    console.error(`Image converted to base64 successfully`);
                    return base64;
                } else {
                    console.error(`No image URL found in API response`);
                    throw new Error('No image URL found in API response');
                }
            } else {
                console.error(`Making direct request to OpenAI API`);
                const response = await this.openai.images.generate({
                    model: IMAGE_MODEL,
                    prompt,
                    size,
                    response_format: 'b64_json'
                });
                console.error(`Image generated successfully from OpenAI API`);
                return response.data[0].b64_json;
            }
        } catch (error) {
            console.error(`Error generating image: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
