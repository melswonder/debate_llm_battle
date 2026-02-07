.PHONY: help up down build logs clean install test

help: ## ヘルプを表示
	@echo "利用可能なコマンド:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Dockerコンテナを起動
	docker-compose up

up-d: ## Dockerコンテナをバックグラウンドで起動
	docker-compose up -d

down: ## Dockerコンテナを停止
	docker-compose down

build: ## Dockerイメージをビルド
	docker-compose build

rebuild: ## Dockerイメージを再ビルドして起動
	docker-compose up --build

logs: ## ログを表示
	docker-compose logs -f

logs-frontend: ## フロントエンドのログを表示
	docker-compose logs -f frontend

logs-backend: ## バックエンドのログを表示
	docker-compose logs -f backend

clean: ## コンテナとボリュームを削除
	docker-compose down -v
	rm -rf node_modules

install: ## ローカル環境で依存関係をインストール
	npm install
	cd python && pip install -r requirements.txt

dev-frontend: ## フロントエンドをローカルで起動
	npm start

dev-backend: ## バックエンドをローカルで起動
	cd python && uvicorn main:app --reload

setup: ## 初期セットアップ
	@if [ ! -f .env ]; then \
		echo ".env ファイルが存在しません。.env.example をコピーして .env を作成します..."; \
		cp .env.example .env; \
		echo ".env ファイルを作成しました。OPENAI_API_KEYを設定してください。"; \
	else \
		echo ".env ファイルは既に存在します。"; \
	fi

restart: ## コンテナを再起動
	docker-compose restart

ps: ## コンテナの状態を確認
	docker-compose ps
