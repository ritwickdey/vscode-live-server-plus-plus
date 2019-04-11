import { IncomingMessage, ServerResponse } from 'http';

export type MiddlewareTypes = (
  req: IncomingMessage,
  res: ServerResponse
) => any;
