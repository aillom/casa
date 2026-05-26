---
trigger: glob
globs: "**/*.{ts,tsx,js,jsx,yml,yaml,json,md}"
---

# C.A.S.A Security Rule

Apply C.A.S.A security policies when touching sensitive files.

Required:

- validate external input
- keep authorization server-side
- avoid logging secrets or sensitive data
- update security docs or threat model when risk changes
- run relevant sensors
