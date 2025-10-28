import 'react';

declare module 'react' {
  interface ActivityProps {
    mode?: 'visible' | 'hidden';
    children?: React.ReactNode;
  }

  export const Activity: React.ComponentType<ActivityProps>;
}
