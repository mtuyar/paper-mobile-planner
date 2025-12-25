import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const breakdownTaskWithAI = async (goal: string): Promise<{ title: string; description: string; steps: string[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Aşağıdaki hedefi yapılacaklar listesi için uygulanabilir, somut adımlara ayır. Hedef: "${goal}". Adımları kısa ve net tut. Yanıtı Türkçe ver.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Proje veya görev listesi için kısa, akılda kalıcı bir başlık.",
            },
            description: {
              type: Type.STRING,
              description: "Bir cümlelik motive edici özet.",
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "3-6 adet uygulanabilir alt görev listesi.",
            },
          },
          required: ["title", "steps"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Yapay zekadan yanıt alınamadı");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini AI Hatası:", error);
    // Fallback if AI fails
    return {
      title: goal,
      description: "Manuel planlama gerekiyor.",
      steps: ["İlk adım", "İkinci adım"],
    };
  }
};