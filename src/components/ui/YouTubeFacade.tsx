import { useState } from 'react';

import { PlayIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface YouTubeFacadeProps {
  videoId: string;
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Click-to-play YouTube embed. Renders only a thumbnail + play button until
 * clicked, so the iframe (and its scripts/cookies) never loads unrequested —
 * avoids autoplay accessibility/data-usage issues while keeping the visual
 * impact of a video hero.
 */
export function YouTubeFacade({
  videoId,
  title,
  subtitle,
  className,
}: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div
        className={cn(
          'border-kapwa-border-weak relative aspect-video w-full overflow-hidden rounded-2xl border shadow-lg',
          className
        )}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
          title={title}
          className='absolute inset-0 h-full w-full'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type='button'
      onClick={() => setPlaying(true)}
      className={cn(
        'group border-kapwa-border-weak relative block aspect-video w-full overflow-hidden rounded-2xl border shadow-lg',
        className
      )}
      aria-label={`Play video: ${title}`}
    >
      <img
        src={`https://i.ytimg.com/vi/${videoId}/sddefault.jpg`}
        alt=''
        className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
        loading='lazy'
      />
      <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent' />

      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='bg-kapwa-bg-surface flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110 md:h-20 md:w-20'>
          <PlayIcon
            className='text-kapwa-bg-brand-default h-7 w-7 translate-x-0.5 md:h-8 md:w-8'
            fill='currentColor'
          />
        </span>
      </div>

      <div className='absolute right-0 bottom-0 left-0 p-4 text-left md:p-6'>
        {subtitle && (
          <p className='text-kapwa-text-inverse/80 text-[10px] font-bold tracking-widest uppercase'>
            {subtitle}
          </p>
        )}
        <h3 className='text-kapwa-text-inverse text-lg leading-tight font-black md:text-2xl'>
          {title}
        </h3>
      </div>
    </button>
  );
}
