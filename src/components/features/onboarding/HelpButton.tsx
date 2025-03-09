'use client';

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface HelpButtonProps {
  className?: string;
}

export const HelpButton = ({ className }: HelpButtonProps) => {
  const { startOnboarding } = useOnboarding();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={startOnboarding}
          className={className}
          aria-label="Show onboarding guide"
        >
          <HelpCircle className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Show onboarding guide</p>
      </TooltipContent>
    </Tooltip>
  );
};