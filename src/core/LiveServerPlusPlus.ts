import * as vscode from 'vscode';
import * as http from 'http';
import * as WebSocket from 'ws';
import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';
import { WorkspaceUtils } from './WorkSpaceUtils';
import { readFile } from './FileSystem';
import { URL } from 'url';

export class LiveServerPlusPlus {
  workspace: WorkspaceUtils;
  server: http.Server;
  ws: WebSocket.Server;

  constructor() {
    this.server = http.createServer(this.routesHandler);
    this.ws = new WebSocket.Server({ noServer: true });
    this.workspace = new WorkspaceUtils();
    this.routesHandler = this.routesHandler.bind(this);
  }

  async goLive() {
    await this.listenServer();
    console.log('Server is created');
    this.registerOnChangeReload();
  }

  private registerOnChangeReload() {
    let timeout: NodeJS.Timeout;
    vscode.workspace.onDidChangeTextDocument(event => {
      //debounce 600ms
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.broadcastWs({
          fileName: event.document.fileName
        });
      }, 600);
    });
  }

  private listenServer() {
    return new Promise(resolve => {
      this.listenWs();
      this.server.listen(9000, () => {
        resolve();
      });
    });
  }

  private broadcastWs(data: any, action = 'reload') {
    this.ws.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ data, action }));
      }
    });
  }

  private listenWs() {
    this.ws.on('connection', ws => {
      ws.send('Connected!');
    });

    this.ws.on('close', () => {
      console.log('disconnected');
    });

    this.server.on('upgrade', (request, socket, head) => {
      if (request.url === '/_ws') {
        this.ws.handleUpgrade(request, socket, head, ws => {
          this.ws.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
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
