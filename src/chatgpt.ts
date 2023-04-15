import './fetch-polyfill'
import * as core from '@actions/core'

const generatePrompt = (patch: string) => {
  const answerLanguage = process.env.LANGUAGE ? `,Answer me in ${process.env.LANGUAGE},` : '';
  return `As a tech reviewer, please give a score for the pull request and pay close attention to the following:
  * Review the title, body, and changes made in the pull request.
  * Identify any problems and provide clear descriptions and suggestions for how to address them.
  * Offer constructive suggestions for optimizing the changes made in the pull request.
  * Avoid providing unnecessary explanations or summaries that may delay the review process.
  * Provide feedback in a concise and clear manner to help expedite the review process.
  * No need for thanking in the review message.

  Bellow is the code patch, ${answerLanguage} if any bug risk and improvement suggestion are welcome
  ${patch}`;
};

const DEFAULT_MODEL = 'gpt-3.5-turbo';
const DEFAULT_TEMPERATURE = 1;

export async function reviewCode(content: string) {
  // Validate inputs
  if (!content) {
    throw new Error('Content is required')
  }

  // Initialize chatgpt client
  const { ChatGPTAPI } = await import('chatgpt');
  const gpt = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY || '',
    completionParams: {
      model: core.getInput("model") || DEFAULT_MODEL,
      temperature: +(core.getInput("temperature") || 0) || DEFAULT_TEMPERATURE,
    },
  });

  try {
    const prompt = generatePrompt(content);
    const res = await gpt.sendMessage(prompt);
    return res.text;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate review');
  }
}

export async function scoreCode(content: string) {
  // Validate inputs
  if (!content) {
    throw new Error('Content is required')
  }

  // Initialize chatgpt client
  const { ChatGPTAPI } = await import('chatgpt');
  const gpt = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY || '',
    completionParams: {
      model: core.getInput("model") || DEFAULT_MODEL,
      temperature: +(core.getInput("temperature") || 0) || DEFAULT_TEMPERATURE,
    },
  });

  try {
    const prompt = generatePrompt(content);
    const res = await gpt.sendMessage(prompt);
    return res.text;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate review');
  }
}
