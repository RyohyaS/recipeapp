import {
  type ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
  type CreateChatCompletionRequest,
} from "openai";
import { get, writable } from "svelte/store";
import { isdebug } from "./store";

let api: OpenAIApi;
const gptmodel = "gpt-3.5-turbo-0613";

export function InitApi(apikey: string) {
  const configuration = new Configuration({
    apiKey: apikey.trim(),
  });
  delete configuration.baseOptions.headers["User-Agent"];
  api = new OpenAIApi(configuration);
}

const message0: ChatCompletionRequestMessage = {
  role: "system",
  content: "You are a helpful assistant.",
};

export const messages = writable<ChatCompletionRequestMessage[]>([message0]);

export function getLastResponse() {
  const msgArr = get(messages);
  const lastResponse = msgArr[msgArr.length - 1];
  return lastResponse.content;
}

export function resetMessages() {
  messages.set([message0]);
}

const recipes_schema = {
  type: "object",
  required: ["recipes"],
  properties: {
    recipes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                unit: {
                  type: "string",
                  enum: ["grams", "ml", "cups", "pieces", "teaspoons"],
                },
                amount: { type: "number" },
                need_to_buy: {
                  type: "boolean",
                },
              },
              required: ["name", "unit", "amount", "need_to_buy"],
            },
          },
          time_to_cook: {
            type: "number",
            description: "Total time to prepare the recipe in minutes",
          },
        },
        required: ["name", "ingredients", "time_to_cook"],
      },
    },
  },
};

async function getMockRecipes() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    {
      name: "Teriyaki Chicken",
      ingredients: [
        {
          name: "Chicken",
          unit: "pieces",
          amount: 2,
          need_to_buy: true,
        },
        {
          name: "Soy Sauce",
          unit: "ml",
          amount: 30,
          need_to_buy: false,
        },
        {
          name: "Mirin",
          unit: "ml",
          amount: 30,
          need_to_buy: false,
        },
        {
          name: "Sugar",
          unit: "grams",
          amount: 15,
          need_to_buy: false,
        },
        {
          name: "Garlic",
          unit: "cloves",
          amount: 1,
          need_to_buy: false,
        },
        {
          name: "Ginger",
          unit: "grams",
          amount: 5,
          need_to_buy: false,
        },
      ],
      time_to_cook: 30,
    },
    {
      name: "Miso Soup",
      ingredients: [
        {
          name: "Miso Paste",
          unit: "grams",
          amount: 30,
          need_to_buy: false,
        },
        {
          name: "Tofu",
          unit: "grams",
          amount: 100,
          need_to_buy: true,
        },
        {
          name: "Green Onions",
          unit: "pieces",
          amount: 2,
          need_to_buy: false,
        },
        {
          name: "Seaweed",
          unit: "grams",
          amount: 5,
          need_to_buy: false,
        },
        {
          name: "Dashi Stock",
          unit: "ml",
          amount: 500,
          need_to_buy: false,
        },
      ],
      time_to_cook: 20,
    },
    {
      name: "Vegetable Tempura",
      ingredients: [
        {
          name: "Assorted Vegetables",
          unit: "pieces",
          amount: 4,
          need_to_buy: true,
        },
        {
          name: "Tempura Batter Mix",
          unit: "grams",
          amount: 100,
          need_to_buy: false,
        },
        {
          name: "Vegetable Oil",
          unit: "ml",
          amount: 500,
          need_to_buy: false,
        },
        {
          name: "Soy Sauce",
          unit: "ml",
          amount: 30,
          need_to_buy: false,
        },
      ],
      time_to_cook: 40,
    },
  ];
}

export async function getRecipes(ingredients: string[], cuisine: string) {
  const ingredients_all = ingredients
    .map((i) => i.trim())
    .filter((i) => i)
    .join(", ");
  let promptString = `Suggest 3 recipes that can be prepared at home.
    Do not give me instructions now. I will ask for instructions later for one of your suggestions.
    The following ingredients are available:
  ${ingredients_all}`;
  if (cuisine) promptString += ` I prefer ${cuisine} cuisine.`;
  if (get(isdebug)) return await getMockRecipes();
  const message = await getGptResponse(promptString, {
    functions: [{ name: "set_recipe", parameters: recipes_schema }],
    function_call: { name: "set_recipe" },
  });
  console.log({ body: message });
  const recipes = JSON.parse(message.function_call.arguments).recipes;
  console.log({ recipes });
  return recipes;
}

const instruction_schema = {
  type: "object",
  required: ["name", "time_to_cook", "ingredients", "steps"],
  properties: {
    name: { type: "string", description: "name of the recipe" },
    time_to_cook: {
      type: "number",
      description: "Total time to prepare the recipe in minutes",
    },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          unit: {
            type: "string",
            enum: ["grams", "ml", "cups", "pieces", "teaspoons"],
          },
          amount: { type: "number" },
          need_to_buy: { type: "boolean" },
        },
        required: ["name", "unit", "amount", "need_to_buy"],
      },
    },
    steps: {
      type: "array",
      description: "Steps of the cooking process",
      items: {
        type: "string",
      },
    },
  },
};

async function getMockedInstruction() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    name: "Miso Soup",
    time_to_cook: 20,
    ingredients: [
      {
        name: "Dashi stock",
        unit: "ml",
        amount: 500,
      },
      {
        name: "Miso paste",
        unit: "grams",
        amount: 50,
      },
      {
        name: "Tofu",
        unit: "grams",
        amount: 200,
      },
      {
        name: "Green onions",
        unit: "pieces",
        amount: 2,
      },
      {
        name: "Seaweed",
        unit: "grams",
        amount: 10,
      },
    ],
    steps: [
      "In a pot, bring the dashi stock to a boil.",
      "Reduce the heat to low and add the miso paste. Stir until the miso paste is fully dissolved.",
      "Add the tofu and simmer for 5 minutes.",
      "Chop the green onions and seaweed into small pieces.",
      "Add the chopped green onions and seaweed to the soup.",
      "Simmer for another 2 minutes.",
      "Serve hot and enjoy!",
    ],
  };
}

export async function getInstruction(name: string) {
  const promptString = `Give me instructions for cooking ${name}.`;
  if (get(isdebug)) return await getMockedInstruction();
  const message = await getGptResponse(promptString, {
    functions: [{ name: "show_instruction", parameters: instruction_schema }],
    function_call: { name: "show_instruction" },
  });
  const instruction = JSON.parse(message.function_call.arguments);
  console.log({ instruction });
  return instruction;
}

export async function getGptResponse(
  query: string,
  options: Partial<CreateChatCompletionRequest>
) {
  messages.update((msg) => [...msg, { role: "user", content: query }]);
  console.log(messages);
  try {
    const completion = await api.createChatCompletion({
      model: gptmodel,
      messages: get(messages),
      temperature: 0,
      ...options,
    });
    console.log(completion.data);
    const message = completion.data.choices[0].message;
    messages.update((msg) => [...msg, message]);
    return message;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
      throw new Error(error.response.data.error.message);
    } else {
      console.log(error.message);
      throw new Error(error.message);
    }
  }
}
