# Orbit

Static project-and-task workspace with a SaaS/CPaaS challenge lab. Data stays in browser local storage; no backend or shared accounts.

## Run locally

Requires Python. On Windows, run `run-local.bat`; press **Ctrl+C** to stop. Alternatively, open `index.html` directly.

## Deploy

1. Push to `main` (or update the branch in `.github/workflows/pages.yml`).
2. Set [Settings → Pages](https://github.com/maabra/saas-project/settings/pages) → **Build and deployment → Source → GitHub Actions**.
3. Open the deployment link from **Actions → Deploy Orbit to GitHub Pages**.

Pushes to `main` deploy automatically. Manual deployments: **Run workflow**.

## Challenge lab

Open **Challenge lab** or `lab.html`. Each track has nine required missions across three difficulty levels; bonus missions are optional.

To finish a mission, select a repair, pass all regression checks, complete diagnosis, verification, and customer reply, then select **Finish mission & get debrief**. Written responses must be nonempty; accuracy is not validated. The learning path labels its three levels **Beginner**, **Intermediate**, and **Hard**.

Progress, drafts, timers, and debriefs save locally and can be exported. Scoring: correctness 50, reasoning 15, verification 15, communication 15, speed 5. Text scores use heuristics; hints have no penalty.

### Coding exercises

Requires Node 22+. Repair `lab-fixes.js`, then run:

```sh
node --test tests/lab-exercises.test.cjs
```

Exercise tests intentionally fail initially. The lunar test is optional. Browser repair choices and repository exercises are independent.

Engine checks (also run during deployment):

```sh
node --test tests/lab-engine.test.cjs tests/lab-course.test.cjs
```

## Workspace

- Create projects with **+** beside **Your Projects**; add or edit work with **New task** or **Edit**.
- Set task **Prerequisites** to show work that must finish first. Tasks with unfinished prerequisites appear as **Blocked**; dependency cycles are prevented, and deleting a prerequisite removes it from dependent tasks.
- Break large tasks into a hierarchy with **Add subtask** in task details or the **Parent task** field while creating or editing. Parent tasks show nested progress and cannot be completed until every subtask is complete. Reopening a subtask reopens completed ancestors; deleting a parent promotes its subtasks one level. Orbit prevents hierarchy loops and cross-links that would make completion impossible.
- **Overview** shows workspace metrics and tasks; **Inbox** is a separate activity feed for task comments and completions. Updates have persistent read state, unread filters and counts, a **Mark all as read** action, and links back to each task. The bell opens directly to unread updates.
- Tasks can be planned at **Beginner**, **Intermediate**, or **Hard** difficulty, filtered by level, estimated, and linked to prerequisites. The starter workspace includes examples at every level across its projects; use **Reset demo** to reload the expanded sample workspace.
- Complete tasks with the checkbox, then save ratings and an optional time review. Reopening clears completion ratings.
- Add comments from task details; filter by project or status. Search: **Ctrl+K** / **⌘K**.
- Use **Export backup** and **Import backup** for JSON backups. Import replaces current data; **Reset demo** restores sample data.

## Troubleshooting

- **Pages “Get Pages site failed” / “Not Found”:** select **GitHub Actions** in Pages settings, then rerun the failed workflow.
- **Missing or stale deployment:** check the latest Actions run and deployment branch; hard-refresh with **Ctrl+Shift+R** / **⌘Shift+R**.
- **Data missing or not saving:** check browser site-data permissions and restore a backup if available.

Storage is specific to the browser, device, and site URL. Export before switching or clearing browser data.
