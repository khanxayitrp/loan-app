# Copilot Instructions for my-loan-app

Welcome! This document is for any AI coding agent (Copilot, Claude, etc.) that will work with the **my-loan-app** Vue 3 project. It gives the minimal context, conventions and touch points needed to be immediately useful.

## 🏗️ Architecture Overview

- **Vue 3 + Vite**: A single‑page front‑end built with Vue 3, `<script setup>` syntax and the Composition API. TypeScript is used throughout.
- **Pinia Stores** (`src/stores/*`): state & API logic lives here. Stores are named `useXStore` (e.g. `useAuthStore`, `useLoanApplicationStore`). They export reactive state and methods that often wrap API calls.
- **API client** (`src/api/apiclient.ts`): a centralized Axios instance with request/response interceptors. All network requests go through this client. The auth interceptor handles `401` and calls `authStore.signOut()`; there is a guard to ignore the logout endpoint and prevent recursive loops.
- **Routing** (`src/router/index.ts`): global `beforeEach` guard checks auth and permissions on every navigation.
- **Components**: feature folders under `src/components` and `src/views` (e.g. `loans`, `products`, `users`, `shops`). Each view is a `.vue` file with `<script setup lang="ts">`.
- **Types** (`src/types/*.ts`): TS interfaces mirror API responses (e.g. `loanContract.ts`, `customer.ts`). They can contain either primitive strings or nested objects—components often include defensive parsing logic (see `parseAddress` helpers).

## 🔄 Data Flow Patterns

1. **Component → Store → API → Component**: Components import and call store methods. Stores use `apiClient.get/post` and update their own state.
2. **Loan calculations**: forms such as `CreateDraftLoan.vue`, `RequestForm.vue`, `LoanContractForm.vue` compute monthly payment / interest using a **flat‑rate** formula. The helper `calculateLoanDetails` is defined per component; many share identical logic. Updates should stay consistent across components.
3. **Address handling**: the back end may return `customer.address` as either a comma‑separated `string` or an object. Components use `parseAddress()` (see `LoanContractForm.vue` or `RequestForm.vue`) to normalize.
4. **Guarantor / work info**: data structures differ between APIs (`loan_guarantors` array vs `guarantor` object, `customer_work_infos` vs `contract.work`); the loading helpers merge them accordingly.

## 🧩 Project Conventions

- **Naming**: PascalCase for components and stores. Files end with `.vue` for components, `.ts` for logic.
- **Folder structure**: grouped by feature; e.g. `components/loans/form/`, `views/loans/`, `stores/loanApplication.ts`.
- **Tests**: unit tests live alongside production code under `src/__tests__/*`. Use Vitest with `npm run test:unit`.
- **Utilities**: reusable logic in `src/utils/*` (e.g. `formatters.ts`, `generateLoanPDF.ts`, `url.ts`).
- **CSS**: global styles in `src/assets/main.css`; scoped styles inside `.vue` components preferred.

## 🛠️ Developer Workflows

- **Install dependencies**: `npm install`.
- **Run dev server**: `npm run dev` (Vite, hot reload).
- **Build for production**: `npm run build`.
- **Type checking**: `vue-tsc --noEmit` is invoked via `npm run type-check` (part of lint or build scripts).
- **Unit tests**: `npm run test:unit` (Vitest). The test config is `vitest.config.ts` and tsconfig for tests is `tsconfig.vitest.json`.
- **Lint**: `npm run lint` (ESLint with config at the repo root). Eslint config is exported from `eslint.config.ts`.

> ℹ️ The README covers most of these commands; copy them when writing more instructions.

## 🔌 Integration Points

- **API base URL** is configured via environment variables in `vite.config.ts`. All endpoints prefix with `/api` or `/pdf`.
- **Authentication** uses cookies; the store exposes `authStore.token` and `authStore.role`. Logging out triggers `apiClient` interceptors.
- **PDF generation**: components call `apiClient.post('/pdf/generate-loan-contract', data)` to request server‑side PDF creation.
- **Third‑party Vue plugins** live under `src/plugins` and are registered in `main.ts`.

## 🚧 Common Pitfalls for AI Agents

- **Interceptors**: don’t replicate the recursive logout bug; check `apiClient` and `stores/auth.ts` for existing guards.
- **Loan logic consistency**: when adding or modifying loan formulas, update all three places (`CreateDraftLoan.vue`, `RequestForm.vue`, `LoanContractForm.vue`) and adjust tests accordingly.
- **Type mismatches**: API sometimes returns stringified numbers or nested objects; add defensive checks (e.g. `typeof x === 'string' ? x : x?.name`).
- **Address parsing**: always use the `parseAddress` helper or similar code when reading address fields, since multiple components share it.
- **Permissions**: some views/components render based on `usePermission.ts` composable. When adding a new route, ensure permission rules are updated.

## 🧠 Examples

```ts
// loan calculation (flat rate)
const calculateLoanDetails = () => {
  const rate = +loan.rate / 100;
  const monthlyRate = rate / 12;
  const n = +loan.term;
  loan.monthlyPayment = parseFloat(
    ((+loan.totalLoan * monthlyRate) / (1 - 1 / Math.pow(1 + monthlyRate, n))).toFixed(2)
  );
};
```

```ts
// address parsing
function parseAddress(raw: string | { province?: string }) {
  if (typeof raw === 'string') {
    const parts = raw.split(',').map(p => p.trim());
    return { province: parts[2], district: parts[1], subdistrict: parts[0] };
  }
  return raw || {};
}
```

## ✅ Final Notes

- The codebase is small and focused; most functionality revolves around loan applications, users, shops, and products.
- Read `src/__tests__` to see example component tests and learn how to mock stores & API calls.

> **Feedback?** After reviewing this file, let me know if anything needs clarification or if there are gaps. Happy to iterate!