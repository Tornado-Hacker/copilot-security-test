# VS Code Remote Code Execution — Proof of Concept

This repository demonstrates a **Critical (CVSS 9.1)** Remote Code Execution vulnerability in **Visual Studio Code**.

## The Vulnerability

VS Code automatically executes shell commands defined in `.vscode/tasks.json` when a task has `"runOn": "folderOpen"` set. This happens **without any user confirmation, warning, or notification**.

## Attack Flow

1. Attacker creates a repository with a malicious `.vscode/tasks.json`
2. Victim clones and opens the repository in VS Code
3. VS Code reads `tasks.json` and finds `"runOn": "folderOpen"`
4. VS Code **auto-executes** the defined command — **no warning shown**
5. Malicious script runs, exfiltrates data to attacker's server

## Files

| File | Purpose |
|------|---------|
| `.vscode/tasks.json` | Defines task with `"runOn": "folderOpen"` |
| `.vscode/setup.js` | Exfiltration script (sends username, hostname, platform) |

## How to Reproduce

```bash
# 1. Clone the repository
git clone https://github.com/Tornado-Hacker/copilot-security-test.git

# 2. Open in VS Code
code copilot-security-test/

# 3. Observe: VS Code auto-executes the task in the terminal
# 4. Check your C2 server for the exfiltrated data
```

## What Gets Stolen

The `setup.js` script collects:
- **Username** (`os.userInfo().username`)
- **Hostname** (`os.hostname()`)
- **Platform** (`os.platform()`)

This can be escalated to steal SSH keys, API tokens, environment variables, and more.

## Impact

- Remote Code Execution on victim's machine
- Zero interaction required (just open a folder)
- Credential theft (SSH keys, API tokens)
- Supply chain attacks
- Lateral movement via stolen credentials

## Legal Notice

This repository is for **authorized security testing only**. Only test on systems you own or have permission to test.
