import { ILiveServerPlusPlusService, ILiveServerPlusPlus } from '../../core/types';

export class BrowserService implements ILiveServerPlusPlusService {
  constructor(private liveServerPlusPlus: ILiveServerPlusPlus) {}

  register() {
    this.liveServerPlusPlus.onDidGoLive(this.openInBrowser.bind(this));
  }

  private openInBrowser() {
    console.log('Open in Browser');
  }
}
