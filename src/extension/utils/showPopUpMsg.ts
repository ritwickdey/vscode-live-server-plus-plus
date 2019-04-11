import { window } from 'vscode';

type IPopupMsgConfig = { msgType: 'info' | 'error' | 'warn' };

export function showPopUpMsg(msg: string, config?: IPopupMsgConfig) {
  const { msgType = 'info' } = config || {};
  if (msgType === 'error') {
    return window.showErrorMessage(msg);
  }
  if (msgType === 'info') {
    return window.showInformationMessage(msg);
  }
  if (msgType === 'warn') {
    return window.showWarningMessage(msg);
  }
}
