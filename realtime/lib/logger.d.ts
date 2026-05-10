import cliProgress from 'cli-progress';
export declare const logger: {
    info: (msg: string, ...args: any[]) => void;
    success: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
    ws: (msg: string, ...args: any[]) => void;
    db: (msg: string, ...args: any[]) => void;
};
export declare const createProgressBar: (total: number, title: string) => cliProgress.SingleBar;
//# sourceMappingURL=logger.d.ts.map