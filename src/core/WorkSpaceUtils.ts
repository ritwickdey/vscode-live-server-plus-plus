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

  get activeDoc() {
    const { activeTextEditor } = vscode.window;
    if (!this.activeWorkspace || !activeTextEditor) return null;

    const activeDocUrl = activeTextEditor.document.uri.fsPath;
    const workspaceUrl = this.activeWorkspace.uri.fsPath;
    const isParentPath = this.isParent(workspaceUrl).of(activeDocUrl);

    if (!isParentPath) return null;

    return activeDocUrl;
  }

  get cwd() {
    const workspace = this.activeWorkspace;
    if (workspace) {
      return path.join(workspace.uri.fsPath, this.subroot);
    }
    return null;
  }

  reloadConfig({ subroot = '/' }) {
    this.subroot = subroot;
  }

  private isParent(parentPath: string) {
    return {
      of: (childPath: string) => {
        return childPath.startsWith(parentPath);
      }
    };
  }
}
