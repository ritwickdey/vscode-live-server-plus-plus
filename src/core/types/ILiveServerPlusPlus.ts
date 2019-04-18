import { Event } from 'vscode';

export interface GoLiveEvent {
  readonly port: number;
  readonly pathUri?: string;
}

export interface GoOfflineEvent {
  readonly port: number;
}

type ServerErrorCodes =
  | 'serverIsAlreadyRunning'
  | 'portAlreadyInUse'
  | 'serverIsNotRunning';

export interface ServerErrorEvent {
  readonly message: string;
  readonly code: ServerErrorCodes;
}

export interface ILiveServerPlusPlus {
  readonly port: number;
  readonly onDidGoLive: Event<GoLiveEvent>;
  readonly onDidGoOffline: Event<GoOfflineEvent>;
  readonly onServerError: Event<ServerErrorEvent>;
}

export interface ILiveServerPlusPlusService {
  register(): void;
}

export interface ILiveServerPlusPlusServiceCtor {
  new (liveServerPlusPlus: ILiveServerPlusPlus): ILiveServerPlusPlusService;
}

export interface ILiveServerPlusPlusConfig {
  port?: number;
  subpath?: string;
  debounceTimeout?: number;
}
