import { Cormorant_Garamond, Manrope } from 'next/font/google';

const display = Cormorant_Garamond({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

/* Goes on <html>: the tokens that read these variables are declared on :root. */
export const fontVariables = `${display.variable} ${body.variable}`;
