# Supabase-js

- it has its own ORM dialect. it might be simple, but one more thing to learn

## Supabase Landscape

1. Authentication - goTrue server
2. Database - postgres database

## packages

- @supabase/supabase-js
  combination of multiple packages
- - @supabase/gotrue-js -> auth-js -> fetch over gotrue end points (originally written by netlify)
- - @supabase/realtime-js -> uses ws -> ws over phoenix realtime server (written by supabase)
- - @supabase/postgrest-js -> fetch over postgrest end points
