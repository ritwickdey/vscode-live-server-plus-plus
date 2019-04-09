import * as fs from 'fs';
import * as vscode from 'vscode';
import { Buffer } from 'buffer';

export const readFile = (filePath: string): Promise<Buffer> => {
  const file = vscode.workspace.textDocuments.find(e => {
    return e.isDirty && e.fileName === filePath;
  });

  if (file) {
    console.log('Reading Dirty file: ', filePath);
    return readFileFromVscodeWorkspace(file);
  }

  console.log('Reading file from disk: ', filePath);
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
