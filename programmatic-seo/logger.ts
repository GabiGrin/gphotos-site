import chalk from "chalk";

export function logProgress(
  message: string,
  type: "info" | "success" | "error" | "warning" = "info"
) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;

  switch (type) {
    case "success":
      console.log(chalk.gray(prefix), chalk.green("✓"), message);
      break;
    case "error":
      console.log(chalk.gray(prefix), chalk.red("✗"), message);
      break;
    case "warning":
      console.log(chalk.gray(prefix), chalk.yellow("⚠"), message);
      break;
    default:
      console.log(chalk.gray(prefix), chalk.blue("ℹ"), message);
  }
}
