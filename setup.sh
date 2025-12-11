#!/bin/bash

echo "🚀 AI Debate Game - セットアップを開始します"
echo ""

# エラーが発生したら停止
set -e

# 1. Python仮想環境の作成
echo "📦 Python仮想環境を作成中..."
cd python
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi
echo "✅ 仮想環境を作成しました"

# 2. Python依存関係のインストール
echo "📦 Pythonパッケージをインストール中..."
.venv/bin/pip install -r requirements.txt
echo "✅ Pythonパッケージをインストールしました"

# 3. .envファイルの作成（存在しない場合）
if [ ! -f ".env" ]; then
    echo "📝 .envファイルを作成中..."
    cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
EOF
    echo "⚠️  .envファイルを作成しました。OpenAI API Keyを設定してください。"
fi

cd ..

# 4. Node.js依存関係のインストール
echo "📦 Node.jsパッケージをインストール中..."
npm install
echo "✅ Node.jsパッケージをインストールしました"

# 5. フロントエンド用.envファイルの作成（存在しない場合）
if [ ! -f ".env" ]; then
    echo "📝 フロントエンド用.envファイルを作成中..."
    cat > .env << EOF
REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
EOF
    echo "⚠️  .envファイルを作成しました。OpenAI API Keyを設定してください。"
fi

echo ""
echo "✨ セットアップが完了しました！"
echo ""
echo "📝 次のステップ:"
echo "1. python/.env と .env の OPENAI_API_KEY を設定してください"
echo ""
echo "🚀 アプリケーションの起動方法:"
echo ""
echo "ターミナル1 (バックエンド):"
echo "  cd python"
echo "  .venv/bin/python -m uvicorn main:app --reload --port 8000"
echo ""
echo "ターミナル2 (フロントエンド):"
echo "  npm start"
echo ""
