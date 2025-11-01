import { useEffect, useRef } from 'react';

export function useEffectEvent<Args extends unknown[], Return>(
  handler: (...args: Args) => Return
): (...args: Args) => Return {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  return (...args: Args) => handlerRef.current(...args);
}
