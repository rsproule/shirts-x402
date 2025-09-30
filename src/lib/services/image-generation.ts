/**
 * Generate a catchy product title using an LLM
 * @param prompt - The original design prompt
 * @returns A concise, creative title for the shirt
 */
export async function generateShirtTitle(prompt: string): Promise<string> {
  // TODO: Implement with Vercel AI SDK
  // Example:
  // import { generateText } from 'ai';
  // import { openai } from '@ai-sdk/openai';
  // const result = await generateText({
  //   model: openai('gpt-4o'),
  //   prompt: `Generate a short, catchy product title (max 50 characters) for a t-shirt with this design: "${prompt}". Return only the title, nothing else.`,
  // });
  // return result.text;

  console.log("📝 Generating title for prompt:", prompt);

  // Dummy implementation - create a simple title
  await new Promise((resolve) => setTimeout(resolve, 500));

  const words = prompt.split(" ").slice(0, 4);
  const dummyTitle = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  console.log("✅ Title generated:", dummyTitle);
  return dummyTitle;
}

/**
 * Generate shirt design image using Vercel AI SDK
 * @param prompt - The design prompt from the user
 * @returns URL of the generated image
 */
export async function generateShirtImage(prompt: string): Promise<string> {
  // TODO: Implement with Vercel AI SDK
  // Example:
  // import { generateImage } from 'ai';
  // const result = await generateImage({
  //   model: openai.image('dall-e-3'),
  //   prompt: prompt,
  //   size: '1024x1024',
  // });
  // return result.url;

  console.log("🎨 Generating image for prompt:", prompt);

  // Dummy implementation - return placeholder
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const dummyImageUrl = `https://via.placeholder.com/1024x1024.png?text=${encodeURIComponent(
    prompt.slice(0, 50),
  )}`;

  console.log("✅ Image generated:", dummyImageUrl);
  return dummyImageUrl;
}

/**
 * Generate both image and title for a shirt design
 * @param prompt - The design prompt from the user
 * @returns Image URL and generated title
 */
export async function generateShirtDesign(prompt: string): Promise<{
  imageUrl: string;
  title: string;
}> {
  console.log("🎨 Generating complete shirt design for prompt:", prompt);

  // Generate both in parallel for better performance
  const [imageUrl, title] = await Promise.all([
    generateShirtImage(prompt),
    generateShirtTitle(prompt),
  ]);

  console.log("✅ Complete design generated:", { imageUrl, title });

  return { imageUrl, title };
}

/**
 * Configuration for image generation
 */
export interface ImageGenerationConfig {
  model?: string;
  size?: "1024x1024" | "1792x1024" | "1024x1792";
  quality?: "standard" | "hd";
  style?: "vivid" | "natural";
}

export const DEFAULT_IMAGE_CONFIG: ImageGenerationConfig = {
  model: "dall-e-3",
  size: "1024x1024",
  quality: "hd",
  style: "vivid",
};
