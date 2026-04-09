import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { content } = await req.json();

  const result = await generateObject({
    model: google("gemini-3.1-flash-lite-preview"),
    schema: z.object({
      title: z.string().describe("일기의 내용을 요약하는 짧고 감성적인 제목"),
      sentiment: z.object({
        label: z.string(),
        emoji: z.string(),
        index: z.number().describe("0:행복, 1:슬픔, 2:분노, 3:놀람, 4:평온"),
      }),
      analysis: z.string(),
    }),
    prompt: `다음은 사용자가 작성한 오늘 하루의 일기입니다. 이 일기를 분석하여 다음 정보를 생성해 주세요:
    1. 일기를 요약하는 짧고 감성적인 제목
    2. 가장 적절한 감정 분류
    3. 일기에 대한 다정한 말투의 분석 및 공감 결과
    
    일기 내용: "${content}"
    
    감정 카테고리:
    0: 행복 (😊)
    1: 슬픔 (😢)
    2: 분노 (😡)
    3: 놀람 (😲)
    4: 평온 (😐)
    
    분석 결과는 한국어로 작성해 주세요.`,
  });

  return result.toJsonResponse();
}
