import * as vscode from 'vscode';
import * as http from 'http';
import * as WebSocket from 'ws';
import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';
import { WorkspaceUtils } from './WorkSpaceUtils';
import { readFileStream } from './FileSystem';

export class LiveServerPlusPlus {
  private workspace: WorkspaceUtils;
  private server: http.Server;
  private ws: WebSocket.Server;
  private port: number;
  private debounceTimeout: number;

  constructor({ port = 9000, subpath = '/', debounceTimeout = 500 } =  {}) {
    this.server = http.createServer(this.routesHandler.bind(this));
    this.ws = new WebSocket.Server({ noServer: true });
    this.workspace = new WorkspaceUtils(subpath);
    this.port = port;
    this.debounceTimeout = debounceTimeout;
  }

  async goLive() {
    await this.listenServer();
    console.log('Server is created');
    this.registerOnChangeReload();
  }

  private registerOnChangeReload() {
    let timeout: NodeJS.Timeout;
    vscode.workspace.onDidChangeTextDocument(event => {
      //debouncing
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.broadcastWs({
          fileName: event.document.fileName
        });
      }, this.debounceTimeout);
    });
  }

  private listenServer() {
    return new Promise(resolve => {
      this.listenWs();
      this.server.listen(this.port, () => {
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
      ws.send(JSON.stringify({ action: 'Connected!' }));
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

    const fileDataStream = readFileStream(filePath);

    fileDataStream.pipe(res);

    fileDataStream.on('error', err => {
      console.error('ERROR ', err);
      res.statusCode = err.code === 'ENOENT' ? 404 : 500;
      return res.end();
    });
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
