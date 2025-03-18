'use client';

import { Facebook, Link as LinkIcon, Linkedin, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SocialShareButtonsProps {
  url?: string;
  title?: string;
  description?: string;
}

const SocialShareButtons = ({
                              url = window.location.href,
                              title = 'Holiday Optimizer - Maximize Your Time Off',
                              description = 'Plan your PTO days strategically to get the most out of your holidays.',
                            }: SocialShareButtonsProps) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(
      () => {
        toast.success('URL copied to clipboard');
      },
      () => {
        toast.error('Failed to copy URL');
      },
    );
  };

  return (
    <div className={`flex space-x-2`}>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        <Twitter className="h-4 w-4" />
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedDescription}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        <Facebook className="h-4 w-4" />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        <Linkedin className="h-4 w-4" />
      </a>

      <Button
        variant="outline"
        size="icon"
        onClick={copyToClipboard}
        aria-label="Copy link to clipboard"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SocialShareButtons;