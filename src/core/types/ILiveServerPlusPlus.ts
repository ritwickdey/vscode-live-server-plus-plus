import { Event } from 'vscode';

export interface GoLiveEvent {
  readonly port: number;
  readonly pathUri?: string;
}

export interface GoOfflineEvent {
  readonly port: number;
}

export interface ServerStartError {
  readonly port: number;
}

export interface ServerStopError {
  readonly port: number;
}

export interface ILiveServerPlusPlus {
  readonly port: number;
  readonly onDidGoLive: Event<GoLiveEvent>;
  readonly onDidGoOffline: Event<GoOfflineEvent>;
  readonly onServerStartError: Event<ServerStartError>;
  readonly onServerStopError: Event<ServerStopError>;
}
