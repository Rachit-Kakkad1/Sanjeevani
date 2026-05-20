# 🔒 Security Policy

## 🛡️ Supported Versions

| Version | Supported |
|:---|:---:|
| 2.x.x (current) | ✅ |
| 1.x.x | ❌ |

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue
2. Email us at **security@sanjeevani.dev**
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Stage | Timeline |
|:---|:---|
| 📩 Acknowledgment | Within 48 hours |
| 🔍 Initial assessment | Within 5 business days |
| 🔧 Fix development | Within 30 days |
| 📢 Public disclosure | After fix is deployed |

## 🏰 Security Measures

Sanjeevani implements multiple layers of security:

| Layer | Implementation |
|:---|:---|
| 🪖 **HTTP Headers** | Helmet.js for secure headers (XSS, HSTS, CSP) |
| 🚦 **Rate Limiting** | 100 requests per 15 minutes per IP |
| 🌐 **CORS** | Whitelist-based origin control |
| 🔐 **Authentication** | Google OAuth 2.0 + JWT tokens |
| 📦 **Input Validation** | File type/size validation, schema enforcement |
| 🗄️ **Database** | MongoDB Atlas with TLS encryption |
| 🐳 **Containerization** | Non-root Docker user, minimal base images |
| 📤 **File Handling** | Temp storage only — files deleted after OCR processing |

## 📜 Responsible Disclosure

We follow a coordinated disclosure process. Please allow us reasonable time to fix vulnerabilities before public disclosure. We commit to keeping reporters informed throughout the process.

---

*Thank you for helping keep Sanjeevani and its users safe! 🫀*
