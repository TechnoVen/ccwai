"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCWAIEngine = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const openai_js_1 = require("./adapters/openai.js");
class CCWAIEngine {
    adapter;
    constructor(adapter = new openai_js_1.OpenAIAdapter()) {
        this.adapter = adapter;
    }
    async runCommand(commandName, input) {
        const filePath = path_1.default.join(process.cwd(), 'commands', `${commandName}.md`);
        if (!fs_1.default.existsSync(filePath))
            throw new Error(`Command not found: ${commandName}`);
        const template = fs_1.default.readFileSync(filePath, 'utf8');
        const prompt = `${template}\n\nUser input:\n${input}`;
        return await this.adapter.chat(prompt);
    }
}
exports.CCWAIEngine = CCWAIEngine;
//# sourceMappingURL=engine.js.map