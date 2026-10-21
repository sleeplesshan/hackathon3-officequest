import type { Config } from 'tailwindcss';

// DESIGN.md §3.7 theme 그대로 + content. 익명 default export 금지.
const config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: { sans: ['Paperlogy', 'system-ui', 'sans-serif'] },
      colors: {
        bg: 'var(--bg)', surface: { DEFAULT: 'var(--surface)', muted: 'var(--surface-muted)' },
        ink: { DEFAULT: 'var(--text)', sub: 'var(--text-sub)', muted: 'var(--text-muted)', faint: 'var(--text-faint)' },
        line: { DEFAULT: 'var(--border)', strong: 'var(--border-strong)', accent: 'var(--border-accent)' },
        accent: { DEFAULT: 'var(--accent)', 2: 'var(--accent-2)', soft: 'var(--accent-soft)' },
        purple: { 50:'#FAF5FF',100:'#EDE9FE',200:'#DDD6FE',300:'#C4B5FD',400:'#A78BFA',500:'#8B5CF6',600:'#7C3AED',700:'#6D28D9',800:'#5B21B6',900:'#4C1D95' },
        neon: { DEFAULT: '#A855F7', soft: '#C084FC', pale: '#E9D5FF' },
        success: { bg: 'var(--success-bg)', fg: 'var(--success-fg)' },
        warning: { bg: 'var(--warning-bg)', fg: 'var(--warning-fg)' },
        danger:  { bg: 'var(--danger-bg)',  fg: 'var(--danger-fg)' },
        info:    { bg: 'var(--info-bg)',    fg: 'var(--info-fg)' },
        revise:  { bg: 'var(--revise-bg)', line: 'var(--revise-border)', fg: 'var(--revise-fg)', strong: 'var(--revise-strong)' },
        tier: { bronze:'#CD7F32', silver:'#94A3B8', gold:'#F5B301', platinum:'#67E8F9', diamond:'#22D3EE', master:'#A855F7' },
        teams: { header:'#464775', brand:'#5B5FC7', logo:'#7B83EB' },
        sharepoint: '#036C70',
      },
      fontSize: {
        display: ['96px', { lineHeight: '1', letterSpacing: '-0.045em', fontWeight: '900' }],
        hero: ['48px', { lineHeight: '1.14', letterSpacing: '-0.045em', fontWeight: '800' }],
        h1: ['36px', { lineHeight: '1.1', letterSpacing: '-0.045em', fontWeight: '800' }],
        h2: ['28px', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '800' }],
        h3: ['20px', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '800' }],
        'num-xl': ['64px', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '900' }],
        'num-l': ['26px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        body: ['16px', { lineHeight: '1.5' }], 'body-s': ['15px', { lineHeight: '1.5' }],
        caption: ['13px', { lineHeight: '1.4' }], micro: ['12px', { lineHeight: '1.3' }],
      },
      borderRadius: { xs:'6px', sm:'10px', md:'14px', lg:'18px', xl:'22px', '2xl':'28px', pill:'999px' },
      boxShadow: {
        card: 'var(--sh-card)', float: 'var(--sh-float)', pop: 'var(--sh-pop)', btn: 'var(--sh-btn)',
        focus: 'var(--sh-focus)', seg: 'var(--sh-seg)', knob: 'var(--sh-knob)', neon: '0 0 0 1px rgba(168,85,247,.5),0 0 60px -10px rgba(168,85,247,.6)',
      },
      zIndex: { gnb:'200', dropdown:'300', chat:'800', backdrop:'1000', modal:'1010', toast:'1100', hyper:'9999' },
      spacing: { 'gnb':'64px', 'sidebar':'264px', '4.5':'18px', '5.5':'22px', '7':'28px' },
      transitionTimingFunction: {
        out:'cubic-bezier(.33,1,.68,1)', expo:'cubic-bezier(.16,1,.3,1)', in:'cubic-bezier(.32,0,.67,0)',
        inout:'cubic-bezier(.65,0,.35,1)', back:'cubic-bezier(.34,1.56,.64,1)', spring:'cubic-bezier(.3,1.9,.5,1)',
      },
      transitionDuration: { fast:'150ms', base:'220ms', slow:'400ms', enter:'550ms', hyper:'1800ms' },
      keyframes: {
        'pop-in': { '0%': { opacity:'0', transform:'scale(.3) translateY(24px)' }, '100%': { opacity:'1', transform:'none' } },
        'rise-in': { '0%': { opacity:'0', transform:'translateY(24px)', filter:'blur(8px)' }, '100%': { opacity:'1', transform:'none', filter:'blur(0)' } },
        'px-bob': { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-4px)' } },
        'typing-dot': { '0%,60%,100%': { transform:'translateY(0)' }, '30%': { transform:'translateY(-5px)' } },
        'rays-spin': { to: { transform:'rotate(30deg)' } },
      },
      animation: {
        'pop-in':'pop-in 500ms cubic-bezier(.3,1.9,.5,1) both', 'rise-in':'rise-in 550ms cubic-bezier(.16,1,.3,1) both',
        'px-bob':'px-bob 1.4s steps(2) infinite', 'typing-dot':'typing-dot 1s ease-in-out infinite', 'rays':'rays-spin 1.8s linear',
      },
    },
  },
} satisfies Config;

export default config;
