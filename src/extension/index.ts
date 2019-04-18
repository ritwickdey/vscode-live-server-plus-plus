import * as vscode from 'vscode';
import { LiveServerPlusPlus } from '../core/LiveServerPlusPlus';
import { NotificationService } from './services/NotificationService';
import { fileSelector, setMIME } from './middlewares';
import { ILiveServerPlusPlusConfig } from '../core/types';
import { extensionConfig } from './extensionConfig';
import { BrowserService } from './services/BrowserService';
import { WorkspaceUtils } from '../core/WorkSpaceUtils';

function getLSPPConfig(config: WorkspaceUtils): ILiveServerPlusPlusConfig {
  const LSPPconfig: ILiveServerPlusPlusConfig = {
    cwd: config.cwd!
  };
  LSPPconfig.port = extensionConfig.port.get();
  LSPPconfig.subpath = extensionConfig.root.get();
  LSPPconfig.debounceTimeout = extensionConfig.timeout.get();
  return LSPPconfig;
}

export function activate(context: vscode.ExtensionContext) {
  const workspaceUtils = new WorkspaceUtils();
  const liveServerPlusPlus = new LiveServerPlusPlus(getLSPPConfig(workspaceUtils));

  liveServerPlusPlus.useMiddleware(fileSelector, setMIME);
  liveServerPlusPlus.useService(NotificationService, BrowserService);

  const openServer = vscode.commands.registerCommand(getCommandWithPrefix('open'), () => {
    workspaceUtils.reloadConfig({ subroot: extensionConfig.root.get() });
    liveServerPlusPlus.reloadConfig(getLSPPConfig(workspaceUtils));
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
