export interface ImageGenerationRequestParams {
    prompt: string;
    imageName: string;
    useHostedApi?: boolean;
}

export function isValidImageGenerationArgs(args: any): args is ImageGenerationRequestParams {
    if (typeof args !== "object" || args === null) {
        console.error("Arguments is not an object or is null");
        return false;
    }
    
    if (!("prompt" in args) || typeof args.prompt !== 'string') {
        console.error("Missing or invalid 'prompt' parameter");
        return false;
    }
    
    if (!("imageName" in args) || typeof args.imageName !== 'string') {
        console.error("Missing or invalid 'imageName' parameter");
        return false;
    }
    
    // useHostedApi is optional, but if provided must be a boolean
    if ("useHostedApi" in args && typeof args.useHostedApi !== 'boolean' && args.useHostedApi !== undefined) {
        console.error("Invalid 'useHostedApi' parameter, must be a boolean if provided");
        return false;
    }
    
    return true;
}
