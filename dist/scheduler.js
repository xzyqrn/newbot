"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
class Scheduler {
    constructor(selfImprovement) {
        this.improvementInterval = null;
        this.IMPROVEMENT_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
        this.selfImprovement = selfImprovement;
    }
    startPeriodicImprovement() {
        if (this.improvementInterval) {
            console.log('⚠️ Periodic improvement already running');
            return;
        }
        console.log('🕐 Starting periodic self-improvement (every 24 hours)');
        // Run first improvement after 1 hour, then every 24 hours
        this.improvementInterval = setInterval(async () => {
            try {
                console.log('🔄 Running scheduled self-improvement...');
                await this.selfImprovement.selfImprove();
                console.log('✅ Scheduled self-improvement completed');
            }
            catch (error) {
                console.error('❌ Scheduled self-improvement failed:', error);
            }
        }, this.IMPROVEMENT_INTERVAL_MS);
        // Schedule first run in 1 hour
        setTimeout(async () => {
            try {
                console.log('🔄 Running initial scheduled self-improvement...');
                await this.selfImprovement.selfImprove();
                console.log('✅ Initial scheduled self-improvement completed');
            }
            catch (error) {
                console.error('❌ Initial scheduled self-improvement failed:', error);
            }
        }, 60 * 60 * 1000); // 1 hour
    }
    stopPeriodicImprovement() {
        if (this.improvementInterval) {
            clearInterval(this.improvementInterval);
            this.improvementInterval = null;
            console.log('⏹️ Stopped periodic self-improvement');
        }
    }
    isRunning() {
        return this.improvementInterval !== null;
    }
}
exports.Scheduler = Scheduler;
//# sourceMappingURL=scheduler.js.map