SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS stucklog
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE stucklog;

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_technologies (
  project_id VARCHAR(100) NOT NULL,
  technology VARCHAR(50) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, technology),
  CONSTRAINT fk_project_technologies_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(100) PRIMARY KEY,
  project_id VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(300) NOT NULL,
  status ENUM('open', 'resolved') NOT NULL DEFAULT 'open',
  resolution TEXT NULL,
  author VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_posts_project_created (project_id, created_at),
  INDEX idx_posts_status_created (status, created_at),
  CONSTRAINT fk_posts_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_technologies (
  post_id VARCHAR(100) NOT NULL,
  technology VARCHAR(50) NOT NULL,
  sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (post_id, technology),
  CONSTRAINT fk_post_technologies_post
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
