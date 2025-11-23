#!/usr/bin/env node
// Simple script to update `leaderboard.json` in the repo using GitHub API.
// Usage: node submit_score.js --owner <owner> --repo <repo> --token <token> --name "Player" --difficulty easy --guesses 5 --time 12.34

const fs = require('fs');
const path = require('path');
const { argv } = require('process');

function parseArgs() {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      out[key] = argv[i+1];
      i++;
    }
  }
  return out;
}

async function main(){
  const args = parseArgs();
  const owner = args.owner || process.env.GITHUB_OWNER;
  const repo = args.repo || process.env.GITHUB_REPO;
  const token = args.token || process.env.GITHUB_TOKEN;
  if (!owner || !repo || !token) {
    console.error('Missing owner/repo/token. Provide via --owner --repo --token or env GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN');
    process.exit(1);
  }

  const payload = {
    name: args.name || 'Anonymous',
    difficulty: args.difficulty || 'easy',
    guesses: Number(args.guesses) || 0,
    time: Number(args.time) || 0,
    date: new Date().toISOString(),
  };

  const filePath = 'leaderboard.json';
  const apiBase = 'https://api.github.com';

  // get file to obtain sha
  const getUrl = `${apiBase}/repos/${owner}/${repo}/contents/${filePath}`;
  const headers = { 'Authorization': `token ${token}`, 'User-Agent': 'submit-score-script' };

  const fetch = globalThis.fetch || (await import('node-fetch')).default;

  const resGet = await fetch(getUrl, { headers });
  if (!resGet.ok) {
    console.error('Failed to fetch leaderboard.json:', resGet.status, await resGet.text());
    process.exit(1);
  }
  const fileData = await resGet.json();
  const content = Buffer.from(fileData.content, 'base64').toString('utf8');
  let arr = [];
  try { arr = JSON.parse(content); } catch (e) { arr = []; }
  arr.push(payload);

  // commit new content
  const newContent = Buffer.from(JSON.stringify(arr, null, 2)).toString('base64');
  const putUrl = `${apiBase}/repos/${owner}/${repo}/contents/${filePath}`;
  const body = {
    message: `Add score for ${payload.name} (${payload.difficulty})`,
    content: newContent,
    sha: fileData.sha,
  };

  const resPut = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type':'application/json' }, body: JSON.stringify(body) });
  if (!resPut.ok) {
    console.error('Failed to update leaderboard.json:', resPut.status, await resPut.text());
    process.exit(1);
  }
  console.log('Leaderboard updated successfully.');
}

main().catch(err=>{console.error(err);process.exit(1)});
