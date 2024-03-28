CREATE SCHEMA "remfo";

CREATE TABLE "remfo"."cards"(
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
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

CREATE INDEX ON "remfo"."cards"("next_practice");

ALTER TABLE "remfo"."cards"
  ADD FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

DROP TABLE remfo.cards;

