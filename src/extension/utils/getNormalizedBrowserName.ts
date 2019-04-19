import { IBrowserList } from './extensionConfig';

export function getNormalizedBrowserName(browserName: IBrowserList): string {
  if (browserName === 'chrome') {
    const chromes = {
      darwin: 'google chrome',
      linux: 'google-chrome',
      win32: 'chrome'
    };
    return (chromes as any)[process.platform];
  }
  return browserName!;
}
