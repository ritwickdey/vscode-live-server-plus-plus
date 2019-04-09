import * as vscode from 'vscode';

export class WorkspaceUtils {
  get activeWorkspace() {
    const workspaces = vscode.workspace.workspaceFolders;
    if (workspaces && workspaces.length) {
      return workspaces[0];
    }
    return null;
  }
  get cwd() {
    const workspace = this.activeWorkspace;
    if (workspace) {
      return workspace.uri.fsPath;
    }
    return null;
  }
}
