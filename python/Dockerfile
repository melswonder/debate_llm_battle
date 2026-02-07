FROM python:3.12-slim

WORKDIR /app

# 依存関係をコピー
COPY requirements.txt .

# 依存関係をインストール
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY . .

# FastAPIサーバーを起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
