-- Seed data for the uigen database.
-- Apply with: psql -d uigen -f seed.sql
-- Idempotent for users (ON CONFLICT). Tasks are cleared first to avoid duplicates on re-run.

BEGIN;

INSERT INTO users (email, name) VALUES
  ('alice@example.com', 'Alice Johnson'),
  ('bob@example.com',   'Bob Smith'),
  ('carol@example.com', 'Carol Nguyen')
ON CONFLICT (email) DO NOTHING;

-- Reset tasks so re-running the seed doesn't accumulate duplicates.
TRUNCATE tasks RESTART IDENTITY;

INSERT INTO tasks (user_id, title, completed)
SELECT u.id, t.title, t.completed
FROM (VALUES
  ('alice@example.com', 'Write project proposal',      false),
  ('alice@example.com', 'Review pull requests',         true),
  ('alice@example.com', 'Set up CI pipeline',           false),
  ('bob@example.com',   'Fix login bug',                true),
  ('bob@example.com',   'Update dependencies',          false),
  ('carol@example.com', 'Design landing page',          false),
  ('carol@example.com', 'Prepare release notes',        true)
) AS t(email, title, completed)
JOIN users u ON u.email = t.email;

COMMIT;
