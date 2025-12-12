
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
const LOG_FILE = 'codebase-scan-report.json';
const PACKAGES_DIR = 'packages';
const APPS_DIR = 'apps';

// --- Types ---
type IssueType = 'bug' | 'security' | 'style' | 'performance';
type Severity = 'low' | 'medium' | 'high' | 'critical';

interface Issue {
  category: IssueType;
  severity: Severity;
  message: string;
  file?: string;
  line?: number;
  remediation?: string;
}

interface ScanReport {
  timestamp: string;
  summary: {
    totalIssues: number;
    byCategory: Record<IssueType, number>;
    bySeverity: Record<Severity, number>;
  };
  issues: Issue[];
}

// --- Helpers ---
function runCommand(command: string, cwd: string = process.cwd()): string {
  try {
    return execSync(command, { cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error: any) {
    return error.stdout + '\n' + error.stderr;
  }
}

function log(message: string) {
  console.log(`[Scanner] ${message}`);
}

// --- Scanners ---

function scanLinting(report: ScanReport) {
  log('Running Lint/Style Analysis...');
  try {
    const output = runCommand('pnpm lint');
    // Simple parsing of lint output - in a real agent, this would be more robust parsing of JSON output
    if (output.includes('error') || output.includes('warning')) {
        // Mock parsing for demonstration
        report.issues.push({
            category: 'style',
            severity: 'medium',
            message: 'Linting issues found. Run "pnpm lint" for details.',
            remediation: 'Run "pnpm lint --fix" to automatically resolve style issues.'
        });
    }
  } catch (e) {
      report.issues.push({
          category: 'style',
          severity: 'medium',
          message: 'Linting command failed.',
          remediation: 'Check eslint configuration.'
      });
  }
}

function scanTypes(report: ScanReport) {
  log('Running Static Type Analysis...');
    try {
        // Check root and packages
        runCommand('pnpm tsc --noEmit --skipLibCheck');
    } catch (e: any) {
        const output = e.stdout || e.message;
        const matches = output.match(/error TS\d+:[^(\r\n]+(?:\r?\n|$)/g) || [];
        matches.forEach((match: string) => {
             report.issues.push({
                category: 'bug',
                severity: 'high',
                message: match.trim(),
                remediation: 'Fix TypeScript type errors.'
            });
        });
    }
}

function scanSecurity(report: ScanReport) {
  log('Running Security Audit...');
  try {
    const output = runCommand('pnpm audit --json');
    const auditResult = JSON.parse(output);
    
    if (auditResult.advisories && Object.keys(auditResult.advisories).length > 0) {
        Object.values(auditResult.advisories).forEach((advisory: any) => {
            report.issues.push({
                category: 'security',
                severity: advisory.severity,
                message: advisory.title,
                remediation: `Upgrade ${advisory.module_name} to ${advisory.patched_versions}`
            });
        });
    }
  } catch (e) {
      // pnpm audit returns non-zero exit code if vulnerabilities are found
       report.issues.push({
            category: 'security',
            severity: 'high',
            message: 'Security vulnerabilities detected.',
            remediation: 'Run "pnpm audit fix" to resolve vulnerabilities.'
        });
  }
}

function scanTests(report: ScanReport) {
    log('Running Automated Tests...');
    try {
        runCommand('pnpm test');
    } catch (e) {
        report.issues.push({
            category: 'bug',
            severity: 'high',
            message: 'Unit/Integration tests failed.',
            remediation: 'Run "pnpm test" to identify failing tests and fix logic errors.'
        });
    }
}

// --- Main ---

async function main() {
  const report: ScanReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalIssues: 0,
      byCategory: { bug: 0, security: 0, style: 0, performance: 0 },
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
    },
    issues: [],
  };

  log('Starting Codebase Scan...');
  
  scanLinting(report);
  scanTypes(report);
  scanSecurity(report);
  scanTests(report);

  // Aggregate stats
  report.summary.totalIssues = report.issues.length;
  report.issues.forEach(issue => {
    report.summary.byCategory[issue.category]++;
    report.summary.bySeverity[issue.severity]++;
  });

  // Save Report
  fs.writeFileSync(LOG_FILE, JSON.stringify(report, null, 2));
  log(`Scan complete. Report saved to ${LOG_FILE}`);
  log(`Found ${report.summary.totalIssues} issues.`);
  
  if (report.summary.totalIssues > 0) {
      console.log('--- Top Issues ---');
      report.issues.slice(0, 5).forEach(issue => {
          console.log(`[${issue.severity.toUpperCase()}] ${issue.message}`);
      });
  }
}

main().catch(console.error);
