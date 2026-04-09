# SPA refactor: single route with lazy modules, staggered animations, memo optimization

## Goal
Refactor the app from multi-route Next.js to a single-page app with tab-based navigation. Keep the 4 header nav categories (Dashboard, Invoices, Contacts, Settings) but render them as lazy-loaded modules within one page instead of separate routes. Add: React.lazy + Suspense for each module, staggered fade-in animations for smooth section loading, React.memo on heavy components (InvoiceForm, DraftsPanel, ContactsPage, Dashboard cards), useMemo/useCallback audit across all components.


---

You are a senior software engineer tasked with implementing this goal. Your job is to analyze the goal, explore the codebase as needed, and then implement it.

## Analysis Checklist

Before implementing, briefly consider each dimension:

- [ ] **Feasibility**: Can this be done with the current architecture?
- [ ] **Impact scope**: What parts of the codebase are affected?
- [ ] **Dependencies**: Are there external dependencies or integrations?
- [ ] **Data flow**: How does data move through the affected components?
- [ ] **Edge cases**: What could go wrong? What inputs need handling?
- [ ] **Security**: Any authentication, authorization, or input validation needs?
- [ ] **Performance**: Will this affect load times or resource usage?
- [ ] **Testing**: How will you verify this works correctly?

## Instructions

1. **Explore** the relevant parts of the codebase to understand existing patterns
2. **Identify** the specific files and functions that need modification
3. **Implement** the changes following the project's existing conventions
4. **Verify** the implementation works (run build, check for type errors)

## Implementation Guidelines

- Follow existing code patterns and conventions in the project
- Make minimal, focused changes - don't refactor unrelated code
- Add appropriate error handling for new functionality
- Update types/interfaces if adding new data structures
- Avoid creating unnecessary abstractions or over-engineering

## Expected Output

When complete, provide:
1. Summary of changes made (files modified/created)
2. Any follow-up items or considerations
3. Verification that the build passes
