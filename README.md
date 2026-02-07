# Debate LLM Battle

LLMを使った討論バトルアプリケーションです。AIと対話しながらディベートを行い、評価を受けることができます。

## 技術スタック

- **フロントエンド**: React 19 + TypeScript
- **バックエンド**: FastAPI (Python 3.12)
- **LLM**: OpenAI GPT-4o (LangChain経由)

## セットアップ方法

このプロジェクトはDockerで動かすことを推奨します。

### 前提条件

- Docker と Docker Compose がインストールされていること
- OpenAI APIキーを取得していること ([https://platform.openai.com/api-keys](https://platform.openai.com/api-keys))

### Docker での起動（推奨）

1. **環境変数の設定**

```bash
# .envファイルを作成（Makefileを使う場合）
make setup

# または手動で作成
cp .env.example .env
```

2. `.env` ファイルを編集して、OpenAI APIキーを設定:

```bash
OPENAI_API_KEY=sk-proj-...
```

3. **アプリケーションを起動**

```bash
# Makefileを使う場合
make up

# またはdocker-composeコマンド
docker-compose up
```

4. ブラウザで以下のURLを開く:
   - フロントエンド: [http://localhost:3000](http://localhost:3000)
   - バックエンドAPI: [http://localhost:8000](http://localhost:8000)
   - API ドキュメント: [http://localhost:8000/docs](http://localhost:8000/docs)

5. 停止する場合:

```bash
# Makefileを使う場合
make down

# またはdocker-composeコマンド
docker-compose down
```

### Makefileコマンド

便利なコマンドをMakefileで提供しています:

```bash
make help          # ヘルプを表示
make up            # コンテナを起動
make up-d          # バックグラウンドで起動
make down          # コンテナを停止
make build         # イメージをビルド
make rebuild       # 再ビルドして起動
make logs          # ログを表示
make logs-frontend # フロントエンドのログのみ表示
make logs-backend  # バックエンドのログのみ表示
make clean         # コンテナとボリュームを削除
make restart       # コンテナを再起動
make ps            # コンテナの状態を確認
```

### ローカル環境での起動

Node.js 22以上とPython 3.12以上が必要です。

1. **依存関係をインストール**

```bash
# フロントエンド
npm install

# バックエンド
cd python
pip install -r requirements.txt
cd ..
```

2. **環境変数を設定**

```bash
cp .env.example .env
# .envファイルを編集してOPENAI_API_KEYを設定
```

3. **アプリケーションを起動**

```bash
# ターミナル1: フロントエンド
npm start

# ターミナル2: バックエンド
cd python
uvicorn main:app --reload
```

## プロジェクト構成

```
debate_llm_battle/
├── src/                  # Reactフロントエンドのソースコード
├── python/              # FastAPIバックエンド
│   ├── main.py         # FastAPIアプリケーション
│   ├── template.py     # プロンプトテンプレート
│   └── requirements.txt
├── docker-compose.yml  # Docker Compose設定
├── Dockerfile          # フロントエンド用Dockerfile
├── Makefile           # 便利なコマンド集
└── README.md
```

