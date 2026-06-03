-- 既存のテーブルを依存関係の逆順で削除
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS task_categories;
DROP TABLE IF EXISTS users;

-- 1. ユーザーテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. タスク区分テーブル
CREATE TABLE task_categories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- '#RRGGBB' 形式
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. タスクテーブル
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES task_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    importance INTEGER NOT NULL, -- ボロノイ図の面積（重み）用
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);