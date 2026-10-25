# Orbit — beginner project workspace

Orbit is a small, static project-and-task workspace. It runs without a framework, database, build step, API key, or paid service. You can open it locally or publish the same files with GitHub Pages.

## Run it on Windows

## Challenge lab: learn by fixing incidents

Open **Challenge lab** in the sidebar, or open `lab.html` directly. Choose an incident, reproduce the failure with **Run regression checks**, choose a patch strategy, explain the cause, record verification, and write a customer reply. Submit to get a score breakdown and tailored, rule-based advice. Enable the bonus toggle for a deliberately unrealistic lunar-calendar mission.

Scoring: correctness 50, reasoning 15, verification 15, communication 15, speed 5. Speed points require all checks to pass. Hints have no penalty. Text scoring uses transparent heuristics in `lab-engine.js`; it does not understand arbitrary code or verify claims. The timer measures wall time including breaks. Switching missions retains drafts and timers during the current visit; refreshing starts new timers. Debriefs are browser-local, capped at the latest 100, and can be exported. XP sums each mission's best retained score. The lab uses isolated simulated data, not workspace tasks or real payments.

For actual repository coding practice, repair the deliberately broken functions in `lab-fixes.js`, then run with Node 22 or newer:

```sh
node --test tests/lab-exercises.test.cjs
```

These exercise tests **intentionally fail at first**. The optional lunar test is named `OPTIONAL BONUS`; focus on the realistic tests first. Add your own edge cases. Browser patch choices are a separate simulation; they do not edit repository files, and repository changes do not alter browser strategy scores. GitHub Pages cannot execute Node tests; run these locally or in your own Actions workflow.

The learning engine has a separate passing check used by the Pages workflow:

```sh
node --test tests/lab-engine.test.cjs
```

### Launch the workspace

1. Download or clone this project.
2. Double-click **`run-local.bat`**. It starts a small local web server and opens the app in your browser.
3. To stop the server, return to the black command window and press **Ctrl+C**.

The launcher uses Python's built-in web server. If Python is not installed, install it from [python.org](https://www.python.org/downloads/) and select **Add Python to PATH** during setup. As a quick alternative, double-click `index.html` to open the app directly; a local server is more reliable for browser storage.

## Publish with GitHub Pages

1. Create a GitHub repository and add these project files to its default branch. The included workflow currently deploys from **`main`**; update `.github/workflows/pages.yml` if your default branch has a different name.
2. Push the files to GitHub.
3. In the repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**.
4. Open the **Actions** tab. When **Deploy Orbit to GitHub Pages** finishes, open its deployment link. Future pushes to `main` publish automatically. You can also start a deployment manually from the workflow with **Run workflow**.

There is no build command or secrets setup. The site uses relative asset paths, so it works both at a user site and at a repository subpath such as `https://your-name.github.io/your-repo/`. GitHub Pages is static hosting: each visitor gets their own browser-only workspace; it does not synchronize data between people.

## Use the workspace

- **Create a project:** use the plus button beside Your Projects.
- **Create or update a task:** choose New task, or open a task and choose Edit. Set a project, owner, priority, due date, and optional time estimate.
- **Finish a task:** click its checkbox. Give it 1–5 efficiency and quality ratings, optionally record actual minutes and what helped or got in the way, then save the review. You can update a review later from the task details.
- **Fix a task that is not done:** open the task and choose Edit to change its details, or change its status. Reopening a completed task clears that completion's ratings so reports only include currently completed work.
- **Discuss work:** open a task to read or add comments.
- **Find work:** use project navigation, status filters, or search. Press **Ctrl+K** (Windows/Linux) or **⌘K** (Mac) to focus search.
- **Keep a recovery copy:** choose **Export backup** at the bottom of the dashboard regularly. **Import backup** validates the file before replacing your current workspace. **Reset demo** restores the original sample data and replaces your current data.

Efficiency and quality are personal 1–5 self-ratings, not an automatic performance score. The dashboard shows the average ratings for completed tasks that have a review. Estimates and actual time help you compare planning with reality.

## Data and troubleshooting

- Tasks, projects, ratings, and comments are saved in your browser's local storage on the current device and site address. Clearing browser data, using private browsing, switching browsers/devices, or changing the deployed site URL may make that workspace unavailable. Export a JSON backup before changing browsers or deployment URLs.
- If the app cannot read saved data, it logs the error and opens the demo instead. Use **Import backup** to restore a saved JSON file. If the data is corrupted and there is no backup, **Reset demo** gives you a clean workspace.
- If save changes do not persist, allow site data in the browser and make sure private-browsing restrictions or storage limits are not blocking local storage.
- If the GitHub Pages page is missing or stale, check the latest workflow run under **Actions**, confirm Pages is set to **GitHub Actions**, and confirm the workflow branch matches the repository's default branch.
- If a file changed but the browser still shows the old page, hard-refresh with **Ctrl+Shift+R** (Windows/Linux) or **⌘Shift+R** (Mac).

## Project files

- `index.html` — app structure and dialogs
- `styles.css` — responsive styling
- `app.js` — workspace behavior and browser storage
- `run-local.bat` — Windows local launcher
- `.github/workflows/pages.yml` — automated GitHub Pages deployment

## Current scope

This is a complete front-end starter, not a multi-user hosted SaaS yet. There is no account/login, shared workspace, server-side database, email notification delivery, or real billing. Browser storage is convenient for a personal demo; a production team product would need a backend, authentication, access controls, and shared persistence.
