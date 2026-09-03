# Theme

## Compact token summary

- Style: restrained black, white, and cool gray utility UI.
- Font: Tailwind system sans stack.
- Background: white (`0 0% 100%`); foreground: near-black navy (`222.2 84% 4.9%`).
- Primary: charcoal navy (`222.2 47.4% 11.2%`) with near-white text.
- Muted/accent: cool gray (`210 40% 96.1%`) with gray foreground (`215.4 16.3% 46.9%`).
- Border/input: pale cool gray (`214.3 31.8% 91.4%`).
- Destructive: red (`0 72.2% 50.6%`).
- Radius: `0.5rem`; derived medium `0.375rem`; small `0.25rem`.
- Spacing: Tailwind default scale. Primary content is generally `max-w-lg` with `px-4` on mobile.
- Breakpoints: Tailwind defaults (`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px).
- Motion: color transitions only; no decorative animation.

## `tailwind.config.ts`

```ts
import { fontFamily } from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: ['class'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	theme: {
		container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
		extend: {
			colors: {
				border: 'hsl(var(--border) / <alpha-value>)',
				input: 'hsl(var(--input) / <alpha-value>)',
				ring: 'hsl(var(--ring) / <alpha-value>)',
				background: 'hsl(var(--background) / <alpha-value>)',
				foreground: 'hsl(var(--foreground) / <alpha-value>)',
				primary: { DEFAULT: 'hsl(var(--primary) / <alpha-value>)', foreground: 'hsl(var(--primary-foreground) / <alpha-value>)' },
				secondary: { DEFAULT: 'hsl(var(--secondary) / <alpha-value>)', foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)' },
				destructive: { DEFAULT: 'hsl(var(--destructive) / <alpha-value>)', foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)' },
				muted: { DEFAULT: 'hsl(var(--muted) / <alpha-value>)', foreground: 'hsl(var(--muted-foreground) / <alpha-value>)' },
				accent: { DEFAULT: 'hsl(var(--accent) / <alpha-value>)', foreground: 'hsl(var(--accent-foreground) / <alpha-value>)' },
				popover: { DEFAULT: 'hsl(var(--popover) / <alpha-value>)', foreground: 'hsl(var(--popover-foreground) / <alpha-value>)' },
				card: { DEFAULT: 'hsl(var(--card) / <alpha-value>)', foreground: 'hsl(var(--card-foreground) / <alpha-value>)' }
			},
			borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
			fontFamily: { sans: [...fontFamily.sans] }
		}
	}
};

export default config;
```

## `src/app.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
	:root {
		--background: 0 0% 100%;
		--foreground: 222.2 84% 4.9%;
		--muted: 210 40% 96.1%;
		--muted-foreground: 215.4 16.3% 46.9%;
		--popover: 0 0% 100%;
		--popover-foreground: 222.2 84% 4.9%;
		--card: 0 0% 100%;
		--card-foreground: 222.2 84% 4.9%;
		--border: 214.3 31.8% 91.4%;
		--input: 214.3 31.8% 91.4%;
		--primary: 222.2 47.4% 11.2%;
		--primary-foreground: 210 40% 98%;
		--secondary: 210 40% 96.1%;
		--secondary-foreground: 222.2 47.4% 11.2%;
		--accent: 210 40% 96.1%;
		--accent-foreground: 222.2 47.4% 11.2%;
		--destructive: 0 72.2% 50.6%;
		--destructive-foreground: 210 40% 98%;
		--ring: 222.2 84% 4.9%;
		--radius: 0.5rem;
	}

	.dark {
		--background: 222.2 84% 4.9%;
		--foreground: 210 40% 98%;
		--muted: 217.2 32.6% 17.5%;
		--muted-foreground: 215 20.2% 65.1%;
		--popover: 222.2 84% 4.9%;
		--popover-foreground: 210 40% 98%;
		--card: 222.2 84% 4.9%;
		--card-foreground: 210 40% 98%;
		--border: 217.2 32.6% 17.5%;
		--input: 217.2 32.6% 17.5%;
		--primary: 210 40% 98%;
		--primary-foreground: 222.2 47.4% 11.2%;
		--secondary: 217.2 32.6% 17.5%;
		--secondary-foreground: 210 40% 98%;
		--accent: 217.2 32.6% 17.5%;
		--accent-foreground: 210 40% 98%;
		--destructive: 0 62.8% 30.6%;
		--destructive-foreground: 210 40% 98%;
		--ring: hsl(212.7, 26.8%, 83.9);
	}
}

@layer base {
	* { @apply border-border; }
	body { @apply bg-background text-foreground; }
}
```
