'use client';

import { KeyboardEvent, useState } from 'react';
import { exportToICS, exportToPTOText } from '@/services/calendarExport';
import { Break, OptimizationStats } from '@/types';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Calendar, Download, FileText, InfoIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionCard } from '@/components/ui/section-card';

interface CalendarExportProps {
  breaks: Break[];
  stats: OptimizationStats;
  selectedYear: number;
}

export const CalendarExport = ({ breaks, stats, selectedYear }: CalendarExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [activeExport, setActiveExport] = useState<'ical' | 'text' | 'google' | null>(null);

  // Handle export to ICS (iCal)
  const handleExportToICS = async () => {
    // Track onboarding dismissal
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track('Calendar exported');
    }

    if (breaks.length === 0) {
      toast.error("No breaks to export", {
        description: "There are no vacation breaks to export to calendar."
      });
      return;
    }

    setIsExporting(true);
    setActiveExport('ical');
    
    try {
      const result = await exportToICS({ 
        breaks, 
        stats, 
        selectedYear
      });
      
      if (result.success) {
        toast.success("Export Successful", {
          description: result.message
        });
      } else {
        toast.error("Export Failed", {
          description: result.message
        });
      }
    } catch (error) {
      toast.error("Export Failed", {
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsExporting(false);
      setActiveExport(null);
    }
  };

  // Handle export to text file
  const handleExportToText = async () => {
    if (breaks.length === 0) {
      toast.error("No breaks to export", {
        description: "There are no PTO days to export."
      });
      return;
    }

    setIsExporting(true);
    setActiveExport('text');
    
    try {
      const result = await exportToPTOText({ 
        breaks, 
        stats, 
        selectedYear
      });
      
      if (result.success) {
        toast.success("Export Successful", {
          description: result.message
        });
      } else {
        toast.error("Export Failed", {
          description: result.message
        });
      }
    } catch (error) {
      toast.error("Export Failed", {
        description: `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsExporting(false);
      setActiveExport(null);
    }
  };

  // Keyboard event handler for info button
  const handleInfoKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Prevent default behavior (scrolling) for space key
      // The tooltip will be shown automatically due to the TooltipTrigger component
    }
  };

  if (breaks.length === 0) {
    return null;
  }

  return (
    <SectionCard
      title="Export Calendar"
      subtitle="Take your vacation plan with you"
      icon={<Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
      rightContent={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" 
                tabIndex={0}
                aria-label="View export information"
                onKeyDown={handleInfoKeyDown}
              >
                <InfoIcon className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p className="text-xs">
                Export your optimized vacation plan to your preferred calendar application. 
                Your {breaks.length} breaks use {stats.totalPTODays} PTO days for {stats.totalDaysOff} total days off.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
    >
      <div className="flex flex-wrap gap-2 pt-1" role="region" aria-label="Calendar export options">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToICS}
                disabled={isExporting}
                className="h-8 px-3 text-xs focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Export to iCal format for Google Calendar, Apple Calendar, Outlook, and other calendar applications"
                tabIndex={0}
              >
                {activeExport === 'ical' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-1.5"
                    aria-hidden="true"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                ) : (
                  <Download className="h-3 w-3 mr-1.5" aria-hidden="true" />
                )}
                <span>iCal (.ics)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Download as iCal file for Google Calendar, Apple Calendar, Outlook, and other calendar applications. 
                <span className="block mt-1 text-blue-500 dark:text-blue-400">
                  Events will show on their actual dates regardless of timezone.
                </span>
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToText}
                disabled={isExporting}
                className="h-8 px-3 text-xs focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Export PTO days to text file"
                tabIndex={0}
              >
                {activeExport === 'text' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-1.5"
                    aria-hidden="true"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                ) : (
                  <FileText className="h-3 w-3 mr-1.5" aria-hidden="true" />
                )}
                <span>Text (.txt)</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                Export your PTO days as a simple text file listing all dates.
                <span className="block mt-1 text-blue-500 dark:text-blue-400">
                  Perfect for sharing with HR or keeping a simple record.
                </span>
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </SectionCard>
  );
}; 