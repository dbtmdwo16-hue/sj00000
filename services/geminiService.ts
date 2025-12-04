import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Message } from '../types';

// Initialize the client. 
// NOTE: In a production app, handle API key security carefully.
// Vercel 배포 시 Environment Variables에 API_KEY를 설정해야 합니다.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MENTOR_SYSTEM_INSTRUCTION = `
당신은 따뜻하고 공감 능력이 뛰어난 AI 멘토 "도약"입니다. 
당신의 목표는 사용자가 동기를 부여받고, 공부 습관을 기르며, 사회적 고립감이나 무기력함을 천천히 극복하도록 돕는 것입니다.
사용자는 은둔형 외톨이(히키코모리)이거나 쉬었음 세대(니트족)일 수 있습니다.

1. 판단하지 마세요. 아주 작은 성공도 진심으로 축하해주세요 (예: "침대에서 나오셨군요!", "책을 펼치셨네요, 대단해요!").
2. 공부 조언을 할 때는 "뽀모도로 기법"이나 "5분만 하기" 처럼 부담 없는 방법을 제안하세요.
3. 사회적 불안을 느낄 때는 아주 간단한 시나리오(카페에서 주문하기, 인사하기) 연습을 제안하세요.
4. 답변은 되도록 3-4문장 이내로 간결하게 하되, 구체적인 설명이 필요할 때만 길게 하세요.
5. 말투는 부드럽고 친절한 한국어 존댓말(해요체)을 사용하세요. 이모지를 적절히 사용하여 따뜻한 느낌을 주세요.
`;

// Helper to clean markdown code blocks from JSON response
const cleanAndParseJSON = (text: string) => {
  try {
    // Remove ```json, ```, and trim whitespace
    const cleanText = text.replace(/```(?:json)?|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    throw e;
  }
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
};

export const sendMessageStream = async (
  chat: Chat, 
  message: string
) => {
  return chat.sendMessageStream({ message });
};

export const breakDownGoal = async (goalTitle: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `사용자의 목표: "${goalTitle}". 
      이 목표를 당장 시작할 수 있도록 10분 이내에 완료 가능한 '아주 작은 마이크로 실행 단계' 3가지로 쪼개주세요.
      오직 JSON 배열(string array) 형태의 텍스트만 반환하세요. 마크다운 포맷팅 없이.`,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const text = response.text;
    if (!text) return ["노트 펼치기", "1분 동안 쳐다보기", "제목만 적어보기"];
    
    return cleanAndParseJSON(text) as string[];
  } catch (error) {
    console.error("Error breaking down goal:", error);
    return ["1단계: 일단 자리에 앉기", "2단계: 심호흡 한 번 하기", "3단계: 아주 조금만 시작하기"];
  }
};

export const generateSpark = async (): Promise<{title: string, content: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `무기력함을 느끼거나 동기가 필요한 사람을 위한 "오늘의 영감(Daily Spark)"을 한국어로 생성해주세요.
      흥미로운 짧은 사실, 작게 시작하는 것에 대한 스토아 철학 명언, 또는 아주 사소한 "오늘의 미션" (예: 물 한 잔 마시기, 창문 열고 하늘 보기) 중 하나여야 합니다.
      다음 JSON 형식으로 반환하세요: { "title": "짧은 제목", "content": "내용" }`,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    return cleanAndParseJSON(text);
  } catch (error) {
    return {
      title: "잠시 숨 고르기",
      content: "4초간 숨을 들이마시고, 4초간 멈추고, 4초간 내뱉어보세요. 당신은 충분히 잘하고 있습니다."
    };
  }
};