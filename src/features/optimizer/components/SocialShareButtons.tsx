'use client';

import { Facebook, Link as LinkIcon, Linkedin, Mail, Twitter } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { trackEvent } from '@/utils/tracking';

interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
  showLabels?: boolean;
  className?: string;
}

const SocialShareButtons = ({
  url = window.location.href,
  title = 'Holiday Optimizer - Maximize Your Time Off',
  description = 'Plan your PTO days strategically to get the most out of your holidays.',
  showLabels = false,
  className = '',
}: SocialShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const trackShare = (platform: string) => {
    trackEvent('Content shared', { platform });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success('URL copied to clipboard');
        trackShare('clipboard');
      },
      () => {
        toast.error('Failed to copy URL');
      }
    );
  };

  const getEmailShareUrl = () => {
    return `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        onClick={() => trackShare('twitter')}
        className={`inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground ${showLabels ? 'px-3 h-9' : 'h-9 w-9'}`}
      >
        <Twitter className="h-4 w-4" />
        {showLabels && <span className="ml-2 text-sm">Twitter</span>}
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        onClick={() => trackShare('facebook')}
        className={`inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground ${showLabels ? 'px-3 h-9' : 'h-9 w-9'}`}
      >
        <Facebook className="h-4 w-4" />
        {showLabels && <span className="ml-2 text-sm">Facebook</span>}
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        onClick={() => trackShare('linkedin')}
        className={`inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground ${showLabels ? 'px-3 h-9' : 'h-9 w-9'}`}
      >
        <Linkedin className="h-4 w-4" />
        {showLabels && <span className="ml-2 text-sm">LinkedIn</span>}
      </a>

      <a
        href={getEmailShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share via Email"
        onClick={() => trackShare('email')}
        className={`inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground ${showLabels ? 'px-3 h-9' : 'h-9 w-9'}`}
      >
        <Mail className="h-4 w-4" />
        {showLabels && <span className="ml-2 text-sm">Email</span>}
      </a>

      <Button
        variant="outline"
        size={showLabels ? 'default' : 'icon'}
        onClick={copyToClipboard}
        aria-label="Copy link to clipboard"
        className={showLabels ? 'h-9 px-3' : ''}
      >
        <LinkIcon className="h-4 w-4" />
        {showLabels && <span className="ml-2 text-sm">Copy Link</span>}
      </Button>
    </div>
  );
};

export default SocialShareButtons;
