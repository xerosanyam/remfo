# Supabase

## Supabase-js

## Supabase Landscape

1. Authentication - goTrue server
2. Database - postgres database

## Things to watch out

1. supabase-js

- it has its own ORM dialect. it might be simple, but one more thing to learn.
- combination of libraries

### packages

- @supabase/gotrue-js -> auth-js -> fetch over gotrue end points (originally written by netlify)
- @supabase/realtime-js -> uses ws -> ws over phoenix realtime server (written by supabase)
- @supabase/postgrest-js -> fetch over postgrest end points

2. supabase.com

- the ui is an abstraction. when you click the lock button you don't know what SQL is being run. avoid the UI. learn the logic. version control the logic. reuse the logic. the button placement/functionality may change, heck you may have a project that's not hosted on supabase. learn the fundamental. fundamentals don't change, often.
