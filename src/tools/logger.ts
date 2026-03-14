export function logInfo(scope: string, message: string): void {
  console.log(`${new Date().toISOString()} | ${scope} | INFO | ${message}`);
}
