# Cinerino Console Web Application

## Table of contents

* [Usage](#usage)

## Usage

### Environment variables

| Name                               | Required | Value              | Purpose                |
|------------------------------------|----------|--------------------|------------------------|
| `DEBUG`                            | false    | cinerino-console:* | Debug                  |
| `NPM_TOKEN`                        | true     |                    | NPM auth token         |
| `BASIC_AUTH_NAME`                  | false    |                    | Basic Authentication   |
| `BASIC_AUTH_PASS`                  | false    |                    | Basic Authentication   |
| `MONGOLAB_URI`                     | true     |                    | MongoDB connection URI |
| `REDIS_HOST`                       | true     |                    | Redis Cache connection |
| `REDIS_PORT`                       | true     |                    | Redis Cache connection |
| `REDIS_KEY`                        | true     |                    | Redis Cache connection |
| `GMO_ENDPOINT`                     | true     |                    | GMO API endpoint       |
| `GMO_SITE_ID`                      | true     |                    | GMO SiteID             |
| `API_ENDPOINT`                     | true     |                    | APIエンドポイント             |
| `API_AUTHORIZE_SERVER_DOMAIN`      | true     |                    | API認可サーバードメイン          |
| `API_CLIENT_ID`                    | true     |                    | APIクライアントID            |
| `API_CLIENT_SECRET`                | true     |                    | APIクライアントシークレット        |
| `API_CODE_VERIFIER`                | true     |                    | APIコード検証鍵              |
| `USER_EXPIRES_IN_SECONDS`          | true     |                    | ログインユーザーセッション保持期間      |
| `PECORINO_API_ENDPOINT`            | true     |                    |                        |
| `PECORINO_AUTHORIZE_SERVER_DOMAIN` | true     |                    |                        |
| `PECORINO_API_CLIENT_ID`           | true     |                    |                        |
| `PECORINO_API_CLIENT_SECRET`       | true     |                    |                        |
| `COGNITO_USER_POOL_ID`             | true     |                    |                        |
