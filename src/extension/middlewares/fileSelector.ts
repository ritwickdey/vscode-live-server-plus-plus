import { ServerResponse } from 'http';
import * as url from 'url';
import { ILSPPIncomingMessage } from '../../core/types';

export const fileSelector = (
  req: ILSPPIncomingMessage,
  res: ServerResponse
) => {
  const file = getReqFileUrl(req);
  req.file = file;
};

function getReqFileUrl(req: ILSPPIncomingMessage): string {
  const { pathname } = url.parse(req.url || '/');

  if (!pathname || pathname === '/') {
    return '/index.html';
  }
  return pathname;
}
