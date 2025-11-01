# Refactor Notes

## Highlights & Snippets

- **Unified optimizer hook** – replaced the earlier micro hooks with one `useOptimizerForm` that returns state slices and direct action helpers.

```diff
- export function useDaysInput() {
-   const { state, dispatch } = useOptimizer();
-   return {
-     days: state.days,
-     errors: state.errors.days,
-     setDays: (value: string) => dispatch({ type: 'SET_DAYS', payload: value }),
-   };
- }
+export function useOptimizerForm() {
+  const { state, dispatch } = useOptimizer();
+  const setDays = (value: string) => {
+    dispatch({ type: 'SET_DAYS', payload: value });
+  };
+  // ...other actions...
+  return {
+    days: state.days,
+    daysError: state.errors.days,
+    setDays,
+    // exposed actions for holidays/company days/year
+  } as const;
+}
```

- **Feature-first layout** – optimizer and holidays modules now sit inside `src/features/*` with shared UI under `src/shared/components/*`. Imports are aligned to these aliases.
- **Local storage sync simplified** – `useLocalStorage` consumes `useOptimizerForm` actions instead of dispatching raw reducer events.
- **Dead utilities removed** – deleted unused helpers (e.g., `src/utils/fp.ts`) and redundant calendar components.

## Parity Checks

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Routes verified unchanged: `/`, `/how-it-works`, `/privacy`, `/terms`.
