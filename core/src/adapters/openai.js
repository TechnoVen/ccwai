"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIAdapter = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
class OpenAIAdapter {
    async chat(prompt) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey)
            throw new Error('Missing OPENAI_API_KEY');
        const res = await (0, node_fetch_1.default)('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const json = await res.json();
        return json.choices?.[0]?.message?.content || 'No response.';
    }
}
exports.OpenAIAdapter = OpenAIAdapter;
//# sourceMappingURL=openai.js.map