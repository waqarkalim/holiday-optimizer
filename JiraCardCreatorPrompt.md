# Holiday Optimizer - Jira Card Creator Prompt

## Overview
This prompt helps you create standardized Jira cards for the Holiday Optimizer project. The Holiday Optimizer is a Next.js application that helps professionals optimize their vacation days by suggesting the most efficient ways to use their limited time off.

## Card Types
When creating cards, specify one of the following types:
- `Feature`: New functionality
- `Enhancement`: Improvements to existing features
- `Bug`: Issues that need fixing
- `Task`: General development tasks
- `Refactor`: Code improvements without changing functionality
- `Documentation`: Updates to documentation
- `Test`: Testing-related tasks

## Components
Specify which component the work relates to:
- `Frontend`: UI/UX elements and client-side logic
- `Optimization Engine`: Core holiday optimization algorithm
- `Data Management`: How user data is stored and managed
- `Infrastructure`: AWS, Terraform, and deployment concerns
- `Testing`: Test suite improvements or additions
- `Documentation`: README, inline comments, etc.

## Key Areas
Reference specific areas of the application:
- `Form`: The vacation day input form components
- `Calendar`: Calendar visualization components
- `Optimization Strategies`: Logic for different break patterns (balanced, long weekends, etc.)
- `Holiday Management`: Public holiday and company day off handling
- `Results Display`: How optimization results are presented
- `Accessibility`: A11y improvements
- `Performance`: Speed and optimization concerns
- `Mobile Responsiveness`: Mobile UI improvements

## Template

```
Type: [Feature/Enhancement/Bug/Task/Refactor/Documentation/Test]
Component: [Frontend/Optimization Engine/Data Management/Infrastructure/Testing/Documentation]
Area: [Form/Calendar/Optimization Strategies/Holiday Management/Results Display/Accessibility/Performance/Mobile Responsiveness]

## Title
[Brief, descriptive title]

## Description
[Detailed description of the work to be done]

## Acceptance Criteria
- [ ] [Criteria 1]
- [ ] [Criteria 2]
- [ ] [Criteria 3]

## Technical Details
[Any technical considerations, implementation notes, or architecture decisions]

## Dependencies
[List any dependencies on other cards or external factors]

## Effort Estimate
[S/M/L/XL]

## Priority
[High/Medium/Low]

## Affected Files
[List of files likely to be affected, if known]
```

## Example Card

```
Type: Feature
Component: Frontend
Area: Calendar

## Title
Implement Drag-and-Drop for Calendar Break Selection

## Description
Add drag-and-drop functionality to the calendar view allowing users to select date ranges for custom breaks by dragging across calendar days. This should provide a more intuitive interface for creating custom breaks compared to the current click-based selection.

## Acceptance Criteria
- [ ] Users can click and drag to select a range of days on the calendar
- [ ] Selected days visually highlight during the drag operation
- [ ] Upon release, the selected range is treated as a custom break
- [ ] Selection respects weekends and holidays (visually differentiating them)
- [ ] Mobile touch interactions are supported
- [ ] Keyboard accessibility is maintained
- [ ] Animation is smooth with no performance issues

## Technical Details
- Use React DnD or a similar library for drag interactions
- Ensure state management correctly tracks selected ranges
- Optimize for performance with many calendar days
- Implement proper touch events for mobile support

## Dependencies
- None

## Effort Estimate
M

## Priority
Medium

## Affected Files
- src/components/features/Calendar.tsx
- src/components/features/CalendarView.tsx
- src/hooks/useOptimizer.ts
- src/contexts/OptimizerContext.tsx
```

## Additional Notes for Card Creation

1. **For Bug Reports:**
   - Include steps to reproduce
   - Add expected vs. actual behavior
   - Note environment details (browser, OS, etc.)
   - Include screenshots if applicable

2. **For Features/Enhancements:**
   - Consider user stories ("As a user, I want to...")
   - Link to design mockups if available
   - Note any analytics requirements

3. **For Refactoring:**
   - Explain current issues with code
   - Outline expected improvements
   - Note risk factors
   - Consider if tests need updating

4. **For All Cards:**
   - Use clear, concise language
   - Break large tasks into smaller, manageable cards
   - Link related cards where appropriate
   - Consider impact on performance and accessibility 