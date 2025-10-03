import { ReactNode } from 'react';
import { FormSection } from './FormSection';
import { StepHeader } from './StepHeader';

interface FormStepCardProps {
  step: number;
  title: string | ReactNode;
  description: string;
  id: string;
  children: ReactNode;
  colorScheme?: 'teal' | 'blue' | 'amber' | 'violet';
}

export function FormStepCard({
  step,
  title,
  description,
  id,
  children,
  colorScheme = 'teal',
}: FormStepCardProps) {
  return (
    <FormSection colorScheme={colorScheme} headingId={`${id}-heading`}>
      <StepHeader
        number={step}
        title={title}
        description={description}
        colorScheme={colorScheme}
        id={`${id}-heading`}
      />
      <div className="pt-1">{children}</div>
    </FormSection>
  );
} 