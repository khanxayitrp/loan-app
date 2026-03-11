# Copilot Instructions for my-loan-app

Welcome! This document is for any AI coding agent (Copilot, Claude, etc.) that will work with the **my-loan-app** Vue 3 project. It gives the minimal context, conventions, security rules, and touch points needed to be immediately useful.

## 🏗️ Architecture Overview

- **Vue 3 + Vite**: A single‑page front‑end built with Vue 3, `<script setup>` syntax and the Composition API. TypeScript is used throughout.
- **Pinia Stores** (`src/stores/*`): State & API logic lives here. Stores are named `useXStore` (e.g. `useAuthStore`). They export reactive state and methods that wrap API calls.
- **API client** (`src/api/apiclient.ts`): A centralized Axios instance with request/response interceptors. The auth interceptor handles `401` and calls `authStore.signOut()`.
- **Routing** (`src/router/index.ts`): Global `beforeEach` guard checks auth and permissions on every navigation.
- **Components**: Feature folders under `src/components` and `src/views`.
- **Types** (`src/types/*.ts`): TS interfaces mirror API responses.

## 🔒 Security Guidelines (STRICT)

1. **No XSS Vulnerabilities**: **NEVER** use `v-html` with user-generated content. If raw HTML rendering is absolutely required, use a sanitizer library like `DOMPurify`.
2. **Environment Variables**: **NEVER** hardcode API keys, secrets, or backend URLs in the codebase. Always use `import.meta.env.VITE_XXX`.
3. **Data Validation**: Always validate user input on the client-side before sending it to the API (e.g., check for empty strings, negative numbers, or invalid file sizes for image uploads).
4. **Console Logs**: Remove sensitive data from `console.log()` (e.g., never log passwords, raw tokens, or full user identity objects in production).
5. **Route Protection**: Ensure every new route in `src/router/index.ts` has appropriate `meta: { requiresAuth: true, roles: [...] }` if it contains sensitive data.

## 🚀 Coding Best Practices

1. **DRY Principle (Don't Repeat Yourself)**: 
   - If you see duplicate logic across components (like Loan Calculations or Address Parsing), **extract it into a Composable (`src/composables/useXXX.ts`) or Utility function**.
2. **Centralized UI Alerts**: **NEVER** use native `alert()` or `confirm()`. Always import and use the custom alert utility:
   `import { alert } from '@/utils/alert'` (Use `alert.success()`, `alert.error()`, `alert.confirm()`).
3. **Error Handling**: Always wrap API calls in `try/catch/finally` blocks. Handle loading states properly using `finally { isLoading.value = false }`.
4. **Defensive Programming**: API sometimes returns stringified numbers or nested objects. Add defensive checks using Optional Chaining (`?.`) and Nullish Coalescing (`??`).
5. **Language Consistency**: All User Interface text, labels, and placeholders MUST be in the **Lao language (ພາສາລາວ)**.

## 🔄 Data Flow Patterns

1. **Component → Store → API → Component**: Components import and call store methods. Stores use `apiClient` and update their own state.
2. **Loan calculations**: Forms compute monthly payment / interest. **Refactoring Rule:** If you need to modify the loan formula in `CreateDraftLoan.vue`, `RequestForm.vue`, or `LoanContractForm.vue`, strongly suggest extracting `calculateLoanDetails` into a centralized composable (`useLoanCalculator.ts`) to ensure consistency.
3. **Guarantor / work info**: Data structures differ between APIs (`loan_guarantors` array vs `guarantor` object); handle mapping carefully.

## 🚧 Common Pitfalls for AI Agents

- **Interceptors**: Don’t replicate the recursive logout bug; check `apiClient` and `stores/auth.ts` for existing guards.
- **Type mismatches**: Ensure you convert strings to numbers (`Number(val)`) before doing math, as APIs might return strings.
- **Address parsing**: Always use the `parseAddress` helper when reading address fields.

## 🗣️ Communication Rules
- Write code comments and explanations in **Thai** (ภาษาไทย).
- Keep code explanations concise. Focus on the "Why" rather than the "What".

## 🧠 Examples

### Example: Proper Async API Call with Error Handling & Custom Alert
```ts
import { ref } from 'vue';
import { alert } from '@/utils/alert';
import { useLoanApplicationStore } from '@/stores/loanApplication';

const store = useLoanApplicationStore();
const isSaving = ref(false);

const saveRecord = async (payload: any) => {
  isSaving.value = true;
  try {
    await store.saveData(payload);
    alert.success('ບັນທຶກຂໍ້ມູນສຳເລັດ'); // Lao UI text + Custom Alert
  } catch (error: any) {
    console.error('Save failed:', error);
    alert.error('ເກີດຂໍ້ຜິດພາດ', error.message);
  } finally {
    isSaving.value = false;
  }
};
```

## ✅ Final Notes

- The codebase is small and focused; most functionality revolves around loan applications, users, shops, and products.
- Read `src/__tests__` to see example component tests and learn how to mock stores & API calls.
- When generating code, prioritize readability, strict TypeScript typing, and reusability.

> **Feedback?** After reviewing this file, let me know if anything needs clarification or if there are gaps. Happy to iterate!