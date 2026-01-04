
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";

const MODEL_NAME = 'gemini-3-pro-preview';

const SYSTEM_PROMPT = `Sos un asistente experto en psicología vincular y mediación comunitaria para familias (Calesita.ai). Tu objetivo es analizar perfiles y encontrar afinidad para encuentros reales.

Recibirás: PIN de sala, perfiles de familia, coordenadas GPS e información de confianza.

REGLAS DE CONFIANZA (SOCIAL PROXIMITY & REVIEWS):
- Si tienes coordenadas GPS, sugiere un punto de encuentro REAL (plaza, café, parque) que esté a mitad de camino.
- El affinityReport debe ser BREVE y VISUAL (usa emojis).
- Genera 2 o 3 REVIEWS/TESTIMONIOS realistas tipo Airbnb de otras familias. Deben ser breves, cálidas y resaltar valores (ej: "Familia súper respetuosa", "Los chicos se llevaron genial").

FORMATO DE RESPUESTA (JSON):
{
  "affinityReport": "Resumen visual breve con emojis.",
  "socialProof": "Frase sobre confianza.",
  "reviews": [
    { "author": "Nombre Familia", "text": "Testimonio breve", "rating": 5, "verified": true }
  ],
  "status": "MATCH_CONFIRMADO",
  "gamePlan": {
    "locationTime": "Punto de encuentro: [Nombre Plaza Real]. Hoy a las [Hora].",
    "interests": "Intereses comunes.",
    "values": "Valores compartidos."
  }
}

Sé extremadamente concreto.`;

export interface Review {
  author: string;
  text: string;
  rating: number;
  verified: boolean;
}

export interface GamePlan {
  locationTime: string;
  interests: string;
  values: string;
}

export interface MatchResult {
  affinityReport: string;
  socialProof: string;
  reviews: Review[];
  status: 'MATCH_CONFIRMADO' | 'SUGERENCIA_DE_ESPERA';
  gamePlan: GamePlan;
}

export class GeminiService {
  private ai: GoogleGenAI;
  private activeChat: Chat | null = null;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  async processMatch(userData: any, activeProfiles: any[]): Promise<MatchResult> {
    const prompt = `
      SALA: ${userData.pin}
      USUARIO ACTUAL: ${JSON.stringify(userData)}
      COORDS: ${userData.coords ? JSON.stringify(userData.coords) : 'No disponibles'}
      PERFILES ACTIVOS EN SALA: ${JSON.stringify(activeProfiles)}
      Tarea: Genera un match que parezca real y seguro.
    `;

    const response = await this.ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.4
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse match result", e);
      throw new Error("Invalid response format from AI");
    }
  }

  async startChat(history: any[] = []) {
    this.activeChat = this.ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "Sos el moderador de 'Calesita.ai'. Facilita el encuentro real. Sé breve y cálido.",
        temperature: 0.7
      },
      history: history
    });
    return this.activeChat;
  }

  async sendMessage(msg: string) {
    if (!this.activeChat) await this.startChat();
    const result = await this.activeChat!.sendMessage({ message: msg });
    return result.text;
  }
}

export const geminiService = new GeminiService();
