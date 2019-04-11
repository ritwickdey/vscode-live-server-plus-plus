'use strict';

import { workspace } from 'vscode';

type IBrowserList = 'default' | 'chrome' | 'firefox' | 'microsoft-edge' | null;

export const config = {
  port: {
    get: () => getSettings<number>('port'),
    set: (portNo: number) => setSettings('port', portNo)
  },
  browser: {
    get: () => getSettings<IBrowserList>('browser'),
    set: (value: IBrowserList) => setSettings('browser', value)
  },
  root: {
    get: () => getSettings<string>('root'),
    set: (value: string) => setSettings('root', value)
  }
};

function getSettings<T = any>(settingsName: string) {
  return workspace.getConfiguration('liveServer++').get(settingsName) as T;
}
function setSettings<T = any>(settingsName: string, settingsValue: T, isGlobal = false) {
  return workspace
    .getConfiguration('liveServer++')
    .update(settingsName, settingsValue, isGlobal);
}
