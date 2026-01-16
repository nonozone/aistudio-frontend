
import { GoogleGenAI } from "@google/genai";
import { StyleType } from "../types";
import { STYLE_OPTIONS } from "../constants";

// 定义统一的 AI 响应接口
export interface AIProviderResponse {
  imageUrls: string[];
  provider: string;
  model: string;
}

// 定义供应商枚举，方便未来扩展
export enum AIProvider {
  GEMINI = 'GEMINI',
  OPENAI = 'OPENAI', // Future
  CLAUDE = 'CLAUDE'  // Future
}

/**
 * 统一的 AI 调度服务
 * 目前仅集成 Gemini，但架构上已支持多供应商分发
 */
export const generateArtisticContent = async (
  base64Image: string,
  style: StyleType,
  provider: AIProvider = AIProvider.GEMINI
): Promise<AIProviderResponse> => {
  
  switch (provider) {
    case AIProvider.GEMINI:
      return await callGemini(base64Image, style);
    
    case AIProvider.OPENAI:
      throw new Error("OpenAI integration coming soon.");
      
    default:
      throw new Error("Unsupported provider.");
  }
};

/**
 * 具体的 Gemini 实现 (私有函数)
 */
async function callGemini(base64Image: string, style: StyleType): Promise<AIProviderResponse> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const selectedStyle = STYLE_OPTIONS.find(s => s.id === style);
  
  const systemInstruction = `你是一位享誉全球的数字艺术家与雕刻大师。你的专长是“神韵重构”。
提取照片中猫咪的核心特征，重构成具有特定物理质感的艺术品。`;
  
  const prompt = `风格：${selectedStyle?.promptKeyword}。精准保留花纹和瞳色，博物馆级布光，居中构图。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
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
    
    return {
      imageUrls: urls,
      provider: 'Google Gemini',
      model: 'gemini-2.5-flash-image'
    };
  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}
