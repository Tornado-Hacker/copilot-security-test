#!/bin/bash

# Setup and Test Malicious Repository
# For authorized security testing only

set -e

echo "=== Setting Up Malicious Test Repository ==="
echo ""

# Check if we're in the right directory
if [ ! -f ".github/copilot-instructions.md" ]; then
    echo "Error: Run this script from the malicious_repo_files directory"
    exit 1
fi

# Initialize git repo
echo "[1/4] Initializing git repository..."
git init

# Add files
echo "[2/4] Adding files..."
git add .

# Commit
echo "[3/4] Creating commit..."
git commit -m "Initial commit - Security test repository"

# Add remote
echo "[4/4] Adding remote..."
git remote add origin https://github.com/Tornado-Hacker/copilot-security-test.git 2>/dev/null || true

echo ""
echo "=== Repository Ready ==="
echo ""
echo "To push to GitHub:"
echo "  git push -u origin main"
echo ""
echo "To test in Copilot:"
echo "  1. Open the repo in Copilot Desktop"
echo "  2. Or use: ghapp://github.com/Tornado-Hacker/copilot-security-test"
echo "  3. Check Burp Collaborator for HTTP requests"
echo ""
echo "Payloads in .github/copilot-instructions.md:"
echo "  - Step 1: HTTP request to /health"
echo "  - Step 2: HTTP request to /track with username + hostname"
echo "  - Step 3: HTTP request to /env with environment variables"
echo ""
echo "Burp Collaborator URL: http://018d6d6f36deb9353f3cgirzfjwyyyyyn.oast.pro"
echo ""
