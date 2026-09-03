# Remfo design system

## Product

Remfo is a calm, low-friction spaced-repetition flashcard app. Its main jobs are recording atomic things worth remembering, revising due cards, measuring activity, and optionally generating cards with AI. It must remain usable in old Kindle browsers, narrow mobile browsers, and without JavaScript for core flows.

## Visual direction

- Preserve the restrained black, white, and cool-gray identity.
- Use the system sans-serif stack. Do not introduce decorative fonts.
- Prefer whitespace, thin pale borders, and plain typography over cards, gradients, shadows, or ornamental color.
- Primary actions use near-black backgrounds with white text. Secondary actions look like nearby navigation links, not standalone promotional buttons.
- Keep copy lowercase where the existing product does.
- Use the real circular black Remfo logo in the desktop sidebar.

## Layout

- Desktop uses a fixed `11rem` left sidebar and centers page content in the remaining viewport, usually within `max-w-lg`.
- Mobile uses fixed bottom navigation. Page content must reserve enough normal-flow space so navigation never overlaps buttons, links, or text, including safe-area inset.
- The home page should feel spacious on both mobile and desktop, with a centered content column and visibly separated product capabilities.
- Activity calendars should be centered on desktop with no visible scrollbar when they fit. Narrow screens may scroll only when the calendar cannot fit.
- Navigation labels must stay on one line on desktop. Mobile labels may use smaller type but should remain legible.
- Authenticated desktop sign-out belongs at the bottom-left of the sidebar and should share the same icon, type, padding, and hover treatment as adjacent navigation links.

## Tokens

- Background: `hsl(0 0% 100%)`
- Foreground: `hsl(222.2 84% 4.9%)`
- Primary: `hsl(222.2 47.4% 11.2%)`
- Muted: `hsl(210 40% 96.1%)`
- Muted foreground: `hsl(215.4 16.3% 46.9%)`
- Border: `hsl(214.3 31.8% 91.4%)`
- Radius: `0.5rem`, with many product surfaces using `0.25rem`
- Spacing and breakpoints: Tailwind defaults

## Interaction and accessibility

- Keep keyboard-visible focus rings.
- Keep touch targets at least 44px tall where practical.
- Avoid hover-only controls on mobile and Kindle.
- Core content and actions must remain available without JavaScript.
- Do not remove safe-area handling from fixed mobile navigation.

## Current redesign scope

- Restore generous spacing and centered alignment on the home page.
- Prevent mobile navigation/footer from covering home-page sign-in controls.
- Keep `share feedback` and `generate with ai` on one line in the desktop sidebar.
- Preserve visible record dates and the complete mobile activity calendar.
- Center desktop calendars and suppress scrollbars when content fits.
- Restyle and anchor sign-out to the desktop sidebar bottom while keeping it consistent with adjacent links.
