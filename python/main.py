from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from dotenv import load_dotenv
from template import SYSTEM_PROMPT, TITLE_PROMPT
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

# LangChain ChatOpenAI初期化
llm = ChatOpenAI(
    model="gpt-4o",
    api_key=os.getenv("OPENAI_API_KEY")
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

class OpinionsResponse(BaseModel):
    opinion1: Opinion
    opinion2: Opinion

@app.post("/chat/", response_model=VoiceResponse)
def chat(voice_input: VoiceInput):
    user_message = voice_input.text

    # 会話履歴に追加
    conversation_history.append({"role": "user", "content": user_message})

    # LangChainメッセージ形式に変換
    messages = [SystemMessage(content=SYSTEM_PROMPT)]

    for msg in conversation_history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    # AIからの応答を取得
    response = llm.invoke(messages)
    ai_response = response.content

    # 会話履歴に追加
    conversation_history.append({"role": "assistant", "content": ai_response})

    return VoiceResponse(response=ai_response)

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

@app.get("/")
def read_root():
    return {"message": "AI Debate API is running"} 