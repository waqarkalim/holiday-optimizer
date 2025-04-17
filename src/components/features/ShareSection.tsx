'use client';

import { Share2 } from 'lucide-react';
import { SectionCard } from '@/components/ui/section-card';
import SocialShareButtons from '@/components/SocialShareButtons';
import { OptimizationStats } from '@/types';

interface ShareSectionProps {
  stats?: OptimizationStats;
  selectedYear?: number;
}

export const ShareSection = ({ stats, selectedYear }: ShareSectionProps) => {
  // Create a more personalized share message if stats are available
  const getShareTitle = () => {
    if (stats) {
      return `I optimized my ${stats.totalPTODays} PTO days into ${stats.totalDaysOff} days off in ${selectedYear || new Date().getFullYear()}!`;
    }
    return 'Holiday Optimizer - Maximize Your Time Off';
  };

  const getShareDescription = () => {
    if (stats) {
      return `I'm getting ${stats.totalDaysOff} days off using only ${stats.totalPTODays} PTO days. Try it yourself!`;
    }
    return 'Plan your PTO days strategically to get the most out of your holidays.';
  };

  return (
    <SectionCard
      title="Share With Friends"
      subtitle="Help others optimize their time off too"
      icon={<Share2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Know someone who could use more vacation days? Share this tool and help them make the most of their time off.
        </p>
        <SocialShareButtons 
          showLabels={true} 
          title={getShareTitle()}
          description={getShareDescription()}
          className="pt-1"
        />
      </div>
    </SectionCard>
  );
};

export default ShareSection;