import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Readable } from 'stream';
import { Buffer } from 'buffer';
import { SUPPORTED_FILES } from './utils/index';

// Stream version
export const readFileStream = (filePath: string, encoding = 'utf8') => {
  const fileExt = path.extname(filePath).toLowerCase();
  const file = vscode.workspace.textDocuments.find(
    doc =>
      doc.isDirty &&
      doc.fileName === filePath &&
      SUPPORTED_FILES.includes(fileExt)
  );

  if (file) {
    console.log('[Stream]Reading Dirty file:', filePath);
    const stream = new Readable({ encoding });
    stream.push(file.getText());
    stream.push(null);
    return stream;
  }

  console.log('[Stream]Reading file from disk: ', filePath);
  return fs.createReadStream(filePath, { encoding });
};

// Promise version
export const readFile = (filePath: string): Promise<Buffer> => {
  const fileExt = path.extname(filePath).toLowerCase();
  const file = vscode.workspace.textDocuments.find(
    doc =>
      doc.isDirty &&
      doc.fileName === filePath &&
      SUPPORTED_FILES.includes(path.extname(fileExt))
  );

  if (file) {
    console.log('[Promise]Reading Dirty file: ', filePath);
    return readFileFromVscodeWorkspace(file);
  }

  console.log('[Promise]Reading file from disk: ', filePath);
  return readFileFromFileSystem(filePath);
};

const readFileFromVscodeWorkspace = (
  filePath: string | vscode.TextDocument
) => {
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
