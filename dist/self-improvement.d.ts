import { OpenRouterClient } from './openrouter';
export interface CodeAnalysis {
    filePath: string;
    improvements: string[];
    issues: string[];
    suggestions: string[];
    priority: 'low' | 'medium' | 'high';
}
export interface ImprovementPlan {
    id: string;
    description: string;
    files: CodeAnalysis[];
    estimatedImpact: string;
    autoApprove: boolean;
    status: 'pending' | 'approved' | 'implemented' | 'rejected';
}
export declare class SelfImprovementSystem {
    private openRouter;
    private srcPath;
    private improvementHistory;
    constructor(openRouter: OpenRouterClient);
    analyzeCodebase(): Promise<CodeAnalysis[]>;
    private getSourceFiles;
    private analyzeFile;
    generateImprovementPlan(analyses: CodeAnalysis[]): Promise<ImprovementPlan>;
    implementImprovement(plan: ImprovementPlan): Promise<boolean>;
    private improveFile;
    selfImprove(): Promise<void>;
    getImprovementHistory(): ImprovementPlan[];
    requestManualImprovement(description: string): Promise<ImprovementPlan>;
}
//# sourceMappingURL=self-improvement.d.ts.map