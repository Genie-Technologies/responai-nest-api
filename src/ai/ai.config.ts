import { Configuration, OpenAIApi } from "openai-edge";
import OpenAI from "openai";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const openai2 = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;
