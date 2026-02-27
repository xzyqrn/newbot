import { SelfImprovementSystem } from './self-improvement';
export declare class Scheduler {
    private selfImprovement;
    private improvementInterval;
    private readonly IMPROVEMENT_INTERVAL_MS;
    constructor(selfImprovement: SelfImprovementSystem);
    startPeriodicImprovement(): void;
    stopPeriodicImprovement(): void;
    isRunning(): boolean;
}
//# sourceMappingURL=scheduler.d.ts.map