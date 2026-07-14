import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    // Gate every `hover:` utility behind `@media (hover: hover)` so taps on
    // touch devices don't leave a sticky hover state (issue #9).
    future: {
      hoverOnlyWhenSupported: true,
    },
    content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			// Soft enter animations (issue #9). Movement variants are only ever
  			// applied via `motion-safe:`; `fade-in` is the reduced-motion fallback.
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'tab-in': {
  				from: { opacity: '0', transform: 'translateY(4px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'score-in': {
  				from: { opacity: '0', transform: 'scale(0.95)', filter: 'blur(4px)' },
  				to: { opacity: '1', transform: 'scale(1)', filter: 'blur(0)' }
  			},
  			// Podium bars rise from a fraction of their own height (issue #14).
  			// Percentage translate so it scales with each bar; only applied via
  			// `motion-safe:`, with `fade-in` as the reduced-motion fallback.
  			'podium-rise': {
  				from: { opacity: '0', transform: 'translateY(40%)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			// Custom ease-out, well under a quarter second.
  			'fade-in': 'fade-in 150ms cubic-bezier(0.22, 1, 0.36, 1)',
  			'tab-in': 'tab-in 150ms cubic-bezier(0.22, 1, 0.36, 1)',
  			'score-in': 'score-in 150ms cubic-bezier(0.22, 1, 0.36, 1)',
  			// `both` fill-mode so a staggered bar holds at its start offset
  			// during its delay instead of flashing at the final position.
  			'podium-rise':
  				'podium-rise 250ms cubic-bezier(0.22, 1, 0.36, 1) both'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
