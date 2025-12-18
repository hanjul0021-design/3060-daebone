
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationSettings, StoryInput, AnalysisResult, GeneratedScript, TitleGeneratorInput, TitleResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export async function analyzeStory(input: StoryInput): Promise<AnalysisResult> {
  const prompt = `
    다음 사연을 분석하여 주제, 관계, 갈등, 감정 곡선을 분류해주세요.
    개인정보(실명, 전화번호, 특정 위치 등)가 있다면 위험 요소로 체크하세요.
    
    사연 내용: ${input.content || input.keywords.join(', ')}
    참고 정보: ${input.conflict}, ${input.twist}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          relationship: { type: Type.STRING },
          conflictType: { type: Type.STRING },
          emotionCurve: { type: Type.STRING },
          safetyScore: { type: Type.NUMBER },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["topic", "relationship", "conflictType", "emotionCurve", "safetyScore", "risks"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateTitles(input: TitleGeneratorInput, filterOverride?: string): Promise<TitleResult[]> {
  const modeRule = input.mode === 'shorts' ? '12~22자(한국어)로 짧게, 강한 동사/결단/반전 우선' : '18~32자 허용, 배경/관계/감정 여운형';
  const coreContent = input.input.trim() || "구체적인 사건 없음 (선택된 카테고리와 관계를 바탕으로 가장 갈등이 깊고 공감되는 가상의 사연을 가정하여 생성)";
  
  const systemInstruction = `
    당신은 3060 타겟 유튜브/라디오 제목 전문가입니다.
    다음 조건에 맞춰 클릭을 유발하는 제목 후보 20개를 생성하세요.
    각 제목에는 그 제목에 어울리는 '등장인물'과 '반전/깨달음' 내용도 함께 생성해야 합니다.
    
    [입력 정보]
    - 모드: ${input.mode === 'shorts' ? '숏츠(15~60초)' : '롱폼(3~10분)'}
    - 카테고리: ${input.category}
    - 감정: ${input.emotion}
    - 관계: ${input.relationship}
    - 핵심내용: ${coreContent}
    - 수위: ${input.intensity}
    ${filterOverride ? `- 추가 필터: ${filterOverride}` : ''}

    [중요 지침]
    핵심내용이 구체적이지 않더라도, 선택된 '카테고리(${input.category})', '감정(${input.emotion})', '관계(${input.relationship})'를 조합했을 때 가장 흔히 발생하면서도 조회수가 잘 나오는 '갈등 상황'이나 '사연'을 스스로 상정하여 제목을 만드세요.

    [제목 생성 알고리즘]
    1. 훅 템플릿 사용: "딱 {한마디} 때문에 {결과}", "{관계}가 {행동}한 날, 나는 {결심}", "아무 말도 안 했는데 {반전}", "그날 이후 {관계}는 달라졌다" 등.
    2. 모드 규칙: ${modeRule}
    3. 금지 사항: 실명, 특정 상호 금지 (○○으로 마스킹). 비속어 배제.
    
    [점수 계산 기준 (0~100점)]
    - HookPower (30점): 강렬한 도입부
    - Clarity (25점): 관계/사건 명확성
    - Emotion (20점): 감정 자극
    - CuriosityGap (15점): 반전/궁금증
    - LengthFit (10점): 글자수 최적화
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: systemInstruction,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            score: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            hookType: { type: Type.STRING },
            characters: { type: Type.STRING, description: "이 제목 시나리오에 어울리는 등장인물 구성 (예: 50대 엄마와 취준생 아들)" },
            twist: { type: Type.STRING, description: "이 제목 시나리오의 핵심 반전이나 깨달음 한 문장" }
          },
          required: ["title", "score", "tags", "hookType", "characters", "twist"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateScript(
  settings: GenerationSettings,
  input: StoryInput,
  analysis: AnalysisResult
): Promise<GeneratedScript> {
  const prompt = `
    당신은 30대~60대 타겟의 베테랑 라디오 작가입니다. 다음 조건에 따라 전문적인 방송 대본을 생성하세요.
    
    [조건]
    - 타겟 연령: ${settings.ageGroup}
    - 포맷: ${settings.format}
    - 길이: ${settings.length}
    - 톤: ${settings.tone}
    - 수위: ${settings.intensity}
    - 주제: ${analysis.topic}
    - 감정 곡선: ${analysis.emotionCurve}
    
    [입력 데이터]
    - 원문/키워드: ${input.content || input.keywords.join(', ')}
    - 등장인물: ${input.characters}
    - 핵심 갈등: ${input.conflict}
    - 반전: ${input.twist}
    
    [필수 규칙 - 가독성 극대화]
    1. 모든 실명, 직장명, 학교명은 "○○"으로 마스킹하세요.
    2. 효과음(BGM, SFX)을 [BGM: 잔잔한 피아노] 형태로 본문에 포함하세요.
    3. 본문과 클라이맥스 대사에서 **한 문장이나 한 번의 대사가 끝나면 반드시 줄바꿈(엔터)**을 하세요. 
    4. 대화문은 반드시 "사연자: 내용", "상대방: 내용" 처럼 화자를 명시하고 각 줄을 독립적으로 배치하세요.
    5. 자막용 문장은 8-12줄로 각 줄당 12-18자 정도로 짧게 구성하세요.
    6. 썸네일 문구는 클릭을 유발하는 궁금증 유발형 문구 3개를 만드세요.
    7. 해시태그는 20개 내외로 생성하세요.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          opening: { type: Type.STRING },
          intro: { type: Type.STRING },
          body: { type: Type.STRING },
          climax: { type: Type.STRING },
          ending: { type: Type.STRING },
          comment: {
            type: Type.OBJECT,
            properties: {
              empathy: { type: Type.STRING },
              advice: { type: Type.STRING },
              outro: { type: Type.STRING }
            },
            required: ["empathy", "advice", "outro"]
          },
          captions: { type: Type.ARRAY, items: { type: Type.STRING } },
          thumbnails: { type: Type.ARRAY, items: { type: Type.STRING } },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["opening", "intro", "body", "climax", "ending", "comment", "captions", "thumbnails", "hashtags"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    ...result,
    id: Math.random().toString(36).substr(2, 9),
    settings,
    timestamp: Date.now()
  };
}
