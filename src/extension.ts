import * as vscode from 'vscode';
import { LiveServerPlusPlus } from './core/LiveServerPlusPlus';

export function activate(context: vscode.ExtensionContext) {
  const liveServerPlusPlus = new LiveServerPlusPlus();

  const disposable = vscode.commands.registerCommand(
    'extension.live-server-plus-plus.open',
    () => {
      liveServerPlusPlus.goLive();
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
