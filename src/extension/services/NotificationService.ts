import {
  ILiveServerPlusPlus,
  GoLiveEvent,
  GoOfflineEvent,
  ILiveServerPlusPlusService,
  ServerErrorEvent
} from '../../core/types/ILiveServerPlusPlus';
import { showPopUpMsg } from '../utils/showPopUpMsg';

export class NotificationService implements ILiveServerPlusPlusService {
  constructor(private liveServerPlusPlus: ILiveServerPlusPlus) {}

  register() {
    this.liveServerPlusPlus.onDidGoLive(this.showLSPPOpened.bind(this));
    this.liveServerPlusPlus.onDidGoOffline(this.showLSPPClosed.bind(this));
    this.liveServerPlusPlus.onServerError(this.showServerErrorMsg.bind(this));
  }

  private showLSPPOpened(event: GoLiveEvent) {
    showPopUpMsg(`Server is started at ${event.LSPP.port}`);
  }
  private showLSPPClosed(event: GoOfflineEvent) {
    showPopUpMsg(`Server is closed`);
  }

  private showServerErrorMsg(event: ServerErrorEvent) {
    if (event.code === 'serverIsAlreadyRunning') {
      //shhhh! keep silent. bcz we'll open the browser with running port :D
      return;
    }
    if (event.code === 'cwdUndefined') {
      return showPopUpMsg('Please open a workspace', { msgType: 'error' });
    }
    showPopUpMsg(event.message || 'Something went wrong', { msgType: 'error' });
  }
}
