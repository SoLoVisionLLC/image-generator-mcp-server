import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

export class FileSaver {
    constructor(private dirPath: string) {
        console.error(`FileSaver initialized with directory: ${dirPath}`);
        if (!fs.existsSync(dirPath)) {
            console.error(`Directory does not exist, creating: ${dirPath}`);
            fs.mkdirSync(dirPath, { recursive: true });
        } else {
            console.error(`Directory already exists: ${dirPath}`);
        }
    }

    async saveBase64(filename: string, base64String: string) {
        console.error(`Saving base64 image as: ${filename}`);
        const buffer = Buffer.from(base64String, "base64");
        return this.save(filename, buffer);
    }
    
    async save(filename: string, content: Buffer | string)
    {
        filename = FileSaver.sanitizeFilename(filename);
        console.error(`Sanitized filename: ${filename}`);
        
        let filePath = path.join(this.dirPath, filename);
        console.error(`Initial file path: ${filePath}`);

        // Check if the file already exists, and rename if necessary
        if (fs.existsSync(filePath)) {
            console.error(`File already exists, generating unique name`);
            const ext = path.extname(filename); // File extension
            const baseName = path.basename(filename, ext); // Filename without extension
            const isoDate = new Date().toISOString().replace(/:/g, '-'); // ISO string, replace ':' to make it filename-safe
            filePath = path.join(this.dirPath, `${baseName}-${isoDate}${ext}`);
            console.error(`New unique file path: ${filePath}`);
        }

        try {
            await fs.promises.writeFile(filePath, content);
            console.error(`File successfully saved to: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error(`Error saving file: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }

    private static sanitizeFilename(filename: string): string {
        // Regular expression to match invalid characters for filenames across platforms
        const invalidCharacters = /[<>:"/\\|?*\x00-\x1F]/g;
    
        // Replace invalid characters with an empty string and trim trailing periods/spaces
        const sanitized = filename
            .replace(invalidCharacters, '') // Remove invalid characters
            .replace(/\.+$/, '')           // Remove trailing periods
            .trim();                       // Remove trailing spaces
    
        return sanitized;
    }

    static CreateDesktopFileSaver(directory: string) {
        console.error(`Creating desktop file saver for directory: ${directory}`);
        directory = FileSaver.sanitizeFilename(directory);
        const desktopPath = path.join(homedir(), 'Desktop');
        const dirPath = path.join(desktopPath, directory);
        console.error(`Full directory path: ${dirPath}`);
        return new FileSaver(dirPath);
    }
}
