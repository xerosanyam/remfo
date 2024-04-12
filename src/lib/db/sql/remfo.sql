CREATE SCHEMA "remfo";

CREATE TABLE "remfo"."auth_user"(
  "id" uuid PRIMARY KEY
);

CREATE TABLE "remfo"."card"(
  "id" uuid PRIMARY KEY,
  "front" text NOT NULL CHECK (front <> ''),
  "back" text NOT NULL CHECK (back <> ''),
  "user_id" uuid NOT NULL,
  "easiness" real NOT NULL DEFAULT 2.5,
  "interval" smallint NOT NULL DEFAULT 0,
  "repetitions" smallint NOT NULL DEFAULT 0,
  "next_practice" timestamptz NOT NULL DEFAULT (now()),
  "created_at" timestamptz NOT NULL DEFAULT (now()),
  "updated_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE INDEX ON "remfo"."card"("next_practice");

ALTER TABLE "remfo"."card"
  ADD FOREIGN KEY ("user_id") REFERENCES "remfo"."auth_user"("id");

DROP TABLE remfo.card;

SELECT
  *
FROM
  remfo.card;

-- Policies FOR RLS
SELECT
  *
FROM
  remfo.card;

ALTER TABLE remfo.card ENABLE ROW LEVEL SECURITY;

BEGIN;
-- Set the role to "authenticated"
SET LOCAL ROLE authenticated;
-- Query the "cards" table
SELECT
  *
FROM
  remfo.card;
COMMIT;

CREATE POLICY "Enable insert for users based on user_id" ON "remfo"."card" AS PERMISSIVE
  FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY "Enable insert for users based on user_id" ON "remfo"."card";

-- 1. solves "permission denied for schema remfo"
GRANT USAGE ON SCHEMA remfo TO authenticated;

REVOKE USAGE ON SCHEMA remfo FROM authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "remfo"."card" TO authenticated;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "remfo"."card" FROM authenticated;

SELECT
  *
FROM
  pg_policies;

-- check grants
SELECT
  *
FROM
  information_schema.role_table_grants
WHERE
  grantee = 'authenticated';

