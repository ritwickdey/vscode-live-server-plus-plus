import { ServerResponse } from 'http';
import path from 'path';
import * as url from 'url';
import { ILSPPIncomingMessage } from '../../core/types';
import { extensionConfig } from '../utils/extensionConfig';

const LIVE_SERVER_ASSETS = path.join(__dirname, '../../core/assets');

export const fileSelector = (req: ILSPPIncomingMessage, res: ServerResponse) => {
  let fileUrl = getReqFileUrl(req);

  if (fileUrl.startsWith('/_live-server_/')) {
    fileUrl = path.join(LIVE_SERVER_ASSETS, fileUrl.replace('/_live-server_/', ''));
    res.setHeader('cache-control', 'public, max-age=30672000');
  } else if (fileUrl.startsWith('/')) {
    fileUrl = `.${fileUrl}`;
  }

  req.file = fileUrl;
};

function getReqFileUrl(req: ILSPPIncomingMessage): string {
  const { pathname = '/' } = url.parse(req.url || '/');

  if (!path.extname(pathname)) {
    //TODO: THIS NEED TO FIX. WE HAVE TO LOOK INTO DISK
    return `.${path.join(pathname, extensionConfig.indexFile.get())}`;
  }
  return pathname;
}
