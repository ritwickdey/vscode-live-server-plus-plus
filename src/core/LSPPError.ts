import { LSPPServerErrorCodes } from './types';

export class LSPPError extends Error {
  constructor(message: string, public code?: LSPPServerErrorCodes) {
    super(message);
  }
}
