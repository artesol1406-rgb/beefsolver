import { GoogleGenAI, Type } from "@google/genai";
import { DIMENSIONES } from "../lib/amalgam";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AmalgamAnalysis {
  concreteLayer: string;
  humanLayer: string;
  analogy: string;
  lovePath: string;
  judgeVerdict: string;
}

export async function getAmalgamAnalysis(
  situation: string,
  partyA: { name: string; argument: string; vector: number[] },
  partyB: { name: string; argument: string; vector: number[] },
  unionInfo: { midpoint: number[]; distance: number; meta: string }
): Promise<AmalgamAnalysis> {
  const prompt = `
    You are the "Grand Amalgam Judge", a cosmic mediator based on the Amalgam v11 universal systems analyzer.
    Your objective is to resolve a conflict between two parties using 11-dimensional state space analysis and symbolic geometry.

    SITUATION: "${situation}"

    PARTY A (${partyA.name}): "${partyA.argument}"
    Vector A (first 5 dims): ${partyA.vector.slice(0, 5).map(v => v.toFixed(2)).join(", ")}

    PARTY B (${partyB.name}): "${partyB.argument}"
    Vector B (first 5 dims): ${partyB.vector.slice(0, 5).map(v => v.toFixed(2)).join(", ")}

    GEOMETRIC SYNTESIS:
    - Fisher-Rao Distance: ${unionInfo.distance.toFixed(3)} rad
    - Meta-stability: ${unionInfo.meta}
    - Union Midpoint (first 5 dims): ${unionInfo.midpoint.slice(0, 5).map(v => v.toFixed(2)).join(", ")}

    TASK:
    Generate a response in 5 parts:
    1. CONCRETE LAYER: A factual, non-judgmental description of the structural interaction.
    2. HUMAN LAYER: Deep emotional needs, fears, and underlying subtext for BOTH parties.
    3. ANALOGY: Create a unique, poetic analogy (e.g., The Tree and the Wind) that reduces separation without canceling differences.
    4. LOVE PATH (CAMINO AMOR): A minimal, concrete, and viable action (1 min to 1 hour) they can do together to bridge the gap.
    5. JUDGE VERDICT: A final authoritative yet compassionate ruling from the Grand Mediator.

    RESPOND IN JSON FORMAT.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["concreteLayer", "humanLayer", "analogy", "lovePath", "judgeVerdict"],
          properties: {
            concreteLayer: { type: Type.STRING },
            humanLayer: { type: Type.STRING },
            analogy: { type: Type.STRING },
            lovePath: { type: Type.STRING },
            judgeVerdict: { type: Type.STRING },
          },
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("The cosmic wisdom was interrupted. Please try again.");
  }
}
