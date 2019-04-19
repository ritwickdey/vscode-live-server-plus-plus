import open from 'open';
import { extensionConfig } from '../utils/extensionConfig';
import {
  ILiveServerPlusPlusService,
  ILiveServerPlusPlus,
  GoLiveEvent,
  ServerErrorEvent
} from '../../core/types';
import { workspaceUtils } from '../utils/workSpaceUtils';
import { getNormalizedBrowserName } from '../utils/getNormalizedBrowserName';
import { isInjectableFile } from '../../core/utils';
import { urlJoin } from '../utils/urlJoin';

export class BrowserService implements ILiveServerPlusPlusService {
  constructor(private liveServerPlusPlus: ILiveServerPlusPlus) {}

  register() {
    this.liveServerPlusPlus.onDidGoLive(this.openInBrowser.bind(this));
    this.liveServerPlusPlus.onServerError(this.openIfServerIsAlreadyRunning.bind(this));
  }

  private openInBrowser(event: GoLiveEvent) {
    const host = '127.0.0.1';
    const port = event.LSPP.port;
    const pathname = this.getPathname();
    const protocol = 'http:';
    const browserName = extensionConfig.browser.get();
    if (!browserName) return;

    const openParams: string[] = [];

    if (browserName !== 'default') {
      openParams.push(getNormalizedBrowserName(browserName));
    }

    open(`${protocol}//${host}:${port}${pathname}`, { app: openParams });
  }

  private getPathname() {
    const activeDoc = workspaceUtils.getActiveDoc();
    if (!activeDoc || !isInjectableFile(activeDoc)) return '/';
    return urlJoin('/', activeDoc);
  }

  private openIfServerIsAlreadyRunning(event: ServerErrorEvent) {
    if (event.code === 'serverIsAlreadyRunning') {
      this.openInBrowser(event);
    }
  }
}
