import * as vscode from 'vscode';
import { LiveServerPlusPlus } from '../core/LiveServerPlusPlus';

export function activate(context: vscode.ExtensionContext) {
  const liveServerPlusPlus = new LiveServerPlusPlus();

  const openServer = vscode.commands.registerCommand(
    'extension.live-server-plus-plus.open',
    () => {
      liveServerPlusPlus.goLive();
    }
  );

  const closeServer = vscode.commands.registerCommand(
    'extension.live-server-plus-plus.close',
    () => {
      liveServerPlusPlus.shutdown();
    }
  );

  context.subscriptions.push(openServer);
  context.subscriptions.push(closeServer);
}

export function deactivate() {}
