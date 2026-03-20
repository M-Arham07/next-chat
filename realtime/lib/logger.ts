import chalk from 'chalk';
import cliProgress from 'cli-progress';

export const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(chalk.blue('ℹ'), chalk.white(msg), ...args);
  },
  success: (msg: string, ...args: any[]) => {
    console.log(chalk.green('✔'), chalk.green(msg), ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.log(chalk.yellow('⚠'), chalk.yellow(msg), ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.log(chalk.red('✖'), chalk.red(msg), ...args);
  },
  ws: (msg: string, ...args: any[]) => {
    console.log(chalk.cyan('󱢝 [WS]'), chalk.cyan(msg), ...args);
  },
  db: (msg: string, ...args: any[]) => {
    console.log(chalk.magenta('󰆼 [DB]'), chalk.magenta(msg), ...args);
  }
};

export const createProgressBar = (total: number, title: string) => {
  const bar = new cliProgress.SingleBar({
    format: `${chalk.cyan(title)} |${chalk.cyan('{bar}')}| {percentage}% || {value}/{total} Chunks`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  return bar;
};
