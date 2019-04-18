import * as vscode from 'vscode';
import { LiveServerPlusPlus } from '../core/LiveServerPlusPlus';
import { NotificationService } from './services/NotificationService';
import { fileSelector, setMIME } from './middlewares';
import { ILiveServerPlusPlusConfig } from '../core/types';
import { extensionConfig } from './utils/extensionConfig';
import { BrowserService } from './services/BrowserService';
import { workspaceUtils } from './utils/workSpaceUtils';

function getLSPPConfig(): ILiveServerPlusPlusConfig {
  const LSPPconfig: ILiveServerPlusPlusConfig = { cwd: workspaceUtils.cwd! };
  LSPPconfig.port = extensionConfig.port.get();
  LSPPconfig.subpath = extensionConfig.root.get();
  LSPPconfig.debounceTimeout = extensionConfig.timeout.get();
  return LSPPconfig;
}

export function activate(context: vscode.ExtensionContext) {
  const liveServerPlusPlus = new LiveServerPlusPlus(getLSPPConfig());
  
  liveServerPlusPlus.useMiddleware(fileSelector, setMIME);
  liveServerPlusPlus.useService(NotificationService, BrowserService);

  const openServer = vscode.commands.registerCommand(getCommandWithPrefix('open'), () => {
    liveServerPlusPlus.reloadConfig(getLSPPConfig());
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
