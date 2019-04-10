import * as path from 'path';

export { INJECTED_TEXT } from './injectedText';

/**
 * Live Server++ only do dirty read if it's supported
 */

export const SUPPORTED_FILES = ['.js', '.html', '.css'];

/**
 * Live Server++ will inject extra js code.
 */
export const INJECTABLE_FILES = ['.html'];

export const isInjectableFile = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  return INJECTABLE_FILES.includes(ext);
};

export const isSupportedFile = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_FILES.includes(ext);
};
