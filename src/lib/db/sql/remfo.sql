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

BEGIN;
SET LOCAL ROLE authenticated;
SELECT
  set_config('request.jwt.claim.sub', '', TRUE);
SELECT
  *
FROM
  remfo.card;
COMMIT;

-- # A. RLS
-- 1. check if RLS is enabled
SELECT
  relname,
  relrowsecurity
FROM
  pg_class
WHERE
  relname = 'card';

ALTER TABLE remfo.card ENABLE ROW LEVEL SECURITY;

ALTER TABLE remfo.card DISABLE ROW LEVEL SECURITY;

-- test; without RLS, follwing transaction will return values
BEGIN;
SET LOCAL ROLE authenticated;
SELECT
  *
FROM
  remfo.card;
COMMIT;

-- # B. Give schema permission
-- check
SELECT
  rolname,
  has_schema_privilege(rolname, 'remfo', 'usage')
FROM
  pg_roles
WHERE
  rolname = 'authenticated';

GRANT USAGE ON SCHEMA remfo TO authenticated;

REVOKE USAGE ON SCHEMA remfo FROM authenticated;

-- test; without grant, follwing transaction will return "permission denied for schema remfo"
BEGIN;
SET LOCAL ROLE authenticated;
SELECT
  *
FROM
  remfo.card;
COMMIT;

-- # C: Give Table permission
SELECT
  *
FROM
  information_schema.table_privileges
WHERE
  table_schema = 'remfo'
  AND table_name = 'card'
  AND grantee = 'authenticated';

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "remfo"."card" TO authenticated;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "remfo"."card" FROM authenticated;

-- test; without grant, follwing transaction will return ""permission denied for table card"
BEGIN;
SET LOCAL ROLE authenticated;
SELECT
  *
FROM
  remfo.card;
COMMIT;

-- # D: Apply policy
SELECT
  *
FROM
  pg_policies
WHERE
  schemaname = 'remfo';

CREATE POLICY "Enable crud for users based on user_id" ON "remfo"."card" AS PERMISSIVE
  FOR ALL TO authenticated
    USING ((
      SELECT
        auth.uid()) = user_id)
      WITH CHECK ((
        SELECT
          auth.uid()) = user_id);

DROP POLICY "Enable crud for users based on user_id" ON "remfo"."card";

-- test; to see all rows
CREATE POLICY "Enable everything" ON "remfo"."card" AS PERMISSIVE
  FOR ALL TO authenticated
    USING (TRUE);

DROP POLICY "Enable everything" ON "remfo"."card";

-- # E: other queries
-- see definition of procedure (auth.uid())
SELECT
  proname,
  prosrc
FROM
  pg_catalog.pg_proc
WHERE
  proname = 'uid';

-- Check the permissions granted to the role
SELECT
  grantee,
  table_name,
  privilege_type
FROM
  information_schema.role_table_grants
WHERE
  grantee = 'authenticated'
  AND table_name = 'card';

-- Check role memberships
SELECT
  r.rolname AS role_name,
  m.roleid AS member_of_role_id,
  m.member AS member_role_name
FROM
  pg_catalog.pg_roles r
  JOIN pg_catalog.pg_auth_members m ON (r.oid = m.roleid)
WHERE
  r.rolname = 'authenticated';

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA remfo TO authenticatedas;

SELECT
  *
FROM
  pg_catalog.pg_policy;

SELECT
  *
FROM
  pg_policy;

SELECT
  rolname,
  rolsuper,
  rolinherit,
  rolcreaterole,
  rolcanlogin,
  rolbypassrls,
  rolconfig
FROM
  pg_roles
WHERE
  rolname = 'anon';

