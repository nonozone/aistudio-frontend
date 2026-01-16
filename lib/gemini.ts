import { GoogleGenAI } from "@google/genai";
import { StyleType } from "./types";
import { STYLE_OPTIONS } from "./constants";

export async function generateWithGemini(base64Image: string, style: StyleType) {
  // Always initialize AI client with process.env.API_KEY directly as specified in the guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const selectedStyle = STYLE_OPTIONS.find(s => s.id === style);
  
  const systemInstruction = `You are a master digital artist specializing in "Pet Reconstruction". 
You transform cat photos into specific physical art mediums while preserving their identity.`;
  
  const prompt = `Convert this cat into: ${selectedStyle?.promptKeyword}. 
Requirement: Keep the exact fur patterns and eye color. Centered composition. Museum lighting. 
The image must look like a real physical object (wood carving, clay, etc.) on a minimalist neutral background.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.includes(',') ? base64Image.split(',')[1] : base64Image,
              mimeType: 'image/jpeg',
            },
          },
          { text: prompt },
        ],
      },
      config: {
        systemInstruction,
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    const urls: string[] = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          urls.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    }
    
    if (urls.length === 0) throw new Error("EMPTY_RESPONSE");
    return urls;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
