import * as fs from 'fs';
import * as vscode from 'vscode';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { isSupportedFile } from './utils/index';

// Stream version
export const readFileStream = (filePath: string, encoding?: string) => {
  const dirtyFile = getDirtyFileFromVscode(filePath);

  if (dirtyFile) {
    console.log('[Stream]Reading Dirty file:', filePath);
    const stream = new Readable({ encoding });
    setImmediate(() => {
      stream.emit('open');
      stream.push(dirtyFile.getText());
      stream.push(null);
    });
    return stream;
  }

  console.log('[Stream]Reading file from disk: ', filePath);
  return fs.createReadStream(filePath, { encoding });
};

// Promise version -- Most probably will not be used.
export const readFile = (filePath: string): Promise<Buffer> => {
  const dirtyFile = getDirtyFileFromVscode(filePath);

  if (dirtyFile) {
    console.log('[Promise]Reading Dirty file: ', filePath);
    return readFileFromVscodeWorkspace(dirtyFile);
  }

  console.log('[Promise]Reading file from disk: ', filePath);
  return readFileFromFileSystem(filePath);
};

const readFileFromVscodeWorkspace = (filePath: string | vscode.TextDocument) => {
  return new Promise<Buffer>(async (resolve, reject) => {
    let doc: vscode.TextDocument;
    try {
      if (typeof filePath === 'string') {
        doc = await vscode.workspace.openTextDocument(filePath);
      } else {
        doc = filePath;
      }
      const text = doc.getText();
      return resolve(Buffer.from(text));
    } catch (error) {
      reject(error);
    }
  });
};

const readFileFromFileSystem = (filePath: string) => {
  return new Promise<Buffer>((resolve, reject) => {
    fs.readFile(filePath, function(err, data) {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

// Private Utils

const getDirtyFileFromVscode = (filePath: string) => {
  return vscode.workspace.textDocuments.find(
    doc => doc.isDirty && doc.fileName === filePath && isSupportedFile(filePath)
  );
};
