import tseslint from 'typescript-eslint';
export default [
  { ignores: ['**/dist/**','**/.next/**','**/coverage/**','**/node_modules/**','**/next-env.d.ts','**/*.min.js','.agents/**','.specify/**'] },
  ...tseslint.configs.recommended.map(ruleSet => ({...ruleSet, files:['**/*.{ts,tsx}']})),
  {files:['**/*.{ts,tsx}'],rules:{'@typescript-eslint/no-explicit-any':'error','no-restricted-imports':['error',{patterns:['**/apps/*/src/**','**/packages/*/src/**']}]}}
];
