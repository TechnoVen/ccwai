export interface AIAdapter {
  chat(prompt: string): Promise<string>;
}
