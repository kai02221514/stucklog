export type Post = {
  id: string;
  title: string;
  tags: string[];
  summary: string;
  content: string;
  createdLabel: string;
  createdAt: string;
};

// DEMO: 実際のDynamoDBなどから取得する代わりに使う初期表示用データです。
// AWS接続後は、この配列をAPIのレスポンスへ置き換えます。
export const demoPosts: Post[] = [
  {
    id: "dynamodb-access-denied",
    title: "DynamoDBへの書き込みが失敗する",
    tags: ["AWS", "DynamoDB"],
    summary:
      "PutItemでAccessDeniedが発生。IAMポリシーの対象リソースを見直したときの記録です。",
    content:
      "PutItemを実行したところ、AccessDeniedExceptionが発生しました。テーブル名やリージョンに誤りがないことを確認しても解消しませんでした。\n\nIAMポリシーを確認すると、対象リソースが別のテーブルARNになっていました。対象を修正して再デプロイしたところ、正常に書き込めるようになりました。",
    createdLabel: "15分前",
    createdAt: "2026-11-15T09:45:00+09:00",
  },
  {
    id: "use-effect-loop",
    title: "useEffectが繰り返し実行される",
    tags: ["React"],
    summary:
      "依存配列に毎回生成されるオブジェクトを入れていたため、再レンダリングのたびに実行されていました。",
    content:
      "useEffectの依存配列に、レンダリングのたびに新しく生成されるオブジェクトを指定していました。useMemoで参照を固定し、必要な値だけを依存配列へ指定することで解消しました。",
    createdLabel: "昨日",
    createdAt: "2026-11-14T15:20:00+09:00",
  },
  {
    id: "cognito-token",
    title: "ログイン後にトークンを取得できない",
    tags: ["AWS", "Cognito"],
    summary:
      "コールバックURLとアプリクライアント設定を確認したときの手順をまとめました。",
    content:
      "Cognitoでログインは完了するものの、アプリへ戻った後にトークンを取得できませんでした。コールバックURLとアプリクライアントのOAuth設定を揃えることで解消しました。",
    createdLabel: "2日前",
    createdAt: "2026-11-13T11:10:00+09:00",
  },
  {
    id: "typescript-api-response",
    title: "APIレスポンスの型でエラーになる",
    tags: ["TypeScript"],
    summary:
      "optionalな値を必須として扱っていたため、型ガードを追加して解消しました。",
    content:
      "APIレスポンスに含まれない可能性がある値を、必須項目として扱っていました。レスポンス型を修正し、利用前に型ガードを追加しました。",
    createdLabel: "3日前",
    createdAt: "2026-11-12T13:40:00+09:00",
  },
];
