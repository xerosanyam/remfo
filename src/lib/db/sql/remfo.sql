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

