import * as fs from 'fs';
import * as path from 'path';

export const INJECTED_TEXT = fs.readFileSync(
  path.join(__dirname, '../assets/inject.html'),
  {
    encoding: 'utf-8'
  }
);
