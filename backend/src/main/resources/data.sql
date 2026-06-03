-- 1. テストユーザーの挿入
-- ※実際はSpring Security(BCrypt)でハッシュ化したパスワードを保存しますが、ここでは仮の文字列にしています
INSERT INTO users (id, name, email, password_hash) VALUES 
(1, '山田 太郎', 'yamada@example.com', '$2a$10$wKkW3gI7D8GfK9kX...'),
(2, '佐藤 花子', 'sato@example.com', '$2a$10$wKkW3gI7D8GfK9kX...');

-- SERIALのインデックスを同期させる（手動でidを指定してINSERTしたため）
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. タスク区分の挿入 (山田太郎用: user_id = 1)
INSERT INTO task_categories (id, user_id, name, color) VALUES 
(1, 1, '仕事', '#FF5733'),       -- 鮮やかな赤・オレンジ系
(2, 1, 'プライベート', '#33FF57'), -- 緑系
(3, 1, 'スキル学習', '#3357FF');   -- 青系

SELECT setval('task_categories_id_seq', (SELECT MAX(id) FROM task_categories));

-- 3. タスクの挿入 (山田太郎用: user_id = 1)
-- ボロノイ図の面積（importance）のバランスを見て配置
INSERT INTO tasks (user_id, category_id, name, importance, is_completed) VALUES 
(1, 1, '顧客向け提案書の作成', 8, FALSE), -- 面積：大
(1, 1, 'チームミーティング', 3, FALSE),   -- 面積：小
(1, 2, '今週末の買い出し', 2, FALSE),     -- 面積：小
(1, 3, 'React × D3.js の素振り', 7, FALSE), -- 面積：中〜大
(1, 3, 'Spring Bootの書籍を読む', 5, FALSE); -- 面積：中

-- 完了済みのタスク（初期状態の確認用）
INSERT INTO tasks (user_id, category_id, name, importance, is_completed) VALUES 
(1, 1, '日報の提出', 1, TRUE);