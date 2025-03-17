# Jira Card Creator Prompt

This is a prompt for creating Jira cards related to our Holiday Optimizer application.

## General Structure

```
Title: [Clear, concise title describing the task]

Description:
[Detailed description of the task, including context and requirements]

Acceptance Criteria:
- [Criterion 1]
- [Criterion 2]
- ...

Technical Details:
[Any technical information that would help implementation]

Design Resources:
[Links to designs or mockups if applicable]

Dependencies:
[Any dependencies on other tasks]

Estimation:
[Story point estimate or time estimate]
```

## Labels to Use

- `Frontend`: React, Next.js, UI components, styling
- `Backend`: API endpoints, data processing, server logic
- `DevOps`: CI/CD, deployment, hosting, Cloudflare Pages configuration
- `UX/UI`: Design implementation, animations, responsive design
- `Testing`: Unit tests, integration tests, E2E tests
- `Documentation`: User guides, API docs, codebase documentation
- `Bug`: Issue that needs to be fixed
- `Feature`: New functionality
- `Tech Debt`: Refactoring, code quality improvements
- `Performance`: Optimization work
- `Security`: Security-related issues
- `Accessibility`: A11y improvements

## Epic Categories

- `User Authentication`: Login, signup, password management
- `Trip Planning`: Creating and managing trip plans
- `Optimization`: Algorithm and recommendation features
- `Calendar Integration`: Calendar features and integrations
- `Sharing`: Collaboration and sharing capabilities
- `Reporting`: Analytics and reports for users
- `Admin`: Admin panel and management features
- `Infrastructure`: Hosting, deployment, monitoring
- `Onboarding`: User onboarding and tutorials
- `Mobile Responsiveness`: Mobile-specific features and improvements

## Task Types

- **Feature Development**: New functionality implementation
- **Bug Fix**: Resolving issues
- **Enhancement**: Improving existing functionality
- **Tech Debt**: Refactoring and cleanup
- **Documentation**: Creating or updating documentation
- **Design Implementation**: Implementing UI designs
- **Testing**: Creating tests or testing framework
- **Performance Optimization**: Improving application performance
- **Security Enhancement**: Addressing security concerns
- **Accessibility Improvement**: Making the app more accessible

## Priority Levels

- **Highest**: Critical items that must be addressed immediately
- **High**: Important items for the current sprint
- **Medium**: Important but not urgent
- **Low**: Nice to have, not time-sensitive
- **Lowest**: Can be deferred to future sprints

## Template Examples

### Feature Card Example

```
Title: Implement Calendar Day Selection Component

Description:
Create a reusable calendar day selection component that allows users to select 
dates for their holiday planning. The component should highlight selected 
dates, show date ranges, and mark holidays and weekends differently.

Acceptance Criteria:
- Component allows selecting individual dates
- Component allows selecting date ranges
- Selected dates are visually highlighted
- Weekends have distinct styling
- Public holidays are marked with a special indicator
- Component is keyboard accessible
- Component works across all supported browsers

Technical Details:
- Use React with TypeScript
- Implement as a controlled component
- Should support all standard date formats
- Must be responsive for mobile devices

Design Resources:
- [Link to Figma design]

Dependencies:
- None

Estimation:
5 story points
```

### Bug Fix Example

```
Title: Fix Date Selection Bug in Safari

Description:
Users on Safari browsers are reporting that selecting dates on the calendar 
sometimes selects an adjacent date instead of the one clicked. This appears 
to be a browser-specific issue with event handling.

Acceptance Criteria:
- Date selection works correctly on Safari
- Existing functionality on Chrome and Firefox is unchanged
- Add automated tests to verify correct behavior

Technical Details:
- Issue seems related to click event coordinates in Safari
- Check for Safari-specific event handling differences
- May need to use pointer events instead of click events

Steps to Reproduce:
1. Open the application in Safari
2. Navigate to the trip planning page
3. Try to select a date on the calendar
4. Note that the highlighted date is sometimes adjacent to the clicked date

Dependencies:
- None

Estimation:
3 story points
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