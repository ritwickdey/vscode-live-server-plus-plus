import {
  ILiveServerPlusPlus,
  GoLiveEvent,
  GoOfflineEvent,
  ILiveServerPlusPlusService
} from '../../core/types/ILiveServerPlusPlus';
import { window } from 'vscode';

export class NotificationService implements ILiveServerPlusPlusService {
  constructor(private liveServerPlusPlus: ILiveServerPlusPlus) {}

  register() {
    this.liveServerPlusPlus.onDidGoLive(this.showLSPPOpened.bind(this));
    this.liveServerPlusPlus.onDidGoOffline(this.showLSPPClosed.bind(this));
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
