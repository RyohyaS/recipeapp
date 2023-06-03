import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { get, writable } from "svelte/store";

let api: OpenAIApi;

export function InitApi(apikey: string) {
  const configuration = new Configuration({
    apiKey: apikey,
  });
  delete configuration.baseOptions.headers["User-Agent"];
  api = new OpenAIApi(configuration);
}

const message0: ChatCompletionRequestMessage = {
  role: "system",
  content: "You are a helpful assistant.",
};

export const messages = writable<ChatCompletionRequestMessage[]>([message0]);

export function resetMessages() {
  messages.set([message0]);
}

export async function getGptResponse(query: string) {
  messages.update((msg) => [...msg, { role: "user", content: query }]);
  console.log(messages);
  const completion = await api.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: get(messages),
  });
  console.log(completion.data);
  const message = completion.data.choices[0].message;
  messages.update((msg) => [...msg, message]);
  return message.content;
}
