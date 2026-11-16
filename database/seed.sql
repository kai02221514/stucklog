USE stucklog;

INSERT INTO projects (id, name, description) VALUES
  ('aws-training', 'AWS研修', 'AWSを使った技術共有アプリの開発。つまずきと解決策を記録します。'),
  ('frontend-study', 'フロントエンド学習', 'ReactとTypeScriptの学習中に発生した問題をまとめます。'),
  ('personal-dev', '個人開発メモ', '個人開発で試した技術や設定の記録です。')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

INSERT IGNORE INTO project_technologies (project_id, technology, sort_order) VALUES
  ('aws-training', 'AWS', 0),
  ('aws-training', 'Next.js', 1),
  ('aws-training', 'TypeScript', 2),
  ('frontend-study', 'React', 0),
  ('frontend-study', 'TypeScript', 1),
  ('personal-dev', 'Next.js', 0),
  ('personal-dev', 'Tailwind CSS', 1);

INSERT INTO posts (id, project_id, title, content, summary, status, resolution, author) VALUES
  ('rds-connection', 'aws-training', 'EC2からRDSへ接続できない', 'EC2上のアプリからRDS MySQLへ接続するとタイムアウトします。セキュリティグループと接続先を確認しています。', 'EC2上のアプリからRDS MySQLへの接続がタイムアウトします。', 'open', NULL, '北田 大海'),
  ('rds-security-group', 'aws-training', 'RDSの接続元を制限する', 'RDSのセキュリティグループで接続元をEC2のセキュリティグループに限定しました。', 'EC2のセキュリティグループを接続元に指定して解決しました。', 'resolved', 'RDSのインバウンドルールで、MySQLの接続元にEC2のセキュリティグループを指定。', '北田 大海'),
  ('use-effect-loop', 'frontend-study', 'useEffectが繰り返し実行される', 'useEffectの依存配列に毎回生成されるオブジェクトを指定していました。', '依存配列のオブジェクト参照を見直して解決しました。', 'resolved', '依存配列のオブジェクト参照をuseMemoで固定。', '北田 大海')
ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content), summary = VALUES(summary), status = VALUES(status), resolution = VALUES(resolution);

INSERT IGNORE INTO post_technologies (post_id, technology, sort_order) VALUES
  ('rds-connection', 'AWS', 0),
  ('rds-connection', 'RDS', 1),
  ('rds-security-group', 'AWS', 0),
  ('rds-security-group', 'RDS', 1),
  ('use-effect-loop', 'React', 0);
