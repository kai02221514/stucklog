USE stucklog;

ALTER TABLE posts
  MODIFY COLUMN status ENUM(
    'open',
    'resolved',
    'on_hold',
    'not_cost_effective',
    'external_dependency'
  ) NOT NULL DEFAULT 'open';
