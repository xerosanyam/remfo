-- Active: 1710228112139@@aws-0-ap-south-1.pooler.supabase.com@5432@postgres@remfo
CREATE TABLE auth_user(
    id text PRIMARY KEY
);

CREATE TABLE user_session(
    id text PRIMARY KEY,
    expires_at timestamptz NOT NULL,
    user_id text NOT NULL REFERENCES auth_user(id)
);

ALTER TABLE auth_user
    ADD COLUMN github_id text UNIQUE,
    ADD COLUMN username text;

SELECT
    *
FROM
    pg_tables
WHERE
    tablename = 'auth_user'
    OR tablename = 'user_session';

SELECT
    *
FROM
    information_schema.columns
WHERE
    table_name = 'auth_user';

INSERT INTO auth_user(id, github_id, username)
    VALUES ("12_id", "12_github_id", "12_username");

