// Constants for local storage keys
const ONBOARDING_COMPLETED_KEY = 'holiday-optimizer-onboarding-completed';

/**
 * Check if the user has completed the onboarding process
 * @returns boolean indicating if onboarding has been completed
 */
export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true';
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return false;
  }
}

/**
 * Set the onboarding completed status
 * @param completed - boolean indicating if onboarding is completed
 */
export function setOnboardingCompleted(completed: boolean): void {
  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, completed.toString());
  } catch (error) {
    console.error('Failed to save onboarding status:', error);
  }
}

/**
 * Reset the onboarding status to not completed
 */
export function resetOnboardingStatus(): void {
  try {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  } catch (error) {
    console.error('Failed to reset onboarding status:', error);
  }
} 