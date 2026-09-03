# Extractable components

## PrimaryNav

- Source: `src/lib/components/PrimaryNav.svelte`
- Category: layout
- Description: Persistent desktop sidebar and mobile bottom navigation shared by every route.
- Extractable props: `signedIn` (boolean, default false), `activeItem` (string, default `/`)
- Hardcoded: logo, route labels, icons, URLs, layout classes

## Logout

- Source: `src/lib/components/Logout.svelte`
- Category: basic
- Description: Sign-out form action placed inside authenticated navigation.
- Extractable props: none
- Hardcoded: label, icon, action, classes

## GoogleButton

- Source: `src/lib/components/Buttons/Google.svelte`
- Category: basic
- Description: Primary dark Google sign-in action.
- Extractable props: `text` (string, default `Sign In`)
- Hardcoded: icon, form action, classes

## ReviewCard

- Source: `src/lib/components/Cards/Card.svelte`
- Category: basic
- Description: Question, disclosed answer, delete action, and review controls.
- Extractable props: none for shared drafts; content should remain representative fixture data
- Hardcoded: layout, icons, controls, classes
