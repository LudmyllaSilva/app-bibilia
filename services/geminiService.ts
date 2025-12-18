
import { GoogleGenAI, Type } from "@google/genai";
import { Explanation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getVerseExplanation = async (verseText: string, reference: string): Promise<Explanation> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explique o seguinte versículo da Bíblia (${reference}): "${verseText}"`,
      config: {
        systemInstruction: `Você é um erudito bíblico, historiador e teólogo. Sua tarefa é fornecer uma explicação profunda e clara de versículos bíblicos.
        Estruture sua resposta estritamente no seguinte formato JSON, focando em:
        1. Contexto Histórico: O que estava acontecendo na época em que foi escrito.
        2. Insights Linguísticos: Significado de palavras-chave no original (Grego/Hebraico).
        3. Significado Espiritual: A mensagem teológica central.
        4. Aplicação Prática: Como aplicar isso na vida hoje.
        Idioma: Português Brasileiro.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            historicalContext: { type: Type.STRING },
            linguisticInsights: { type: Type.STRING },
            spiritualMeaning: { type: Type.STRING },
            practicalApplication: { type: Type.STRING },
          },
          required: ["historicalContext", "linguisticInsights", "spiritualMeaning", "practicalApplication"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result as Explanation;
  } catch (error) {
    console.error("Erro ao obter explicação do Gemini:", error);
    throw new Error("Não foi possível gerar a explicação no momento.");
  }
};
