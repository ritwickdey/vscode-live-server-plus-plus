import open from 'open';
import { extensionConfig } from '../utils/extensionConfig';
import {
  ILiveServerPlusPlusService,
  ILiveServerPlusPlus,
  GoLiveEvent
} from '../../core/types';
import { workspaceUtils } from '../utils/workSpaceUtils';

export class BrowserService implements ILiveServerPlusPlusService {
  constructor(private liveServerPlusPlus: ILiveServerPlusPlus) {}

  register() {
    this.liveServerPlusPlus.onDidGoLive(this.openInBrowser.bind(this));
  }

  private openInBrowser(event: GoLiveEvent) {
    const host = '127.0.0.1';
    const port = event.port;
    const pathname = workspaceUtils.getActiveDoc() || undefined;
    const protocol = 'http:';
    const browserName = extensionConfig.browser.get();
    if (!browserName) return;

    const openParams: string[] = [];

    // if (browserName === 'default') {
    // }

    open(`${protocol}//${host}:${port}/${pathname ? pathname : ''}`, { app: openParams });
  }

  // private openBrowser(port: number, path: string) {
  //   const host = Config.getLocalIp ? this.localIps : Config.getHost;
  //   const protocol = Config.getHttps.enable ? 'https' : 'http';

  //   let params: string[] = [];
  //   let advanceCustomBrowserCmd = Config.getAdvancedBrowserCmdline;
  //   if (path.startsWith('\\') || path.startsWith('/')) {
  //     path = path.substring(1, path.length);
  //   }
  //   path = path.replace(/\\/gi, '/');

  //   if (advanceCustomBrowserCmd) {
  //     advanceCustomBrowserCmd.split('--').forEach((command, index) => {
  //       if (command) {
  //         if (index !== 0) command = '--' + command;
  //         params.push(command.trim());
  //       }
  //     });
  //   } else {
  //     let CustomBrowser = Config.getCustomBrowser;
  //     let ChromeDebuggingAttachmentEnable = Config.getChromeDebuggingAttachment;

  //     if (CustomBrowser && CustomBrowser !== 'null' /*For backward capability*/) {
  //       let browserDetails = CustomBrowser.split(':');
  //       let browserName = browserDetails[0];
  //       params.push(browserName);

  //       if (browserDetails[1] && browserDetails[1] === 'PrivateMode') {
  //         if (browserName === 'chrome' || browserName === 'blisk')
  //           params.push('--incognito');
  //         else if (browserName === 'firefox') params.push('--private-window');
  //       }

  //       if (
  //         (browserName === 'chrome' || browserName === 'blisk') &&
  //         ChromeDebuggingAttachmentEnable
  //       ) {
  //         params.push(
  //           ...[
  //             '--new-window',
  //             '--no-default-browser-check',
  //             '--remote-debugging-port=9222',
  //             '--user-data-dir=' + __dirname
  //           ]
  //         );
  //       }
  //     }
  //   }

  //   if (params[0] && params[0] === 'chrome') {
  //     switch (process.platform) {
  //       case 'darwin':
  //         params[0] = 'google chrome';
  //         break;
  //       case 'linux':
  //         params[0] = 'google-chrome';
  //         break;
  //       case 'win32':
  //         params[0] = 'chrome';
  //         break;
  //       default:
  //         params[0] = 'chrome';
  //     }
  //   } else if (params[0] && params[0].startsWith('microsoft-edge')) {
  //     params[0] = `microsoft-edge:${protocol}://${host}:${port}/${path}`;
  //   }

  //   try {
  //     opn(`${protocol}://${host}:${port}/${path}`, { app: params || [''] });
  //   } catch (error) {
  //     this.showPopUpMsg(
  //       `Server is started at ${
  //         this.runningPort
  //       } but failed to open browser. Try to change the CustomBrowser settings.`,
  //       true
  //     );
  //     console.log('\n\nError Log to open Browser : ', error);
  //     console.log('\n\n');
  //   }
  // }
}
