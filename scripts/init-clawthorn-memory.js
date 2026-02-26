#!/usr/bin/env node
/**
 * One-time setup for Clawthorn job-hunt: creates _bmad/_memory/,
 * job-applications.csv (with header), and resume-text.txt (placeholder).
 * Run from repo root or pass --directory /path/to/project.
 * Usage: node scripts/init-clawthorn-memory.js [--directory /path/to/project]
 */
const fs = require('node:fs');
const path = require('node:path');

const argv = process.argv.slice(2);
const dirIdx = argv.indexOf('--directory');
const projectRoot = dirIdx >= 0 && argv[dirIdx + 1]
  ? path.resolve(process.cwd(), argv[dirIdx + 1])
  : process.cwd();

const memoryDir = path.join(projectRoot, '_bmad', '_memory');
const csvPath = path.join(memoryDir, 'job-applications.csv');
const resumeTextPath = path.join(memoryDir, 'resume-text.txt');

const CSV_HEADER = 'Job title,Company,Source,URL,Date attempted,Status,Notes\n';
const RESUME_PLACEHOLDER = '# Paste your resume text below (or run a PDF-to-text tool and redirect here).\n# Clawthorn reads this file to tailor applications.\n\n';

if (!fs.existsSync(memoryDir)) {
  fs.mkdirSync(memoryDir, { recursive: true });
  console.log('Created:', memoryDir);
}

if (!fs.existsSync(csvPath)) {
  fs.writeFileSync(csvPath, CSV_HEADER, 'utf8');
  console.log('Created:', csvPath);
} else {
  console.log('Exists:', csvPath);
}

if (!fs.existsSync(resumeTextPath)) {
  fs.writeFileSync(resumeTextPath, RESUME_PLACEHOLDER, 'utf8');
  console.log('Created:', resumeTextPath, '— paste your resume text there.');
} else {
  console.log('Exists:', resumeTextPath);
}

console.log('Clawthorn memory ready. Next: paste resume into resume-text.txt, copy skills to OpenClaw, then run OpenClaw.');
