import * as vscode from 'vscode';
import { LiveServerPlusPlus } from '../core/LiveServerPlusPlus';
import { NotificationService } from './services/NotificationService';
import { fileSelector, setMIME } from './middlewares';
import { ILiveServerPlusPlusConfig } from '../core/types';
import { extensionConfig } from './utils/extensionConfig';
import { BrowserService } from './services/BrowserService';
import { workspaceUtils } from './utils/workSpaceUtils';

export function activate(context: vscode.ExtensionContext) {
  const liveServerPlusPlus = new LiveServerPlusPlus(getLSPPConfig());

  liveServerPlusPlus.useMiddleware(fileSelector, setMIME);
  liveServerPlusPlus.useService(NotificationService, BrowserService);

  const openServer = vscode.commands.registerCommand(getCmdWithPrefix('open'), () => {
    liveServerPlusPlus.reloadConfig(getLSPPConfig());
    liveServerPlusPlus.goLive();
  });

  const closeerver = vscode.commands.registerCommand(getCmdWithPrefix('close'), () => {
    liveServerPlusPlus.shutdown();
  });

  context.subscriptions.push(openServer);
  context.subscriptions.push(closeerver);
}

export function deactivate() {}

function getCmdWithPrefix(commandName: string) {
  return `extension.live-server++.${commandName}`;
}


function getLSPPConfig(): ILiveServerPlusPlusConfig {
  const LSPPconfig: ILiveServerPlusPlusConfig = { cwd: workspaceUtils.cwd! };
  LSPPconfig.port = extensionConfig.port.get();
  LSPPconfig.subpath = extensionConfig.root.get();
  LSPPconfig.debounceTimeout = extensionConfig.timeout.get();
  return LSPPconfig;
}