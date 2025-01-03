class Debug {
  private isDebugEnabled: boolean = false;

  enable(): void {
    this.isDebugEnabled = true;
  }

  disable(): void {
    this.isDebugEnabled = false;
  }

  log(...args: any[]): void {
    if (this.isDebugEnabled) {
      console.log("[TERMINAL DEBUG]", ...args);
    }
  }
}

export const debug = new Debug();
