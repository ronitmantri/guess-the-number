# Guess The Number

Simple client-side guess-the-number game that shows difficulty levels, gives higher/lower hints, and records time and guesses. A `leaderboard.json` file in the repository is used as a world leaderboard.

Files added:
- `index.html` — web UI
- `style.css` — styling
- `app.js` — client-side game logic and leaderboard viewer
- `leaderboard.json` — file storing leaderboard entries (initially empty)
- `submit_score.js` — Node script to commit new scores to `leaderboard.json` using the GitHub API
- `package.json` — for the submit helper

Run locally (quick):

1. Serve the folder with a static server (so `fetch('leaderboard.json')` works):

```bash
cd /workspaces/guess-the-number
python3 -m http.server 8000
# or: npx serve .
```

2. Open `http://localhost:8000` in your browser and play.

How to publish a score to the world leaderboard

This project stores the leaderboard in `leaderboard.json`. To update it automatically you can run `submit_score.js`, which uses the GitHub REST API to update the file. It requires a GitHub token with `repo` scope (or `public_repo` for public repositories).

Example (bash):

```bash
export GITHUB_OWNER=your-username-or-org
export GITHUB_REPO=guess-the-number
export GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXX
node submit_score.js --owner $GITHUB_OWNER --repo $GITHUB_REPO --token $GITHUB_TOKEN --name "Player" --difficulty easy --guesses 5 --time 12.34
```

The script will fetch the current `leaderboard.json`, append your score, and commit the change.

Notes and privacy
- Using this script means anyone with a valid token and access can push to the file. For a public "world" leaderboard with open submissions, consider moderating or using PR workflow instead.

If you'd like I can:
- Add a tiny server to accept submissions from the browser and post to GitHub for you (requires a server and secure token storage), or
- Add a GitHub Actions workflow that accepts PRs or runs on dispatch to update the file from an approved source.
