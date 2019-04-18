import { Event } from 'vscode';
import { LiveServerPlusPlus } from '../LiveServerPlusPlus';

export interface GoLiveEvent {
  readonly port: number;
  readonly pathUri?: string;
}

export interface GoOfflineEvent {
  readonly port: number;
}

export interface ServerError {
  readonly message: string;
}


export interface ILiveServerPlusPlus {
  readonly port: number;
  readonly onDidGoLive: Event<GoLiveEvent>;
  readonly onDidGoOffline: Event<GoOfflineEvent>;
  readonly onServerError: Event<ServerError>;
}

export interface ILiveServerPlusPlusService {
  register(): void;
}
export interface ILiveServerPlusPlusServiceCtor {
  new (liveServerPlusPlus: ILiveServerPlusPlus): ILiveServerPlusPlusService;
}
