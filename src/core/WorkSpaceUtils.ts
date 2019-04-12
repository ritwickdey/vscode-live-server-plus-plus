import * as vscode from 'vscode';
import * as path from 'path';

export class WorkspaceUtils {
  constructor(private subroot = '/') {}

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
      return path.join(workspace.uri.fsPath, this.subroot);
    }
    return null;
  }
}
