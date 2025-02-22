'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

const themes = [
  {
    id: 'light',
    name: 'Light',
    icon: Sun,
    activeClass: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
    inactiveClass: 'text-gray-600 dark:text-gray-400',
  },
  {
    id: 'dark',
    name: 'Dark',
    icon: Moon,
    activeClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400',
    inactiveClass: 'text-gray-600 dark:text-gray-400',
  },
  {
    id: 'system',
    name: 'System',
    icon: Monitor,
    activeClass: 'bg-teal-50 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400',
    inactiveClass: 'text-gray-600 dark:text-gray-400',
  },
];

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const currentTheme = themes.find(t => t.id === theme) || themes[2];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 relative"
        >
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CurrentIcon className="h-4 w-4" />
          </motion.div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 p-1">
        {themes.map(({ id, name, icon: Icon, activeClass, inactiveClass }) => (
          <DropdownMenuItem
            key={id}
            onClick={() => setTheme(id)}
            className={`
              flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md text-sm font-medium
              transition-colors duration-200
              ${theme === id ? activeClass : inactiveClass}
              hover:bg-gray-100 dark:hover:bg-gray-800
            `}
          >
            <Icon className="h-4 w-4" />
            <span>{name}</span>
            {theme === id && (
              <motion.div
                layoutId="activeIndicator"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-current"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 