# Cinerino Console Web Application

## Table of contents

* [Usage](#usage)

## Usage

### Environment variables

| Name                          | Required | Value              | Purpose                |
|-------------------------------|----------|--------------------|------------------------|
| `DEBUG`                       | false    | cinerino-console:* | Debug                  |
| `BASIC_AUTH_NAME`             | false    |                    | Basic Authentication   |
| `BASIC_AUTH_PASS`             | false    |                    | Basic Authentication   |
| `REDIS_HOST`                  | true     |                    | Redis Cache connection |
| `REDIS_PORT`                  | true     |                    | Redis Cache connection |
| `REDIS_KEY`                   | true     |                    | Redis Cache connection |
| `GMO_ENDPOINT`                | true     |                    | GMO APIエンドポイント         |
| `GMO_SITE_ID`                 | true     |                    | GMO サイトID              |
| `API_ENDPOINT`                | true     |                    | APIエンドポイント             |
| `API_AUTHORIZE_SERVER_DOMAIN` | true     |                    | API認可サーバードメイン          |
| `API_CLIENT_ID`               | true     |                    | APIクライアントID            |
| `API_CLIENT_SECRET`           | true     |                    | APIクライアントシークレット        |
| `API_CODE_VERIFIER`           | true     |                    | APIコード検証鍵              |
| `USER_EXPIRES_IN_SECONDS`     | true     |                    | ログインユーザーセッション保持期間      |
