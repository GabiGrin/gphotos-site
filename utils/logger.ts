type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

interface LoggerInterface {
  trace(obj: object, msg?: string): void;
  debug(obj: object, msg?: string): void;
  info(obj: object, msg?: string): void;
  warn(obj: object, msg?: string): void;
  error(obj: object, msg?: string): void;
  fatal(obj: object, msg?: string): void;
}

class SimpleLogger implements LoggerInterface {
  private log(level: LogLevel, obj: object, msg?: string): void {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp} [${level.toUpperCase()}] ${msg || ""}`);
    console.log(JSON.stringify(obj, null, 2));
  }

  trace(obj: object, msg?: string): void {
    this.log("trace", obj, msg);
  }

  debug(obj: object, msg?: string): void {
    this.log("debug", obj, msg);
  }

  info(obj: object, msg?: string): void {
    this.log("info", obj, msg);
  }

  warn(obj: object, msg?: string): void {
    this.log("warn", obj, msg);
  }

  error(obj: object, msg?: string): void {
    this.log("error", obj, msg);
  }

  fatal(obj: object, msg?: string): void {
    this.log("fatal", obj, msg);
  }
}

const logger = new SimpleLogger();

export { logger };
export default logger;
