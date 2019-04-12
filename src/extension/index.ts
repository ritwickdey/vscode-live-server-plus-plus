import * as vscode from 'vscode';
import { LiveServerPlusPlus } from '../core/LiveServerPlusPlus';
import { NotificationService } from './services/NotificationService';
import { fileSelector, setMIME } from './middlewares';

export function activate(context: vscode.ExtensionContext) {
  const liveServerPlusPlus = new LiveServerPlusPlus();

  liveServerPlusPlus.useMiddleware(fileSelector, setMIME);
  liveServerPlusPlus.useService(NotificationService);

  const openServer = vscode.commands.registerCommand(withPrefix('open'), () => {
    liveServerPlusPlus.goLive();
  });

  const closeServer = vscode.commands.registerCommand(
    withPrefix('close'),
    () => {
      liveServerPlusPlus.shutdown();
    }
  );

  context.subscriptions.push(openServer);
  context.subscriptions.push(closeServer);
}

export function deactivate() {}

function withPrefix(commandName: string) {
  return `extension.live-server++.${commandName}`;
}
