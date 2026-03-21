export type BoardBrand = {
  key: string;
  label: string;
  shortLabel: string;
  domain?: string;
  bgClassName: string;
  textClassName: string;
  borderClassName: string;
};

const BOARD_BRANDS: Array<{
  match: RegExp;
  brand: BoardBrand;
}> = [
  {
    match: /jobtarget programmatic|jobtarget/i,
    brand: {
      key: 'jobtarget',
      label: 'JobTarget',
      shortLabel: 'JT',
      domain: 'jobtarget.com',
      bgClassName: 'bg-sky-50 dark:bg-sky-950/30',
      textClassName: 'text-sky-700 dark:text-sky-300',
      borderClassName: 'border-sky-200 dark:border-sky-900',
    },
  },
  {
    match: /indeed/i,
    brand: {
      key: 'indeed',
      label: 'Indeed',
      shortLabel: 'in',
      domain: 'indeed.com',
      bgClassName: 'bg-indigo-50 dark:bg-indigo-950/30',
      textClassName: 'text-indigo-700 dark:text-indigo-300',
      borderClassName: 'border-indigo-200 dark:border-indigo-900',
    },
  },
  {
    match: /linkedin/i,
    brand: {
      key: 'linkedin',
      label: 'LinkedIn',
      shortLabel: 'in',
      domain: 'linkedin.com',
      bgClassName: 'bg-blue-50 dark:bg-blue-950/30',
      textClassName: 'text-blue-700 dark:text-blue-300',
      borderClassName: 'border-blue-200 dark:border-blue-900',
    },
  },
  {
    match: /ziprecruiter/i,
    brand: {
      key: 'ziprecruiter',
      label: 'ZipRecruiter',
      shortLabel: 'ZR',
      domain: 'ziprecruiter.com',
      bgClassName: 'bg-emerald-50 dark:bg-emerald-950/30',
      textClassName: 'text-emerald-700 dark:text-emerald-300',
      borderClassName: 'border-emerald-200 dark:border-emerald-900',
    },
  },
  {
    match: /adzuna/i,
    brand: {
      key: 'adzuna',
      label: 'Adzuna',
      shortLabel: 'AD',
      domain: 'adzuna.com',
      bgClassName: 'bg-orange-50 dark:bg-orange-950/30',
      textClassName: 'text-orange-700 dark:text-orange-300',
      borderClassName: 'border-orange-200 dark:border-orange-900',
    },
  },
  {
    match: /ethical jobs/i,
    brand: {
      key: 'ethical-jobs',
      label: 'Ethical Jobs',
      shortLabel: 'EJ',
      domain: 'ethicaljobs.com.au',
      bgClassName: 'bg-teal-50 dark:bg-teal-950/30',
      textClassName: 'text-teal-700 dark:text-teal-300',
      borderClassName: 'border-teal-200 dark:border-teal-900',
    },
  },
  {
    match: /glassdoor/i,
    brand: {
      key: 'glassdoor',
      label: 'Glassdoor',
      shortLabel: 'GD',
      domain: 'glassdoor.com',
      bgClassName: 'bg-green-50 dark:bg-green-950/30',
      textClassName: 'text-green-700 dark:text-green-300',
      borderClassName: 'border-green-200 dark:border-green-900',
    },
  },
  {
    match: /monster/i,
    brand: {
      key: 'monster',
      label: 'Monster',
      shortLabel: 'M',
      domain: 'monster.com',
      bgClassName: 'bg-violet-50 dark:bg-violet-950/30',
      textClassName: 'text-violet-700 dark:text-violet-300',
      borderClassName: 'border-violet-200 dark:border-violet-900',
    },
  },
];

function fallbackShortLabel(name: string) {
  const normalized = String(name || '').trim();
  if (!normalized) return 'JB';
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

export function getBoardBrand(siteName?: string | null): BoardBrand {
  const name = String(siteName || '').trim();
  const match = BOARD_BRANDS.find((item) => item.match.test(name));
  if (match) return match.brand;

  return {
    key: 'generic',
    label: name || 'Job board',
    shortLabel: fallbackShortLabel(name),
    bgClassName: 'bg-muted/50',
    textClassName: 'text-muted-foreground',
    borderClassName: 'border-border/70',
  };
}

export function getBoardFaviconUrl(siteName?: string | null) {
  const brand = getBoardBrand(siteName);
  if (!brand.domain) return undefined;
  return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(brand.domain)}`;
}
