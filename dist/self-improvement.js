"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfImprovementSystem = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class SelfImprovementSystem {
    constructor(openRouter) {
        this.improvementHistory = [];
        this.openRouter = openRouter;
        this.srcPath = path.join(__dirname, '..');
    }
    async analyzeCodebase() {
        const analyses = [];
        const files = await this.getSourceFiles();
        for (const filePath of files) {
            const analysis = await this.analyzeFile(filePath);
            if (analysis) {
                analyses.push(analysis);
            }
        }
        return analyses;
    }
    async getSourceFiles() {
        const files = [];
        async function scanDirectory(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await scanDirectory(fullPath);
                }
                else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
                    files.push(fullPath);
                }
            }
        }
        await scanDirectory(this.srcPath);
        return files;
    }
    async analyzeFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const relativePath = path.relative(this.srcPath, filePath);
            const analysisPrompt = `
Analyze this TypeScript/JavaScript file for potential improvements:

File: ${relativePath}

\`\`\`typescript
${content}
\`\`\`

Provide analysis in JSON format:
{
  "improvements": ["list of specific improvements"],
  "issues": ["list of potential issues or bugs"],
  "suggestions": ["list of general suggestions"],
  "priority": "low|medium|high"
}

Focus on:
- Code quality and best practices
- Performance optimizations
- Error handling
- Type safety
- Security considerations
- Maintainability
- Modern JavaScript/TypeScript features
`;
            const response = await this.openRouter.chat([
                {
                    role: 'system',
                    content: 'You are an expert code reviewer. Provide concise, actionable feedback in valid JSON format only.'
                },
                {
                    role: 'user',
                    content: analysisPrompt
                }
            ]);
            try {
                const analysis = JSON.parse(response);
                return {
                    filePath: relativePath,
                    ...analysis
                };
            }
            catch (parseError) {
                console.error(`Failed to parse analysis for ${relativePath}:`, parseError);
                return null;
            }
        }
        catch (error) {
            console.error(`Error analyzing file ${filePath}:`, error);
            return null;
        }
    }
    async generateImprovementPlan(analyses) {
        const highPriorityIssues = analyses.filter(a => a.priority === 'high');
        const mediumPriorityIssues = analyses.filter(a => a.priority === 'medium');
        const planPrompt = `
Based on these code analyses, create an improvement plan:

${JSON.stringify(analyses, null, 2)}

Generate a JSON improvement plan:
{
  "id": "unique-plan-id",
  "description": "Brief description of what this plan achieves",
  "estimatedImpact": "Description of expected improvements",
  "autoApprove": boolean (true for safe improvements, false for risky ones)
}

Focus on the most impactful improvements first. Auto-approve should only be true for:
- Adding comments/documentation
- Simple refactoring
- Adding type safety
- Improving error handling
- Performance optimizations that don't change behavior

Set autoApprove to false for:
- Major architectural changes
- API changes
- Logic modifications
- Breaking changes
`;
        const response = await this.openRouter.chat([
            {
                role: 'system',
                content: 'You are a software architect. Create practical improvement plans in valid JSON format only.'
            },
            {
                role: 'user',
                content: planPrompt
            }
        ]);
        try {
            const plan = JSON.parse(response);
            const improvementPlan = {
                ...plan,
                files: analyses,
                status: 'pending'
            };
            this.improvementHistory.push(improvementPlan);
            return improvementPlan;
        }
        catch (parseError) {
            console.error('Failed to parse improvement plan:', parseError);
            throw new Error('Failed to generate improvement plan');
        }
    }
    async implementImprovement(plan) {
        try {
            console.log(`🔧 Implementing improvement plan: ${plan.description}`);
            for (const analysis of plan.files) {
                if (analysis.improvements.length > 0) {
                    await this.improveFile(analysis);
                }
            }
            plan.status = 'implemented';
            console.log(`✅ Successfully implemented improvement plan: ${plan.description}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to implement improvement plan: ${plan.description}`, error);
            plan.status = 'rejected';
            return false;
        }
    }
    async improveFile(analysis) {
        const filePath = path.join(this.srcPath, analysis.filePath);
        const originalContent = await fs.readFile(filePath, 'utf-8');
        const improvementPrompt = `
Improve this file based on the analysis:

File: ${analysis.filePath}

Current improvements needed:
${analysis.improvements.join('\n')}

Issues to fix:
${analysis.issues.join('\n')}

Suggestions to implement:
${analysis.suggestions.join('\n')}

Original code:
\`\`\`typescript
${originalContent}
\`\`\`

Provide the improved code only, without explanations or markdown formatting. The response should be valid TypeScript/JavaScript code that can be directly written to the file.
`;
        const response = await this.openRouter.chat([
            {
                role: 'system',
                content: 'You are an expert programmer. Return only the improved code, no explanations or markdown formatting.'
            },
            {
                role: 'user',
                content: improvementPrompt
            }
        ]);
        const improvedContent = response.trim();
        if (improvedContent && improvedContent !== originalContent) {
            await fs.writeFile(filePath, improvedContent, 'utf-8');
            console.log(`📝 Improved file: ${analysis.filePath}`);
        }
    }
    async selfImprove() {
        console.log('🤔 Starting self-improvement analysis...');
        try {
            const analyses = await this.analyzeCodebase();
            console.log(`📊 Analyzed ${analyses.length} files`);
            const plan = await this.generateImprovementPlan(analyses);
            console.log(`📋 Generated improvement plan: ${plan.description}`);
            if (plan.autoApprove) {
                console.log('🚀 Auto-approving safe improvements...');
                await this.implementImprovement(plan);
            }
            else {
                console.log(`⏸️ Improvement plan requires manual approval: ${plan.description}`);
                console.log(`Impact: ${plan.estimatedImpact}`);
            }
        }
        catch (error) {
            console.error('❌ Self-improvement failed:', error);
        }
    }
    getImprovementHistory() {
        return this.improvementHistory;
    }
    async requestManualImprovement(description) {
        const analyses = await this.analyzeCodebase();
        const customPlan = {
            id: `manual-${Date.now()}`,
            description,
            files: analyses,
            estimatedImpact: 'Custom improvement requested by user',
            autoApprove: false,
            status: 'pending'
        };
        this.improvementHistory.push(customPlan);
        return customPlan;
    }
}
exports.SelfImprovementSystem = SelfImprovementSystem;
//# sourceMappingURL=self-improvement.js.map