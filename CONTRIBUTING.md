# 🤝 Contributing to Sanjeevani

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![First Timers](https://img.shields.io/badge/first--timers-welcome-blueviolet?style=flat-square)](https://www.firsttimersonly.com/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?style=flat-square&logo=conventionalcommits&logoColor=white)](https://www.conventionalcommits.org/)

Thank you for your interest in contributing to **Sanjeevani**! Every contribution matters — whether it's fixing a typo, improving documentation, or building new features. This guide will help you get started.

---

## 📋 Table of Contents

- [🌟 First Time Contributors](#-first-time-contributors)
- [🔧 Development Setup](#-development-setup)
- [📝 Commit Convention](#-commit-convention)
- [🌿 Branch Naming](#-branch-naming)
- [🔄 Pull Request Process](#-pull-request-process)
- [🐛 Reporting Issues](#-reporting-issues)
- [🎨 Code Style](#-code-style)
- [📜 Code of Conduct](#-code-of-conduct)

---

## 🌟 First Time Contributors

Never contributed to open source before? **Welcome!** Here's how to start:

1. 🍴 **Fork** this repository
2. 📥 **Clone** your fork locally
3. 🌿 **Create a branch** for your changes
4. ✏️ **Make your changes** and commit them
5. 🚀 **Push** to your fork
6. 📩 **Open a Pull Request** — we'll review it!

Look for issues tagged with:
- 🏷️ `good first issue` — Perfect for beginners
- 🏷️ `help wanted` — We'd love some help here
- 🏷️ `documentation` — Improve our docs

---

## 🔧 Development Setup

### Prerequisites

| Tool | Version | Purpose |
|:---|:---|:---|
| Node.js | >= 18 | Backend & Frontend |
| Python | >= 3.10 | OCR Service |
| MongoDB | Latest | Database |
| Git | Latest | Version control |

### 1️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env          # Add your MongoDB URI
npm run dev                    # http://localhost:5000
```

### 2️⃣ OCR Service Setup

```bash
cd ocr-service
python -m venv venv
.\venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --port 8000 --reload
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

---

## 📝 Commit Convention

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**:

```
<type>(<scope>): <description>

[optional body]
```

### Types

| Type | When to Use |
|:---|:---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code formatting (no logic change) |
| `refactor` | Code restructuring (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build tools, dependencies, configs |
| `deploy` | Deployment-related changes |

### Examples

```bash
feat(audit): add CGHS dual-source matching pipeline
fix(ocr): correct price path for CGHS procedures  
docs(readme): add system architecture diagram
refactor(backend): move source to backend/ directory
deploy(ocr): prepare Dockerfile for HF Spaces
```

---

## 🌿 Branch Naming

```
<type>/<short-description>
```

| Pattern | Example |
|:---|:---|
| `feat/description` | `feat/cghs-audit-pipeline` |
| `fix/description` | `fix/ocr-price-extraction` |
| `docs/description` | `docs/api-reference` |
| `refactor/description` | `refactor/project-structure` |

---

## 🔄 Pull Request Process

1. 📝 **Fill out the PR template** completely
2. 🔗 **Link related issues** using `Closes #123`
3. ✅ **Ensure all tests pass** locally
4. 📸 **Add screenshots** for UI changes
5. 📖 **Update documentation** if needed
6. 👀 **Request review** from a maintainer

### PR Title Format

```
type(scope): brief description
```

Example: `feat(audit): add unverified item flagging`

---

## 🐛 Reporting Issues

When filing an issue, please include:

- **🔍 Clear title** — Summarize the problem
- **📝 Description** — What happened vs. what you expected
- **🔄 Steps to reproduce** — How to trigger the bug
- **📸 Screenshots** — If applicable
- **🖥️ Environment** — OS, browser, Node/Python version
- **📋 Logs** — Console errors or server logs

---

## 🎨 Code Style

### JavaScript / Node.js

- Use **ES6+** features (arrow functions, destructuring, template literals)
- Use **`const`** by default, **`let`** when reassignment is needed
- Use **async/await** over raw promises
- Add **JSDoc comments** for public functions
- Use **2-space indentation**

### Python

- Follow **PEP 8** style guide
- Use **type hints** for function signatures
- Use **docstrings** for modules and functions
- Use **4-space indentation**
- Import order: stdlib → third-party → local

### General

- Write **self-documenting code** — meaningful variable names
- Keep functions **small and focused** — single responsibility
- Add **error handling** — don't let errors fail silently
- Write **comments for "why"**, not "what"

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

---

<div align="center">

**Thank you for helping make healthcare transparent for everyone! 🫀**

</div>
