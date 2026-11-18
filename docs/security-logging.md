# セキュリティアクセスログ調査

## 目的

StuckLogのAPIアクセスについて、HTTPメソッド、パス、ステータス、処理時間、User-Agentを構造化ログとして記録します。User-Agentによるクライアント分類が不審なアクセスを調べる手掛かりになるかを確認し、同時に偽装可能であるという限界も評価します。

User-Agentだけを根拠にアクセスを許可または拒否することはありません。

## ログ形式

APIへのリクエストごとに、1行のJSONを標準出力へ記録します。

```json
{"event":"api_access","timestamp":"2026-11-17T03:34:56.000Z","requestId":"6e510296-1f59-4741-836f-f6b58ccf3603","method":"GET","path":"/api/projects","status":200,"durationMs":12,"clientCategory":"browser","userAgent":"Mozilla/5.0 ..."}
```

| 項目 | 内容 |
| --- | --- |
| `event` | アクセスログは`api_access`、エラーログは`api_error` |
| `timestamp` | リクエスト受付時刻（UTC、ISO 8601） |
| `requestId` | リクエストごとにサーバーで生成するUUID |
| `method` | HTTPメソッド |
| `path` | クエリ文字列を除外したURLパス |
| `status` | HTTPレスポンスステータス |
| `durationMs` | API処理時間（ミリ秒） |
| `clientCategory` | User-Agentから簡易分類したクライアント種別 |
| `userAgent` | 制御文字を除き、512文字までに制限したUser-Agent |

レスポンスには`X-Request-Id`ヘッダーを設定します。問い合わせやエラー調査では、この値を使ってアクセスログとエラーログを関連付けます。

## クライアント分類

分類は調査をしやすくするための簡易的な文字列判定であり、検知結果ではありません。

| 分類 | 判定対象の例 |
| --- | --- |
| `browser` | Mozilla、Chrome、Safari、Firefox、Edge |
| `command_line` | curl、wget、HTTPie |
| `api_tool` | Postman、Insomnia |
| `bot` | bot、crawler、spider、slurp、headless |
| `unknown` | User-Agentなし、または分類不能 |

Botが一般的なブラウザのUser-Agentを設定した場合は`browser`に分類されます。このため、アクセス頻度、認証結果、ステータスなど、別の情報と組み合わせて判断する必要があります。

## プライバシーと安全性

次の情報はアクセスログに記録しません。

- リクエスト本文、投稿内容、プロジェクト名
- Cookie、Authorizationヘッダー
- IPアドレス
- クエリ文字列
- DB接続情報とパスワード

User-Agentも利用環境を推測できる情報であるため、調査に必要な期間だけ保存します。今回の調査では最大30日を目安とし、発表と検証が終わったログは削除します。ログを閲覧できる人も、EC2の運用担当者に限定します。

## 検証手順

ローカル環境でアプリを起動してから、別のターミナルで以下を実行します。

### コマンドラインツール

```bash
curl -i http://localhost:3000/api/projects
```

期待値は、ステータス200、`X-Request-Id`レスポンスヘッダー、`command_line`ログです。

### User-Agentなし

```bash
curl -i -H 'User-Agent:' http://localhost:3000/api/projects
```

期待値は`unknown`です。

### Botを名乗るアクセス

```bash
curl -i -A 'ExampleBot/1.0' http://localhost:3000/api/projects
```

期待値は`bot`です。

### ブラウザに偽装したアクセス

```bash
curl -i -A 'Mozilla/5.0 Chrome/142.0 Safari/537.36' http://localhost:3000/api/projects
```

curlから実行しても`browser`になります。これにより、User-Agent単独ではアクセス元を証明できないことを確認します。

### 入力エラー

```bash
curl -i -X POST \
  -H 'Content-Type: application/json' \
  -d '{}' \
  http://localhost:3000/api/projects
```

期待値はステータス400です。送信した本文はログに含まれません。

## EC2での確認

systemdで稼働している環境では、次のコマンドでログを確認できます。

```bash
sudo journalctl -u stucklog -o cat -f
```

直近のアクセスログだけを抽出する例です。

```bash
sudo journalctl -u stucklog -o cat --since '30 minutes ago' | grep '"event":"api_access"'
```

## 調査の評価観点

1. ブラウザ、コマンドライン、APIツール、Botの違いを観測できるか
2. User-Agentなしや自動化ツールが調査の手掛かりになるか
3. User-Agentを偽装すると分類結果も変わるか
4. 400、404、500などのエラー増加をログから確認できるか
5. ログに本文や認証情報が含まれていないか

## API入力のセキュリティ強化

APIでJSONを読み込む前に、`Content-Type`と受信バイト数を検証します。JSONリクエスト全体の上限は64KiBです。

| 条件 | HTTPステータス |
| --- | --- |
| JSONの構文が壊れている | 400 Bad Request |
| 必須項目、文字数、タグ件数が不正 | 400 Bad Request |
| JSONリクエストが64KiBを超える | 413 Payload Too Large |
| `Content-Type`が`application/json`ではない | 415 Unsupported Media Type |

入力値には次の上限を設けます。ブラウザ画面にも同じ上限を設定しますが、直接APIを呼び出した場合に備えてサーバー側で必ず再検証します。

| 項目 | 上限 |
| --- | --- |
| プロジェクト名 | 100文字 |
| プロジェクト説明 | 500文字 |
| 投稿タイトル | 200文字 |
| 投稿本文 | 10,000文字 |
| 判断・対応メモ | 5,000文字 |
| 技術タグ | 1件50文字、最大8件 |
| プロジェクト・投稿ID | 100文字 |

壊れたJSONが500ではなく400になることは、次のコマンドで確認できます。

```bash
curl -i -X POST \
  -H 'Content-Type: application/json' \
  -d '{' \
  http://localhost:3000/api/projects
```

同じ技術タグの大文字・小文字違いも重複として400で拒否します。

```bash
curl -i -X POST \
  -H 'Content-Type: application/json' \
  -d '{"name":"test","description":"test","technologies":["AWS","aws"]}' \
  http://localhost:3000/api/projects
```

## セキュリティヘッダー

全レスポンスに次のヘッダーを設定します。

- `Content-Security-Policy`: 埋め込み、フォーム送信先、`object`要素などを制限
- `Permissions-Policy`: カメラ、マイク、位置情報を無効化
- `Referrer-Policy`: 外部サイトへ送る参照元情報を制限
- `X-Content-Type-Options`: MIMEタイプ推測を無効化
- `X-Frame-Options`: iframeへの埋め込みを拒否

確認方法:

```bash
curl -I http://localhost:3000
```

現在のEC2構成はHTTPで直接公開しているため、HTTPS通信を強制する`Strict-Transport-Security`は設定しません。HTTPS化したあとに追加を検討します。

## 今後の強化候補

- HTTPS化
- 認証と書き込み権限の導入
- レート制限
- CloudWatch Logsへの集約と保存期間設定
- 認証失敗数やアクセス頻度を含めた異常検知
- AWS WAFによる防御
