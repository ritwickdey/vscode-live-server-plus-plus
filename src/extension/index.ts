import * as vscode from 'vscode';
import { LiveServerPlusPlus } from '../core/LiveServerPlusPlus';
import { NotificationService } from './services/NotificationService';
import { fileSelector, setMIME } from './middlewares';
import { ILiveServerPlusPlusConfig } from '../core/types';
import { extensionConfig } from './extensionConfig';

function getLiveServerPlusPlusConfig(): ILiveServerPlusPlusConfig {
  const config: ILiveServerPlusPlusConfig = {};
  config.port = extensionConfig.port.get();
  config.subpath = extensionConfig.root.get();
  config.debounceTimeout = extensionConfig.timeout.get();
  return config;
}

export function activate(context: vscode.ExtensionContext) {
  const liveServerPlusPlus = new LiveServerPlusPlus();

  liveServerPlusPlus.useMiddleware(fileSelector, setMIME);
  liveServerPlusPlus.useService(NotificationService);

  const openServer = vscode.commands.registerCommand(getCommandWithPrefix('open'), () => {
    liveServerPlusPlus.reloadConfig(getLiveServerPlusPlusConfig());
    liveServerPlusPlus.goLive();
  });

  const closeServer = vscode.commands.registerCommand(
    getCommandWithPrefix('close'),
    () => {
      liveServerPlusPlus.shutdown();
    }
  );

  context.subscriptions.push(openServer);
  context.subscriptions.push(closeServer);
}

export function deactivate() {}

function getCommandWithPrefix(commandName: string) {
  return `extension.live-server++.${commandName}`;
}
