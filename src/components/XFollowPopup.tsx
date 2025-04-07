'use client';

import { useEffect, useState } from 'react';
import { cn, textSize } from '@/lib/utils';
import { X } from 'lucide-react';
import { trackEvent } from '@/utils/tracking';

interface XFollowPopupProps {
  twitterHandle: string;
  delay?: number; // Delay in ms before showing the popup
}

const XFollowPopup: React.FC<XFollowPopupProps> = ({
                                                     twitterHandle,
                                                     delay = 3000,
                                                   }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if the popup has been dismissed before
    const hasBeenDismissed = localStorage.getItem('xFollowPopupDismissed');

    if (!hasBeenDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  const handleFollow = () => {
    window.open(`https://twitter.com/intent/follow?screen_name=${twitterHandle}`, '_blank', 'noopener,noreferrer');
    setIsDismissed(true);
    localStorage.setItem('xFollowPopupDismissed', 'true');

    trackEvent('X Popup Follow Clicked');
  };

  const handleDismiss = () => {
    setIsVisible(false);

    // Track dismissal with Umami
    trackEvent('X Popup Dismissed');

    // Animate out before completely removing
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem('xFollowPopupDismissed', 'true');
    }, 300);
  };

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 max-w-sm w-11/12 sm:w-80 shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-out transform',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none',
      )}
    >
      <div
        className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-800/30 p-4 rounded-lg shadow-blue-900/5 dark:shadow-blue-200/5">
        <div className="flex justify-between items-start">
          <div className="flex-1 mr-2">
            <h3 className={cn(
              'font-semibold text-gray-900 dark:text-gray-100',
              textSize('small'),
            )}>
              Follow for updates!
            </h3>
            <p className={cn(
              'text-gray-600 dark:text-gray-400 mt-1',
              textSize('tiny'),
            )}>
              Stay updated with my latest projects, insights, and developer tips
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={handleFollow}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            aria-label={`Follow @${twitterHandle} on X (Twitter)`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"
                 className="h-4 w-4">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Follow @{twitterHandle}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default XFollowPopup; 