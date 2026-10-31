import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ :-+.';
const TICKS = 7;
const TICK_MS = 45;

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

interface SplitFlapProps {
  /** The value to display — animates character-by-character when it changes */
  text: string;
  /** Number of character cells to render (pads with spaces, truncates overflow) */
  length?: number;
  /** Applied to the wrapper — use for font-size (e.g. 'text-xs') */
  className?: string;
  /** Character cell height, in em relative to the wrapper's font-size */
  cellHeightEm?: number;
  /** Character cell width, in em relative to the wrapper's font-size */
  cellWidthEm?: number;
}

/**
 * Solari/split-flap departure-board style text. Cycles each character
 * through a few random glyphs before settling on the target value,
 * replaying whenever `text` changes (not just on mount).
 *
 * Deliberately avoids flex/grid on the character tiles — browsers insert
 * line breaks around block-level flex items when a user selects/copies the
 * rendered text, which would turn "TW 125" into one character per line.
 * inline-block + line-height centering keeps it copy-paste-safe.
 */
export function SplitFlap({
  text,
  length,
  className,
  cellHeightEm = 1.4,
  cellWidthEm = 0.85,
}: SplitFlapProps) {
  const target = (
    length ? text.padEnd(length).slice(0, length) : text
  ).toUpperCase();
  const [display, setDisplay] = useState(target);
  const [tick, setTick] = useState(0);
  // null so the very first mount also plays the flap-in animation,
  // not just subsequent value changes.
  const prevTarget = useRef<string | null>(null);

  useEffect(() => {
    if (prevTarget.current === target) return;
    prevTarget.current = target;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setTick(t => t + 1);
      if (count >= TICKS) {
        clearInterval(interval);
        setDisplay(target);
        return;
      }
      setDisplay(
        target
          .split('')
          .map(ch => (ch === ' ' ? ' ' : randomChar()))
          .join('')
      );
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [target]);

  return (
    <span
      className={cn('inline-block whitespace-nowrap', className)}
      style={{ fontVariantNumeric: 'tabular-nums' }}
      aria-label={text}
    >
      {display.split('').map((ch, i) => (
        <span
          key={`${i}-${tick}`}
          className='animate-flap mr-[2px] inline-block rounded-[2px] bg-neutral-900 text-center align-top font-mono text-neutral-50 last:mr-0'
          style={{
            height: `${cellHeightEm}em`,
            width: `${cellWidthEm}em`,
            lineHeight: `${cellHeightEm}em`,
          }}
          aria-hidden='true'
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
