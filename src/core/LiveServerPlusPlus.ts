import * as vscode from 'vscode';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as path from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import { readFileStream } from './FileSystem';
import { INJECTED_TEXT, isInjectableFile } from './utils';
import {
  ILiveServerPlusPlus,
  GoOfflineEvent,
  GoLiveEvent,
  ServerErrorEvent,
  IMiddlewareTypes,
  ILiveServerPlusPlusServiceCtor,
  ILSPPIncomingMessage,
  ILiveServerPlusPlusConfig
} from './types';
import { LSPPError } from './LSPPError';
import { urlJoin } from '../extension/utils/urlJoin';

export class LiveServerPlusPlus implements ILiveServerPlusPlus {
  port!: number;
  private cwd: string | undefined;
  private server: http.Server | undefined;
  private ws: WebSocket.Server | undefined;
  private debounceTimeout!: number;
  private goLiveEvent: vscode.EventEmitter<GoLiveEvent>;
  private goOfflineEvent: vscode.EventEmitter<GoOfflineEvent>;
  private serverErrorEvent: vscode.EventEmitter<ServerErrorEvent>;
  private middlewares: IMiddlewareTypes[] = [];

  constructor(config: ILiveServerPlusPlusConfig) {
    this.init(config);
    this.goLiveEvent = new vscode.EventEmitter();
    this.goOfflineEvent = new vscode.EventEmitter();
    this.serverErrorEvent = new vscode.EventEmitter();
  }

  get onDidGoLive() {
    return this.goLiveEvent.event;
  }

  get onDidGoOffline() {
    return this.goOfflineEvent.event;
  }

  get onServerError() {
    return this.serverErrorEvent.event;
  }

  get isServerRunning() {
    return this.server ? this.server!.listening : false;
  }

  reloadConfig(config: ILiveServerPlusPlusConfig) {
    this.init(config);
  }

  async goLive() {
    if (this.isServerRunning) {
      return this.serverErrorEvent.fire({
        LSPP: this,
        code: 'serverIsAlreadyRunning',
        message: 'Server is already running'
      });
    }
    try {
      await this.listenServer();
      this.registerOnChangeReload();
      this.goLiveEvent.fire({ LSPP: this });
    } catch (error) {
      if (error.code === 'EADDRINUSE') {
        return this.serverErrorEvent.fire({
          LSPP: this,
          code: 'portAlreadyInUse',
          message: `${this.port} is already in use!`
        });
      }

      return this.serverErrorEvent.fire({
        LSPP: this,
        code: error.code,
        message: error.message
      });
    }
  }

  async shutdown() {
    if (!this.isServerRunning) {
      return this.serverErrorEvent.fire({
        LSPP: this,
        code: 'serverIsNotRunning',
        message: 'Server is not running'
      });
    }
    await this.closeWs();
    await this.closeServer();
    this.goOfflineEvent.fire({ LSPP: this });
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

  private init(config: ILiveServerPlusPlusConfig) {
    this.cwd = config.cwd;
    this.port = config.port || 9000;
    this.debounceTimeout = config.debounceTimeout || 400;
  }

  private registerOnChangeReload() {
    let timeout: NodeJS.Timeout;
    vscode.workspace.onDidChangeTextDocument(event => {
      //debouncing
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const fileName = event.document.fileName;
        const extName = path.extname(fileName);
        const filePathFromRoot = urlJoin(fileName.replace(this.cwd!, '')); // bit tricky. This will change Windows's \ to /
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
    return new Promise((resolve, reject) => {
      if (!this.cwd) {
        const error = new LSPPError('CWD is not defined', 'cwdUndefined');
        return reject(error);
      }

      this.server = http.createServer(this.routesHandler.bind(this));

      const onPortError = reject;
      this.server.on('error', onPortError);

      this.attachWSListeners();
      this.server.listen(this.port, () => {
        this.server!.removeListener('error', onPortError);
        resolve();
      });
    });
  }

  private closeServer() {
    return new Promise((resolve, reject) => {
      this.server!.close(err => {
        return err ? reject(err) : resolve();
      });
      this.server!.emit('close');
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
    if (!this.server) throw new Error('Server is not defined');

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

  private routesHandler(req: ILSPPIncomingMessage, res: ServerResponse) {
    const cwd = this.cwd;

    this.applyMiddlware(req, res);
    const file = req.file;

    if (!cwd) {
      res.end('Root Path is missing');
    }
    const filePath = path.join(cwd!, file!);

    const fileStream = readFileStream(filePath);

    let isFirstTime = true;
    // res.write(isInjectableFile(filePath) ? INJECTED_TEXT : null);
    fileStream
      .on('data', data => {
        if (isFirstTime)
          res.write(isInjectableFile(filePath) ? INJECTED_TEXT : null);
        res.write(data);
        isFirstTime = false;
      })
      .on('close', () => {
        res.end();
      });

    fileStream.on('error', err => {
      console.error('ERROR ', err);
      res.statusCode = err.code === 'ENOENT' ? 404 : 500;
      return res.end(null);
    });
  }
}
