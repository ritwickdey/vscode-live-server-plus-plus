import path from 'path';
export const urlJoin = (...paths: string[]): string => {
  return path.join(...paths).replace(/\\/g, '/');
};
