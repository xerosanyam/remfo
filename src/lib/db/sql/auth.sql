CREATE TABLE remfo.auth_user(
    id uuid PRIMARY KEY,
    email text UNIQUE,
    name text,
    picture text,
    given_name text,
    family_name text,
    email_verified boolean,
    locale text
);

CREATE TABLE remfo.user_session(
    id text PRIMARY KEY,
    expires_at timestamptz NOT NULL,
    user_id uuid NOT NULL REFERENCES remfo.auth_user(id)
);

ALTER TABLE remfo.auth_user
    ADD COLUMN picture text;

SELECT
    *
FROM
    pg_tables
WHERE
    tablename = 'remfo.auth_user'
    OR tablename = 'remfo.user_session';

SELECT
    *
FROM
    information_schema.columns
WHERE
    table_name = 'remfo.auth_user';

INSERT INTO remfo.auth_user(id, github_id, username)
    VALUES ("12_id", "12_github_id", "12_username");

ALTER TABLE remfo.auth_user
    ADD COLUMN picture text;

SELECT
    *
FROM
    remfo.auth_user;

DROP TABLE remfo.auth_user;

DROP TABLE remfo.user_session;

