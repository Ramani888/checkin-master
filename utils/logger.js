
let isLoggingEnabled = false;

export const enableLogging = () => {
  isLoggingEnabled = true;
};

export const disableLogging = () => {
  isLoggingEnabled = false;
};

export const log = (...args) => {
  if (isLoggingEnabled==true) {
    console.log(...args);
  }
};

export const logError = (...args) => {
    if (isLoggingEnabled==true) {
        console.error(...args);
  }
};
