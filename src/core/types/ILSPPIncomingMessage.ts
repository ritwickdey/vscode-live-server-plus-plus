import { IncomingMessage } from 'http';

export interface ILSPPIncomingMessage extends IncomingMessage {
  file?: string;
  contentType?: string;
}
