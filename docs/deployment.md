# Deployment & Local Operations Guide

## Prerequisites
- Node.js 18+ or 20+ (Node 22 recommended)
- npm or bun

## Setup & Running Locally

1. **Install Dependencies**:
```bash
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

3. **Production Build & Verification**:
```bash
npm run build
npm run start
```

4. **Execute Automated Engine Tests**:
```bash
node tests/run-tests.mjs
```
