'use strict';

import { workspace } from 'vscode';

export type IBrowserList = 'default' | 'chrome' | 'firefox' | 'microsoft-edge' | null;
export type ReloadingStrategy = 'hot' | 'partial-reload' | 'reload';

export const extensionConfig = {
  port: {
    get: () => getSettings<number>('port'),
    set: (portNo: number) => setSettings('port', portNo)
  },
  browser: {
    get: () => getSettings<IBrowserList>('browser'),
    set: (value: IBrowserList) => setSettings('browser', value)
  },
  root: {
    get: () => getSettings<string>('root') || '/',
    set: (value: string) => setSettings('root', value)
  },
  timeout: {
    get: () => getSettings<number>('timeout'),
    set: (value: number) => setSettings('timeout', value)
  },
  indexFile: {
    get: () => getSettings<string>('indexFile'),
    set: (value: string) => setSettings('indexFile', value)
  },
  reloadingStrategy: {
    get: () => getSettings<ReloadingStrategy>('reloadingStrategy'),
    set: (value: ReloadingStrategy) => setSettings('reloadingStrategy', value)
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
