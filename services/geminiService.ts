
import { GoogleGenAI } from "@google/genai";
import { StyleType } from "../types";
import { STYLE_OPTIONS } from "../constants";

export const generateArtisticImages = async (
  base64Image: string,
  style: StyleType
): Promise<string[]> => {
  // Initialize AI client inside the function to ensure the most current API_KEY from environment is used (Best Practice)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const selectedStyle = STYLE_OPTIONS.find(s => s.id === style);
  
  // 更加专业和具体的系统提示词，对标架构文档中的“数字影像与传统工艺连接”
  const systemInstruction = `你是一位享誉全球的数字艺术家与雕刻大师。你的专长是“神韵重构”。
你的任务是解析用户上传的猫咪照片，提取其核心的生物特征（如花纹分布、眼神形态、骨架结构），
并将其重构成具有特定物理质感的艺术品。输出应该是极高清晰度、具有深度光影的单体艺术品摄影。`;
  
  const prompt = `这是一张关于“喵的二次方”实验室的艺术重构请求。
目标风格：${selectedStyle?.promptKeyword}。
核心要求：
1. 必须精准保留参考图中猫咪的独特花纹标记（Markings）和瞳孔颜色。
2. 呈现出真实的物理媒介质感（如木材纹理、泥土湿润感或笔触厚度）。
3. 环境：极简背景，博物馆级布光，强调材质的凹凸感和雕刻细节。
4. 构图：居中单体作品，景深浅，突出主体艺术品的工艺。
请输出这张重构后的艺术品图像。`;

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
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    const imageUrls: string[] = [];
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrls.push(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    }
    return imageUrls;
  } catch (error) {
    console.error("Gemini 生成故障:", error);
    throw error;
  }
};
