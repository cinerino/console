# Cinerino Console Web Application

## Table of contents

* [Usage](#usage)

## Usage

### Environment variables

| Name                          | Required | Value              | Purpose                            |
| ----------------------------- | -------- | ------------------ | ---------------------------------- |
| `DEBUG`                       | false    | cinerino-console:* | Debug                              |
| `BASIC_AUTH_NAME`             | false    |                    | Basic Authentication               |
| `BASIC_AUTH_PASS`             | false    |                    | Basic Authentication               |
| `REDIS_HOST`                  | true     |                    | Redis Cache connection             |
| `REDIS_PORT`                  | true     |                    | Redis Cache connection             |
| `REDIS_KEY`                   | true     |                    | Redis Cache connection             |
| `REDIS_TLS_SERVERNAME`        | false    |                    | Redis Cache Connection             |
| `PROJECTS`                    | true     |                    | 管理プロジェクトリスト             |
| `COA_ENDPOINT`                | true     |                    | COAエンドポイント                  |
| `COA_REFRESH_TOKEN`           | true     |                    | COAリフレッシュトークン            |
| `API_AUTHORIZE_SERVER_DOMAIN` | true     |                    | API認可サーバードメイン            |
| `API_CLIENT_ID`               | true     |                    | APIクライアントID                  |
| `API_CLIENT_SECRET`           | true     |                    | APIクライアントシークレット        |
| `API_CODE_VERIFIER`           | true     |                    | APIコード検証鍵                    |
| `USER_EXPIRES_IN_SECONDS`     | true     |                    | ログインユーザーセッション保持期間 |
| `WAITER_ENDPOINT`             | true     |                    | WAITER Endpoint                    |
| `TELEMETRY_API_ENDPOINT`      | true     |                    | Telemetry API Endpoint             |
