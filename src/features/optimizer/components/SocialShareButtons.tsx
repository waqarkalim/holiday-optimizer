'use client';

import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { Facebook, Link, Linkedin, Mail, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { trackEvent } from '@/utils/tracking';
import { useState } from 'react';

interface SocialShareButtonsProps {
  variant: 'primary' | 'secondary';
  url?: string;
  title?: string;
  description?: string;
  className?: string;
}

const DEFAULT_TITLE = 'Holiday Optimizer - Maximize Your Time Off';
const DEFAULT_DESCRIPTION = 'Plan your PTO days strategically to get the most out of your holidays.';

const getEncodedValues = (url: string, title: string, description: string) => {
  const encodedUrl = encodeURIComponent(url);
  return {
    encodedUrl,
    encodedTitle: encodeURIComponent(title),
    encodedDescription: encodeURIComponent(description),
  };
};

export function SocialShareButtons({
  variant,
  url = typeof window !== 'undefined' ? window.location.href : 'https://holiday-optimizer.com',
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  className,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { encodedUrl, encodedTitle, encodedDescription } = getEncodedValues(url, title, description);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      trackEvent('Content shared', { platform: 'clipboard' });
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Unable to copy link');
    }
  };

  if (variant === 'primary') {
    return (
      <div className={cn('flex flex-nowrap items-stretch gap-3', className)}>
        <Button
          variant="outline"
          size="default"
          className="flex-1 justify-center gap-2 rounded-lg border border-violet-200 bg-white text-violet-700 shadow-sm hover:bg-violet-50 sm:text-sm"
          asChild
          onClick={() => {
            trackEvent('Content shared', { platform: 'email' });
            toast.message('Opening your email client…');
          }}
        >
          <a
            href={`mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            <span>Email This</span>
          </a>
        </Button>

        <Button
          variant="outline"
          size="default"
          className="flex-1 justify-center gap-2 rounded-lg border border-violet-200 bg-white text-violet-700 shadow-sm hover:bg-violet-50 sm:text-sm"
          onClick={copyToClipboard}
          aria-label="Copy link to clipboard"
        >
          <Link className="h-4 w-4" aria-hidden="true" />
          <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100"
        asChild
        onClick={() => trackEvent('Content shared', { platform: 'twitter' })}
        aria-label="Share on X (Twitter)"
      >
        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter className="h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100"
        asChild
        onClick={() => trackEvent('Content shared', { platform: 'facebook' })}
        aria-label="Share on Facebook"
      >
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Facebook className="h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100"
        asChild
        onClick={() => trackEvent('Content shared', { platform: 'linkedin' })}
        aria-label="Share on LinkedIn"
      >
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="h-4 w-4" aria-hidden="true" />
        </a>
      </Button>
    </div>
  );
}

export default SocialShareButtons;
