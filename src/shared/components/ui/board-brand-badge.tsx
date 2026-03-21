import { useEffect, useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { getBoardBrand, getBoardFaviconUrl } from '@/shared/lib/boardBrand';

type BoardBrandBadgeProps = {
  siteName?: string | null;
  showLabel?: boolean;
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
};

export function BoardBrandBadge({
  siteName,
  showLabel = true,
  className,
  iconClassName,
  labelClassName,
}: BoardBrandBadgeProps) {
  const brand = getBoardBrand(siteName);
  const faviconUrl = getBoardFaviconUrl(siteName);
  const [showFallback, setShowFallback] = useState(!faviconUrl);

  useEffect(() => {
    setShowFallback(!faviconUrl);
  }, [faviconUrl]);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2 py-1',
        brand.bgClassName,
        brand.borderClassName,
        className,
      )}
      title={siteName || brand.label}
    >
      <span
        className={cn(
          'inline-flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border text-[10px] font-semibold uppercase',
          brand.bgClassName,
          brand.borderClassName,
          brand.textClassName,
          iconClassName,
        )}
      >
        {faviconUrl && !showFallback ? (
          <img
            src={faviconUrl}
            alt={siteName || brand.label}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setShowFallback(true)}
          />
        ) : (
          brand.shortLabel
        )}
      </span>
      {showLabel ? (
        <span className={cn('max-w-[140px] truncate text-[11px] font-medium', brand.textClassName, labelClassName)}>
          {siteName || brand.label}
        </span>
      ) : null}
    </span>
  );
}
