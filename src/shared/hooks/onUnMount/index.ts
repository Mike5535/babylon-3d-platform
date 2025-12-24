import { useEffect, useRef } from 'react';

export const useOnUnMount = (callback: () => void) => {
  const isMounted = useRef(false);

  useEffect(() => {
    requestAnimationFrame(() => (isMounted.current = true));

    return () => {
      if (isMounted.current) {
        callback();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
