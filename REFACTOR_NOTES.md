# Refactor Notes

## Highlights & Snippets
- **Unified optimizer hook** – replaced five micro hooks with one `useOptimizerForm` that returns state slices and memoised actions.

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
+  const setDays = useCallback((value: string) => {
+    dispatch({ type: 'SET_DAYS', payload: value });
+  }, [dispatch]);
+  // ...other actions...
+  return {
+    days: state.days,
+    daysError: state.errors.days,
+    setDays,
+    // exposed actions for holidays/company days/year
+  } as const;
+}
```

- **Feature-first layout** – optimizer and holidays modules moved to `src/features/*`; shared UI/theme now under `src/shared/components`. Imports normalised to the new aliases.
- **Local storage sync simplified** – `useLocalStorage` now consumes `useOptimizerForm` actions instead of dispatching raw reducer events.
- **Dead utilities removed** – deleted unused `src/utils/fp.ts` and an unused calendar component.

## Parity Checks
- `pnpm lint`
- `pnpm test`
- `pnpm build` *(fails offline: Next.js cannot download Inter from Google Fonts in this sandbox; no app code changes required in production environments with network access.)*

Routes verified unchanged: `/`, `/how-it-works`, `/holidays`, `/holidays/[country]`, `/holidays/[country]/[state]`, `/holidays/[country]/[state]/[region]`, `/privacy`, `/terms`.
