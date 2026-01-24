import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToTop } from '@/shared/lib/utils';

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Delay ensures new route content is fully rendered
    const timeoutId = setTimeout(() => {
      scrollToTop('auto');
    }, 10);
    
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
