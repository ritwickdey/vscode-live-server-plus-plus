import { Event } from 'vscode';
import { ReloadingStrategy } from '../../extension/utils/extensionConfig';

export type LSPPServerErrorCodes =
  | 'serverIsAlreadyRunning'
  | 'portAlreadyInUse'
  | 'serverIsNotRunning'
  | 'cwdUndefined';

export interface ILiveServerPlusPlus {
  readonly onDidGoLive: Event<GoLiveEvent>;
  readonly onDidGoOffline: Event<GoOfflineEvent>;
  readonly onServerError: Event<ServerErrorEvent>;
  readonly port: number;
  readonly pathUri?: string;
}

export interface LSPPEvent {
  readonly LSPP: ILiveServerPlusPlus;
}

export interface GoLiveEvent extends LSPPEvent {}

export interface GoOfflineEvent extends LSPPEvent {}

export interface ServerErrorEvent extends LSPPEvent {
  readonly message: string;
  readonly code: LSPPServerErrorCodes;
}

export interface ILiveServerPlusPlusService {
  register(): void;
}

export interface ILiveServerPlusPlusServiceCtor {
  new (liveServerPlusPlus: ILiveServerPlusPlus): ILiveServerPlusPlusService;
}

export interface ILiveServerPlusPlusConfig {
  cwd: string;
  port?: number;
  subpath?: string;
  debounceTimeout?: number;
  indexFile?: string;
  reloadingStrategy?: ReloadingStrategy;
}
