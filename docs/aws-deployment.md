# AWS構築手順（EC2 + RDS MySQL）

この手順は、教材のDay 2「EC2・VPC」とDay 3「RDS・Node.js CRUD」に合わせたStuckLog向けの構築手順です。

## 完成構成

```text
ブラウザ
  │ HTTP :3000
  ▼
EC2（Next.js / Node.js）
  │ MySQL :3306
  ▼
RDS MySQL
```

- EC2とRDSは同じVPCに配置します。
- RDSは外部公開せず、EC2からの接続だけを許可します。
- Next.jsのRoute HandlerがCRUD APIを提供します。
- 画面とAPIは同じNext.jsプロセスから配信します。

## 教材との対応

| StuckLogの作業 | 教材の箇所 |
| --- | --- |
| VPC・サブネット・EC2の作成 | Day 2「EC2・VPCハンズオン」Phase 1・Phase 2 |
| EC2用セキュリティグループ | Day 2「Step 1: セキュリティグループ作成」 |
| RDS MySQLの作成 | Day 3「Phase 2: RDSデータベースの作成」 |
| EC2からRDSへの接続制御 | Day 3「セキュリティグループの設定」 |
| Node.jsアプリの配置 | Day 3「Phase 3: Webアプリケーションの構築」 |
| CRUDの動作確認 | Day 3「Phase 4: 動作確認」 |

参照先:

- [Day 2 EC2・VPCハンズオン](https://haw.github.io/aws-education-hands-on/day2/ec2-vpc-lab/)
- [Day 3 データベースハンズオン](https://haw.github.io/aws-education-hands-on/day3/db-lab/)

## 1. ネットワークとセキュリティグループ

教材と同じVPC構成を使用できます。短期間のデモでは、EC2をパブリックサブネット、RDSをプライベートサブネットに配置します。

### EC2用セキュリティグループ

| 種類 | ポート | 接続元 |
| --- | --- | --- |
| カスタムTCP | 3000 | デモを見る端末のIPアドレス |

SSHを開放せず、教材と同様にSession Managerを使う方法を推奨します。

### RDS用セキュリティグループ

| 種類 | ポート | 接続元 |
| --- | --- | --- |
| MySQL/Aurora | 3306 | EC2用セキュリティグループ |

接続元に `0.0.0.0/0` を指定しないでください。RDSの「パブリックアクセス」は「なし」にします。

## 2. RDS MySQLの作成

Day 3のPhase 2に従って、RDS MySQLを作成します。

- エンジン: MySQL
- DBインスタンス識別子: `stucklog-db`
- 初期データベース名: `stucklog`
- VPC: EC2と同じVPC
- パブリックアクセス: なし
- セキュリティグループ: RDS用

作成後にRDSのエンドポイントを控えます。パスワードはGitへ登録しません。

## 3. EC2の準備

Day 2とDay 3に従ってAmazon LinuxのEC2を起動し、Session Managerで接続します。Node.jsはNext.js 16の要件を満たすバージョンを使用します。

```bash
sudo dnf update -y
sudo dnf install -y git mariadb105
node --version
npm --version
```

Node.jsが未導入、または要件を満たさない場合は、Node.js 20.19以降を導入してから進めます。

## 4. アプリの配置

```bash
cd /home/ec2-user
git clone <リポジトリURL> stucklog
cd stucklog
git switch demo/project-mvp
npm ci
```

`.env.example` を基に、EC2だけに本番環境変数を作成します。

```bash
cp .env.example .env.production
chmod 600 .env.production
```

設定値:

```dotenv
DB_HOST=<RDSエンドポイント>
DB_PORT=3306
DB_NAME=stucklog
DB_USER=<RDSのユーザー名>
DB_PASSWORD=<RDSのパスワード>
```

## 5. テーブルと初期データの作成

EC2からRDSへ接続してSQLファイルを実行します。

```bash
mysql -h <RDSエンドポイント> -u <RDSのユーザー名> -p < database/schema.sql
mysql -h <RDSエンドポイント> -u <RDSのユーザー名> -p stucklog < database/seed.sql
```

接続がタイムアウトする場合は、まず次を確認します。

1. EC2とRDSが同じVPCにあるか
2. RDS用セキュリティグループの3306番の接続元がEC2用セキュリティグループか
3. `DB_HOST` がRDSのエンドポイントと一致しているか

## 6. ビルドと起動

```bash
npm run lint
npm run build
npm start
```

ブラウザで `http://<EC2のパブリックIP>:3000` を開き、以下を確認します。

1. プロジェクト一覧が表示される
2. プロジェクトを作成できる
3. 投稿を作成・編集できる
4. 投稿を解決済みに変更できる
5. 再読み込み後も登録内容が残る
6. 解決済みナレッジから検索できる

## 7. EC2再起動後も自動起動する設定

動作確認後、同梱のsystemd設定を使用します。

```bash
sudo cp deploy/stucklog.service /etc/systemd/system/stucklog.service
sudo systemctl daemon-reload
sudo systemctl enable --now stucklog
sudo systemctl status stucklog
```

ログは次のコマンドで確認できます。

```bash
sudo journalctl -u stucklog -f
```

## 8. 終了後の片付け

課金を避けるため、発表後に不要となったリソースを削除します。

1. RDSを削除する（不要なら最終スナップショットも作成しない）
2. EC2を終了する
3. 不要なセキュリティグループを削除する
4. 独自作成したVPC、サブネット、ルートテーブルを削除する

削除前に、発表で必要な画面キャプチャやデータが残っているか確認してください。
