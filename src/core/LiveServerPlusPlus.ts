import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';
import { WorkspaceUtils } from './WorkSpaceUtils';
import { readFile } from './FileSystem';

export class LiveServerPlusPlus {
  workspace: WorkspaceUtils;

  constructor() {
    this.workspace = new WorkspaceUtils();
    this.routesHandler = this.routesHandler.bind(this);
  }

  async goLive() {
    await this.createServer();
    console.log('Server is created');
  }

  private createServer() {
    return new Promise(resolve => {
      const server = http.createServer(this.routesHandler);
      server.listen(9000, () => {
        resolve();
      });
    });
  }

  private async routesHandler(req: IncomingMessage, res: ServerResponse) {
    const reqUrl = this.getReqFileUrl(req);
    const cwd = this.workspace.cwd;
    if (!cwd) {
      res.end('Root Path is missing');
    }
    const filePath = path.join(cwd!, reqUrl);
    try {
      const fileData = await readFile(filePath);
      res.end(fileData);
    } catch (err) {
      console.error('ERROR ', err);
      res.statusCode = err.code === 'ENOENT' ? 404 : 500;
      return res.end();
    }
  }

  private getReqFileUrl(req: IncomingMessage): string {
    if (!req.url) {
      return req.url + '/index.html';
    }

    if (req.url.endsWith('/')) {
      return req.url + 'index.html';
    }

    return req.url;
  }
}
