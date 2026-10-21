const config = { plugins: { [new URL('./scripts/local-fonts.cjs', import.meta.url).pathname]: {}, tailwindcss: {}, autoprefixer: {} } };
export default config;
