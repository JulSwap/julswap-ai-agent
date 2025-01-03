let isDebugEnabled = false;

export const debug = {
  enable: () => {
    isDebugEnabled = true;
  },
  disable: () => {
    isDebugEnabled = false;
  },
  log: (...args: any[]) => {
    if (isDebugEnabled) {
      console.log("[DEBUG]", ...args);
    }
  },
};
