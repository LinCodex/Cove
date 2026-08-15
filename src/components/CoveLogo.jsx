import React, { useId } from 'react';

const BUBBLE =
  'M20 10H48A14 14 0 0 1 62 24v14A14 14 0 0 1 48 52H24L10 66l6-14h4A14 14 0 0 1 6 38V24A14 14 0 0 1 20 10ZM22 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0ZM34 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0ZM46 36m-3.6 0a3.6 3.6 0 1 1 7.2 0a3.6 3.6 0 1 1-7.2 0Z';

export default function CoveLogo({
  variant = 'gradient',
  size = 28,
  className,
  title
}) {
  const uid = useId().replace(/:/g, '');
  const gradId = `coveGrad-${uid}`;
  const fill = variant === 'gradient' ? `url(#${gradId})` : 'currentColor';
  const height = Math.round((size * 72) / 96);

  return (
    <svg
      viewBox="0 0 96 72"
      width={size}
      height={height}
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {variant === 'gradient' && (
        <defs>
          <linearGradient id={gradId} x1="6" y1="36" x2="92" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B9EFF" />
            <stop offset="100%" stopColor="#E4F3FF" />
          </linearGradient>
        </defs>
      )}
      <g fill={fill}>
        <path fillRule="evenodd" d={BUBBLE} />
        <rect x="68" y="22" width="18" height="6" rx="3" />
        <rect x="68" y="33" width="24" height="6" rx="3" />
        <rect x="68" y="44" width="18" height="6" rx="3" />
      </g>
    </svg>
  );
}
