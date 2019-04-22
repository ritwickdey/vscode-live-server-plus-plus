import { ServerResponse } from 'http';
import { ILSPPIncomingMessage } from '../../core/types';
import { contentType } from 'mime-types';
import * as path from 'path';

export const setMIME = (req: ILSPPIncomingMessage, res: ServerResponse) => {
  const extname = path.extname(req.file!);

  req.contentType = String(contentType(extname));
  res.setHeader('content-type', String(contentType(extname)));
};
