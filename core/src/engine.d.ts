import { OpenAIAdapter } from './adapters/openai.js';
export declare class CCWAIEngine {
    private adapter;
    constructor(adapter?: OpenAIAdapter);
    runCommand(commandName: string, input: string): Promise<string>;
}
//# sourceMappingURL=engine.d.ts.map