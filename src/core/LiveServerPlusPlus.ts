import * as vscode from 'vscode';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';
import { WorkspaceUtils } from './WorkSpaceUtils';
import { readFileStream } from './FileSystem';
import { INJECTED_TEXT, isInjectableFile } from './utils';
import { AddressInfo } from 'net';
import {
  ILiveServerPlusPlus,
  GoOfflineEvent,
  GoLiveEvent,
  ServerStartError,
  ServerStopError,
  IMiddlewareTypes,
  ILiveServerPlusPlusServiceCtor
} from './types';

export class LiveServerPlusPlus implements ILiveServerPlusPlus {
  port: number;
  private workspace: WorkspaceUtils;
  private server: http.Server | undefined;
  private ws: WebSocket.Server | undefined;
  private debounceTimeout: number;
  private goLiveEvent: vscode.EventEmitter<GoLiveEvent>;
  private goOfflineEvent: vscode.EventEmitter<GoOfflineEvent>;
  private serverStopErrorEvent: vscode.EventEmitter<ServerStopError>;
  private serverStartErrorEvent: vscode.EventEmitter<ServerStartError>;
  private middlewares: IMiddlewareTypes[] = [];

  constructor({ port = 9000, subpath = '/', debounceTimeout = 500 } = {}) {
    this.workspace = new WorkspaceUtils(subpath);
    this.port = port;
    this.debounceTimeout = debounceTimeout;
    this.goLiveEvent = new vscode.EventEmitter();
    this.goOfflineEvent = new vscode.EventEmitter();

    this.serverStartErrorEvent = new vscode.EventEmitter();
    this.serverStopErrorEvent = new vscode.EventEmitter();
  }

  get onDidGoLive() {
    return this.goLiveEvent.event;
  }

  get onDidGoOffline() {
    return this.goOfflineEvent.event;
  }

  get onServerStartError() {
    return this.serverStartErrorEvent.event;
  }

  get onServerStopError() {
    return this.serverStopErrorEvent.event;
  }

  async goLive() {
    await this.listenServer();
    this.registerOnChangeReload();
    this.goLiveEvent.fire({
      pathUri: '/',
      port: (this.server!.address() as AddressInfo).port
    });
  }

  async shutdown() {
    await this.closeWs();
    await this.closeServer();
    this.goOfflineEvent.fire({ port: this.port });
  }

  useMiddleware(...fns: IMiddlewareTypes[]) {
    fns.forEach(fn => this.middlewares.push(fn));
  }

  useService(...fns: ILiveServerPlusPlusServiceCtor[]) {
    fns.forEach(fn => {
      const instance = new fn(this);
      instance.register.call(instance);
    });
  }

  private registerOnChangeReload() {
    let timeout: NodeJS.Timeout;
    vscode.workspace.onDidChangeTextDocument(event => {
      //debouncing
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const fileName = event.document.fileName;
        const extName = path.extname(fileName);
        const filePathFromRoot = fileName.replace(this.workspace.cwd!, '');
        this.broadcastWs(
          {
            dom: extName === '.html' ? event.document.getText() : undefined,
            fileName: filePathFromRoot
          },
          extName === '.css' ? 'refreshcss' : 'reload'
        );
      }, this.debounceTimeout);
    });
  }

  private listenServer() {
    return new Promise(resolve => {
      this.server = http.createServer(this.routesHandler.bind(this));
      this.attachWSListeners();
      this.server.listen(this.port, () => {
        resolve();
      });
    });
  }

  private closeServer() {
    return new Promise((resolve, reject) => {
      this.server!.close(err => (err ? reject(err) : resolve()));
    });
  }

  private closeWs() {
    return new Promise((resolve, reject) => {
      if (!this.ws) return resolve();
      this.ws.close(err => (err ? reject(err) : resolve()));
    });
  }

  private broadcastWs(data: any, action = 'reload') {
    if (!this.ws) return;

    this.ws.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ data, action }));
      }
    });
  }

  private attachWSListeners() {
    if (!this.server) return;

    this.ws = new WebSocket.Server({ noServer: true });

    this.ws.on('connection', ws => {
      ws.send(JSON.stringify({ action: 'connected' }));
    });

    this.ws.on('close', () => {
      console.log('disconnected');
    });

    this.server.on('upgrade', (request, socket, head) => {
      if (request.url === '/_ws') {
        this.ws!.handleUpgrade(request, socket, head, ws => {
          this.ws!.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }

  private applyMiddlware(req: IncomingMessage, res: ServerResponse) {
    this.middlewares.forEach(middleware => {
      middleware(req, res);
    });
  }

  private routesHandler(req: IncomingMessage, res: ServerResponse) {
    this.applyMiddlware(req, res);
    const reqUrl = this.getReqFileUrl(req);
    const cwd = this.workspace.cwd;
    if (!cwd) {
      res.end('Root Path is missing');
    }
    const filePath = path.join(cwd!, reqUrl);

    const fileStream = readFileStream(filePath);

    fileStream
      .on('end', () => res.end(isInjectableFile(filePath) ? INJECTED_TEXT : null))
      .pipe(res);

    fileStream.on('error', err => {
      console.error('ERROR ', err);
      res.statusCode = err.code === 'ENOENT' ? 404 : 500;
      return res.end(null);
    });
  }

  private getReqFileUrl(req: IncomingMessage): string {
    const { pathname } = url.parse(req.url || '/');

    if (!pathname || pathname === '/') {
      return '/index.html';
    }
    return pathname;
  }
}
