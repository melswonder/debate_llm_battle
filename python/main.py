from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, AsyncGenerator
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from dotenv import load_dotenv
from template import SYSTEM_PROMPT, TITLE_PROMPT, EVALUATION_PROMPT
import os
import json

# 環境変数をロード
load_dotenv()

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 会話履歴を保存（セッションごとに管理すべきだが、簡易版として全体で1つ）
conversation_history: List[Dict] = []

# LangChain ChatOpenAI初期化（ストリーミング対応）
llm = ChatOpenAI(
    model="gpt-5.2-2025-12-11",
    api_key=os.getenv("OPENAI_API_KEY"),
    streaming=True
)

class VoiceInput(BaseModel):
    text: str

class VoiceResponse(BaseModel):
    response: str

class TopicInput(BaseModel):
    topic: str

class Opinion(BaseModel):
    title: str
    description: str
    emoji: str

class OpinionsResponse(BaseModel):
    opinion1: Opinion
    opinion2: Opinion

async def generate_stream(user_message: str) -> AsyncGenerator[str, None]:
    """ストリーミングでAIの応答を生成"""
    # 会話履歴に追加
    conversation_history.append({"role": "user", "content": user_message})

    # LangChainメッセージ形式に変換
    messages = [SystemMessage(content=SYSTEM_PROMPT)]

    for msg in conversation_history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    # ストリーミングでAIからの応答を取得
    full_response = ""
    async for chunk in llm.astream(messages):
        content = chunk.content
        if content:
            full_response += content
            # Server-Sent Events形式で送信
            yield f"data: {json.dumps({'content': content})}\n\n"

    # 会話履歴に完全な応答を追加
    conversation_history.append({"role": "assistant", "content": full_response})

    # 終了シグナル
    yield f"data: {json.dumps({'done': True})}\n\n"

@app.post("/chat/")
async def chat(voice_input: VoiceInput):
    """ストリーミングチャットエンドポイント"""
    return StreamingResponse(
        generate_stream(voice_input.text),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.post("/generate-opinions/", response_model=OpinionsResponse)
def generate_opinions(topic_input: TopicInput):
    """論題から2つの対立する意見を生成"""
    topic = topic_input.topic

    messages = [
        SystemMessage(content=TITLE_PROMPT),
        HumanMessage(content=f"論題: {topic}")
    ]

    response = llm.invoke(messages)
    response_text = response.content

    # JSON部分を抽出
    try:
        # コードブロックを除去
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        opinions_data = json.loads(response_text.strip())

        return OpinionsResponse(
            opinion1=Opinion(**opinions_data["opinion1"]),
            opinion2=Opinion(**opinions_data["opinion2"])
        )
    except Exception as e:
        # エラー時はデフォルトの意見を返す
        return OpinionsResponse(
            opinion1=Opinion(
                title="賛成の立場",
                description="この論題に賛成する立場で議論します"
            ),
            opinion2=Opinion(
                title="反対の立場",
                description="この論題に反対する立場で議論します"
            )
        )

@app.post("/reset/")
def reset_conversation():
    """会話履歴をリセット"""
    global conversation_history
    conversation_history = []
    return {"status": "reset"}

@app.post("/evaluate/")
def evaluate_debate():
    """ディベートを評価"""
    # 会話履歴から評価用のテキストを構築
    debate_text = "論題とディベートの内容:\n\n"

    for i, msg in enumerate(conversation_history):
        role = "ユーザー" if msg["role"] == "user" else "AI"
        debate_text += f"{role}: {msg['content']}\n\n"

    messages = [
        SystemMessage(content=EVALUATION_PROMPT),
        HumanMessage(content=debate_text)
    ]

    response = llm.invoke(messages)
    response_text = response.content

    # JSON部分を抽出
    try:
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        evaluation_data = json.loads(response_text.strip())
        return evaluation_data
    except Exception as e:
        # エラー時はデフォルトの評価を返す
        return {
            "user_scores": {
                "logic": 15,
                "evidence": 15,
                "rebuttal": 15,
                "persuasiveness": 15,
                "structure": 15,
                "total": 75,
                "comments": {
                    "logic": "評価を生成できませんでした",
                    "evidence": "評価を生成できませんでした",
                    "rebuttal": "評価を生成できませんでした",
                    "persuasiveness": "評価を生成できませんでした",
                    "structure": "評価を生成できませんでした"
                }
            },
            "ai_scores": {
                "logic": 15,
                "evidence": 15,
                "rebuttal": 15,
                "persuasiveness": 15,
                "structure": 15,
                "total": 75,
                "comments": {
                    "logic": "評価を生成できませんでした",
                    "evidence": "評価を生成できませんでした",
                    "rebuttal": "評価を生成できませんでした",
                    "persuasiveness": "評価を生成できませんでした",
                    "structure": "評価を生成できませんでした"
                }
            },
            "winner": "user",
            "overall_comment": "評価を生成できませんでした"
        }

@app.get("/")
def read_root():
    return {"message": "AI Debate API is running"} 