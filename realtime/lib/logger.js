import chalk from 'chalk';
import cliProgress from 'cli-progress';
export const logger = {
    info: (msg, ...args) => {
        console.log(chalk.blue('ℹ'), chalk.white(msg), ...args);
    },
    success: (msg, ...args) => {
        console.log(chalk.green('✔'), chalk.green(msg), ...args);
    },
    warn: (msg, ...args) => {
        console.log(chalk.yellow('⚠'), chalk.yellow(msg), ...args);
    },
    error: (msg, ...args) => {
        console.log(chalk.red('✖'), chalk.red(msg), ...args);
    },
    ws: (msg, ...args) => {
        console.log(chalk.cyan('󱢝 [WS]'), chalk.cyan(msg), ...args);
    },
    db: (msg, ...args) => {
        console.log(chalk.magenta('󰆼 [DB]'), chalk.magenta(msg), ...args);
    }
};
export const createProgressBar = (total, title) => {
    const bar = new cliProgress.SingleBar({
        format: `${chalk.cyan(title)} |${chalk.cyan('{bar}')}| {percentage}% || {value}/{total} Chunks`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
    });
    return bar;
};
//# sourceMappingURL=logger.js.map