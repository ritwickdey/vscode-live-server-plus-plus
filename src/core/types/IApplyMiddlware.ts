import { IncomingMessage, ServerResponse } from 'http';

export type IMiddlewareTypes = (
  req: IncomingMessage,
  res: ServerResponse
) => any;
