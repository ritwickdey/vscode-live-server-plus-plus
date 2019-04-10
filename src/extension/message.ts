import {
  ILiveServerPlusPlus,
  GoLiveEvent,
  GoOfflineEvent
} from '../core/types/ILiveServerPlusPlus';
import { window } from 'vscode';

export class Message {
  constructor(private liveServerPlusPlus: ILiveServerPlusPlus) {
      this.init = this.init.bind(this);
      this.showLSPPOpened = this.showLSPPOpened.bind(this);
      this.showLSPPClosed = this.showLSPPClosed.bind(this);
      this.showPopUpMsg = this.showPopUpMsg.bind(this);
  }

  init() {
    this.liveServerPlusPlus.onDidGoLive(this.showLSPPOpened);
    this.liveServerPlusPlus.onDidGoOffline(this.showLSPPClosed);
  }

  private showLSPPOpened(event: GoLiveEvent) {
    this.showPopUpMsg(`Server is started at ${event.port}`);
  }
  private showLSPPClosed(event: GoOfflineEvent) {
    this.showPopUpMsg(`Server is closed`);
  }

  private showPopUpMsg(
    msg: string,
    { msgType = 'info' }: { msgType?: 'info' | 'error' | 'warn' } = {} as any
  ) {
    if (msgType === 'error') {
      return window.showErrorMessage(msg);
    }
    if (msgType === 'info') {
      return window.showInformationMessage(msg);
    }
    if (msgType === 'warn') {
      return window.showWarningMessage(msg);
    }
  }
}
