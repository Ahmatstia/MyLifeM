import type { PropsWithChildren } from 'react';
import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import { colors } from '@/theme/colors';
import { space, stroke } from '@/theme/tokens';

const controls = `[role="button"], [role="tab"], [role="checkbox"], a[href], button`;
const interactionStyles = `
  html { background: ${colors.background}; }
  :is(${controls}, input, textarea, select):focus-visible {
    outline: ${stroke.selected}px solid ${colors.primary} !important;
    outline-offset: ${stroke.selected}px;
    box-shadow: 0 0 0 ${space[1]}px ${colors.surfaceContainerLowest};
  }
  @media (hover: hover) {
    :is(${controls}):not(:disabled, [aria-disabled="true"]):hover { filter: brightness(.96); }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0s !important;
      transition-duration: 0s !important;
      scroll-behavior: auto !important;
    }
  }
`;

export default function RootDocument({ children }: PropsWithChildren) {
  const { htmlAttributes, headNodes, bodyAttributes, bodyNodes } = useServerDocumentContext();
  return (
    <html {...htmlAttributes} lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <ScrollViewStyleReset />
        {headNodes}
        <style>{interactionStyles}</style>
      </head>
      <body {...bodyAttributes}>{children}{bodyNodes}</body>
    </html>
  );
}
