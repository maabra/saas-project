const STORAGE_KEY = "orbit-workspace-v1";
const currentUser = { id: "JD", name: "Jamie Davis" };
const initialProjects = [
  { id: "website", name: "Website refresh", color: "violet" },
  { id: "brand", name: "Brand identity", color: "green" },
  { id: "launch", name: "Product launch", color: "orange" },
  { id: "content", name: "Content calendar", color: "blue" }
];
let loadWarning = false;

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function createInitialState() {
  return {
    projects: initialProjects,
    inboxRead: [],
    tasks: [
      { id: "task-1", title: "Finalize homepage wireframes", description: "Review the latest homepage wireframes with the team and collect final feedback before handoff.", project: "website", status: "in-progress", dueDate: daysFromNow(0), assignee: "JD", priority: "high", difficulty: "intermediate", comments: [{ id: "comment-1", author: "AL", text: "The updated hero section looks great. I left a couple of notes on the mobile flow.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }] },
      { id: "task-2", title: "Gather inspiration for color palette", description: "Put together a small collection of references for the refreshed brand palette.", project: "brand", status: "todo", dueDate: daysFromNow(1), assignee: "MK", priority: "medium", difficulty: "beginner", comments: [] },
      { id: "task-3", title: "Write launch announcement", description: "Draft a friendly product launch announcement for the newsletter and social channels.", project: "launch", status: "in-progress", dueDate: daysFromNow(2), assignee: "SC", priority: "high", difficulty: "intermediate", comments: [{ id: "comment-2", author: "JD", text: "Let's keep the first paragraph short and focus on the new collaboration features.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() }] },
      { id: "task-4", title: "Review Q4 content calendar", description: "Check dates, owners, and themes for the next content calendar.", project: "content", status: "todo", dueDate: daysFromNow(4), assignee: "AL", priority: "low", difficulty: "beginner", comments: [] },
      { id: "task-5", title: "Share moodboard with the team", description: "Share the initial moodboard and collect thoughts in the project comments.", project: "brand", status: "done", completedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), estimatedMinutes: 90, completionReview: { efficiency: 4, quality: 5, actualMinutes: 75, notes: "The shared reference board made review quick." }, dueDate: daysFromNow(-1), assignee: "JD", priority: "medium", difficulty: "intermediate", comments: [] },
      { id: "task-6", title: "Set up launch checklist", description: "Make sure each launch milestone has an owner and a clear due date.", project: "launch", status: "todo", dueDate: daysFromNow(5), assignee: "MK", priority: "medium", difficulty: "beginner", comments: [] },
      { id: "task-7", title: "Collect customer quotes", description: "Find a few short customer quotes for the new homepage.", project: "website", status: "done", completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), estimatedMinutes: 45, completionReview: { efficiency: 3, quality: 4, actualMinutes: 50, notes: "Next time, collect quotes as they arrive." }, dueDate: daysFromNow(-2), assignee: "SC", priority: "low", difficulty: "beginner", comments: [] },
      { id: "task-8", title: "Plan next week's social posts", description: "Draft post ideas and line them up with the product launch.", project: "content", status: "in-progress", dueDate: daysFromNow(3), assignee: "JD", priority: "medium", difficulty: "intermediate", comments: [] },
      { id: "task-9", title: "Create a simple welcome checklist", description: "List the first three steps a new customer should take. Keep each step short and link to the right help page.", project: "brand", status: "todo", dueDate: daysFromNow(6), assignee: "AL", priority: "low", difficulty: "beginner", estimatedMinutes: 30, dependencies: [], comments: [] },
      { id: "task-10", title: "Check homepage on mobile and tablet", description: "Review the homepage at phone, tablet, and desktop widths. Record layout issues in this task's comments and create subtasks for fixes the team agrees to make.", project: "website", status: "todo", dueDate: daysFromNow(3), assignee: "MK", priority: "medium", difficulty: "intermediate", estimatedMinutes: 75, dependencies: [], parentTaskId: "task-1", comments: [] },
      { id: "task-11", title: "Audit keyboard access and contrast", description: "Test the main conversion flow without a mouse. Record focus order, visible-focus, label, and contrast issues in task comments, then add subtasks for agreed fixes.", project: "website", status: "todo", dueDate: daysFromNow(8), assignee: "SC", priority: "high", difficulty: "hard", estimatedMinutes: 180, dependencies: [], parentTaskId: "task-10", comments: [] },
      { id: "task-12", title: "Prepare launch email subject lines", description: "Write five subject line options and preview text. Keep them clear, distinct, and within the team's character limit.", project: "launch", status: "todo", dueDate: daysFromNow(4), assignee: "JD", priority: "medium", difficulty: "beginner", estimatedMinutes: 40, dependencies: [], comments: [] },
      { id: "task-13", title: "Build release-day runbook", description: "Document launch owners, go/no-go checks, monitoring links, rollback criteria, and customer communications. Walk through a failure scenario with the team.", project: "launch", status: "todo", dueDate: daysFromNow(9), assignee: "MK", priority: "high", difficulty: "hard", estimatedMinutes: 240, dependencies: ["task-6", "task-3"], comments: [] },
      { id: "task-14", title: "Draft social posts from campaign themes", description: "Turn the three campaign themes into a week of social posts. Vary the format and include a clear next step in each post.", project: "content", status: "todo", dueDate: daysFromNow(5), assignee: "SC", priority: "medium", difficulty: "intermediate", estimatedMinutes: 90, dependencies: ["task-8"], comments: [] },
      { id: "task-15", title: "Recommend the next content experiment", description: "Compare recent engagement by channel and theme, note limitations in the data, and propose one measurable experiment with a success threshold.", project: "content", status: "todo", dueDate: daysFromNow(10), assignee: "AL", priority: "high", difficulty: "hard", estimatedMinutes: 150, dependencies: ["task-4", "task-14"], comments: [] },
      { id: "task-16", title: "Export brand colors with contrast notes", description: "Create reusable color swatches for the team and record which text/background pairings meet the agreed contrast target.", project: "brand", status: "todo", dueDate: daysFromNow(7), assignee: "JD", priority: "medium", difficulty: "intermediate", estimatedMinutes: 60, dependencies: ["task-2"], comments: [] },
      { id: "task-17", title: "Organize launch asset reviews", description: "Add a subtask for each launch asset that still needs review. Put the asset name and reviewer in the subtask description, then comment with the review result.", project: "launch", status: "todo", dueDate: daysFromNow(6), assignee: "SC", priority: "low", difficulty: "beginner", estimatedMinutes: 45, dependencies: [], parentTaskId: "task-6", comments: [] },
      { id: "task-18", title: "Review launch pricing scenarios", description: "Model the expected monthly revenue and support impact for three pricing options. State assumptions, edge cases, and a recommendation for review.", project: "launch", status: "todo", dueDate: daysFromNow(12), assignee: "AL", priority: "high", difficulty: "hard", estimatedMinutes: 210, dependencies: ["task-3"], comments: [] },
      { id: "task-19", title: "Prepare a five-minute project update", description: "Summarize progress, open decisions, risks, and the next milestone in a short update for the weekly team meeting.", project: "content", status: "todo", dueDate: daysFromNow(2), assignee: "JD", priority: "low", difficulty: "beginner", estimatedMinutes: 25, dependencies: [], comments: [] },
      { id: "task-20", title: "Compare campaign performance by audience", description: "Segment campaign results by audience, compare against the previous period, and explain which differences are meaningful versus likely noise.", project: "content", status: "todo", dueDate: daysFromNow(11), assignee: "MK", priority: "high", difficulty: "hard", estimatedMinutes: 180, dependencies: ["task-4"], comments: [] }
    ]
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialState();
    return parseWorkspace(JSON.parse(saved));
  } catch (error) {
    console.error("Unable to load the saved Orbit workspace.", error);
    loadWarning = true;
    return createInitialState();
  }
}

let state = loadState();
let activeFilter = "all";
let activeDifficulty = "all";
let activeInboxFilter = "all";
let activeProject = null;
let activeView = "overview";
let selectedTaskId = null;
let editingTaskId = null;
let completingTaskId = null;
let toastTimer;

const taskList = document.getElementById("taskList");
const projectNav = document.getElementById("projectNav");
const taskModal = document.getElementById("taskModal");
const detailModal = document.getElementById("detailModal");
const projectModal = document.getElementById("projectModal");
const completionModal = document.getElementById("completionModal");
const searchInput = document.getElementById("taskSearch");

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Unable to save the Orbit workspace.", error);
    showToast("Could not save changes. Check your browser storage settings.");
    return false;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function getProject(id) {
  return state.projects.find((project) => project.id === id);
}

function getPerson(id) {
  return ({ JD: "Jamie Davis", AL: "Alex Lee", MK: "Morgan Kim", SC: "Sam Chen" })[id] || "Teammate";
}

function formatDate(value) {
  if (!value) return "No date";
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  if (value === todayKey) return "Today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (value === tomorrow.toISOString().slice(0, 10)) return "Tomorrow";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function formatCommentDate(value) {
  const date = new Date(value);
  const now = Date.now();
  const hours = Math.floor((now - date.getTime()) / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return "Yesterday";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2800);
}

function createId(prefix) {
  const value = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${value}`;
}

function parseWorkspace(value) {
  if (!value || !Array.isArray(value.projects) || !Array.isArray(value.tasks) || value.projects.length === 0) {
    throw new Error("A backup must include at least one project and a task list.");
  }
  if (value.inboxRead !== undefined && (!Array.isArray(value.inboxRead) || value.inboxRead.some((id) => typeof id !== "string"))) {
    throw new Error("The backup has invalid inbox read state.");
  }
  const projectIds = new Set();
  for (const project of value.projects) {
    if (!project || typeof project.id !== "string" || !project.id || typeof project.name !== "string" || !project.name.trim()) {
      throw new Error("A project is missing its name or ID.");
    }
    if (projectIds.has(project.id)) throw new Error("Project IDs must be unique.");
    projectIds.add(project.id);
    if (!["violet", "green", "orange", "blue", "pink"].includes(project.color)) project.color = "violet";
  }
  const taskIds = new Set();
  for (const task of value.tasks) {
    if (!task || typeof task.id !== "string" || !task.id || typeof task.title !== "string" || !task.title.trim()) {
      throw new Error("A task is missing its title or ID.");
    }
    if (taskIds.has(task.id)) throw new Error("Task IDs must be unique.");
    taskIds.add(task.id);
    if (typeof task.description !== "string" && task.description !== undefined) throw new Error(`Task "${task.title}" has an invalid description.`);
    if (task.dueDate && (typeof task.dueDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) || Number.isNaN(Date.parse(`${task.dueDate}T12:00:00`)))) {
      throw new Error(`Task "${task.title}" has an invalid due date.`);
    }
    if (task.completedAt && (typeof task.completedAt !== "string" || Number.isNaN(Date.parse(task.completedAt)))) {
      throw new Error(`Task "${task.title}" has an invalid completion date.`);
    }
    if (!projectIds.has(task.project)) throw new Error(`Task "${task.title}" refers to a project that does not exist.`);
    if (!["todo", "in-progress", "done"].includes(task.status)) throw new Error(`Task "${task.title}" has an invalid status.`);
    if (!["beginner", "intermediate", "hard"].includes(task.difficulty)) task.difficulty = "intermediate";
    if (task.dependencies !== undefined && (!Array.isArray(task.dependencies) || task.dependencies.some((id) => typeof id !== "string"))) {
      throw new Error(`Task "${task.title}" has invalid prerequisites.`);
    }
    task.dependencies = [...new Set(task.dependencies || [])];
    if (task.parentTaskId !== undefined && task.parentTaskId !== null && typeof task.parentTaskId !== "string") {
      throw new Error(`Task "${task.title}" has an invalid parent task.`);
    }
    task.parentTaskId = task.parentTaskId || null;
    if (task.dependencies.includes(task.id)) throw new Error(`Task "${task.title}" cannot depend on itself.`);
    if (task.parentTaskId === task.id) throw new Error(`Task "${task.title}" cannot be its own parent.`);
    if (!["JD", "AL", "MK", "SC"].includes(task.assignee)) task.assignee = "JD";
    if (!["low", "medium", "high"].includes(task.priority)) task.priority = "medium";
    if (!Array.isArray(task.comments)) task.comments = [];
    task.comments = task.comments.map((comment) => {
      if (!comment || typeof comment.text !== "string") throw new Error(`Task "${task.title}" has an invalid comment.`);
      return {
        id: typeof comment.id === "string" ? comment.id : createId("comment"),
        author: ["JD", "AL", "MK", "SC"].includes(comment.author) ? comment.author : "JD",
        text: comment.text.slice(0, 500),
        createdAt: typeof comment.createdAt === "string" && !Number.isNaN(Date.parse(comment.createdAt)) ? comment.createdAt : new Date().toISOString()
      };
    });
    if (task.completionReview) {
      const review = task.completionReview;
      if (![1, 2, 3, 4, 5].includes(Number(review.efficiency)) || ![1, 2, 3, 4, 5].includes(Number(review.quality))) {
        throw new Error(`Task "${task.title}" has an invalid completion rating.`);
      }
      review.efficiency = Number(review.efficiency);
      review.quality = Number(review.quality);
      if (review.actualMinutes !== null && review.actualMinutes !== undefined && (!Number.isFinite(Number(review.actualMinutes)) || Number(review.actualMinutes) < 1)) {
        throw new Error(`Task "${task.title}" has an invalid actual time.`);
      }
      review.notes = typeof review.notes === "string" ? review.notes.slice(0, 500) : "";
    }
    if (task.estimatedMinutes !== null && task.estimatedMinutes !== undefined && (!Number.isFinite(Number(task.estimatedMinutes)) || Number(task.estimatedMinutes) < 1)) {
      throw new Error(`Task "${task.title}" has an invalid estimate.`);
    }
  }
  const taskById = new Map(value.tasks.map((task) => [task.id, task]));
  for (const task of value.tasks) {
    if (task.parentTaskId && !taskById.has(task.parentTaskId)) throw new Error(`Task "${task.title}" refers to a parent that does not exist.`);
    task.dependencies = task.dependencies.filter((dependencyId) => dependencyId !== task.parentTaskId);
    for (const dependencyId of task.dependencies) {
      if (!taskById.has(dependencyId)) throw new Error(`Task "${task.title}" refers to a prerequisite that does not exist.`);
    }
  }
  const visited = new Set();
  const visiting = new Set();
  function visit(taskId) {
    if (visiting.has(taskId)) throw new Error("Task prerequisites cannot contain a cycle.");
    if (visited.has(taskId)) return;
    visiting.add(taskId);
    for (const dependencyId of taskById.get(taskId).dependencies) visit(dependencyId);
    visiting.delete(taskId);
    visited.add(taskId);
  }
  for (const task of value.tasks) visit(task.id);
  const parentVisiting = new Set();
  const parentVisited = new Set();
  function visitParent(taskId) {
    if (parentVisiting.has(taskId)) throw new Error("Task nesting cannot contain a cycle.");
    if (parentVisited.has(taskId)) return;
    parentVisiting.add(taskId);
    const parentId = taskById.get(taskId).parentTaskId;
    if (parentId) visitParent(parentId);
    parentVisiting.delete(taskId);
    parentVisited.add(taskId);
  }
  for (const task of value.tasks) visitParent(task.id);
  const requirementVisiting = new Set();
  const requirementVisited = new Set();
  function visitRequirements(taskId) {
    if (requirementVisiting.has(taskId)) throw new Error("Task prerequisites and subtasks cannot create a completion cycle.");
    if (requirementVisited.has(taskId)) return;
    requirementVisiting.add(taskId);
    const task = taskById.get(taskId);
    const requiredTaskIds = [
      ...task.dependencies,
      ...value.tasks.filter((child) => child.parentTaskId === taskId).map((child) => child.id)
    ];
    for (const requiredTaskId of requiredTaskIds) visitRequirements(requiredTaskId);
    requirementVisiting.delete(taskId);
    requirementVisited.add(taskId);
  }
  for (const task of value.tasks) visitRequirements(task.id);
  let reopened;
  do {
    reopened = false;
    for (const task of value.tasks) {
      if (task.status === "done" && value.tasks.some((child) => child.parentTaskId === task.id && child.status !== "done")) {
        task.status = "todo";
        delete task.completedAt;
        delete task.completionReview;
        reopened = true;
      }
    }
  } while (reopened);
  return {
    projects: value.projects,
    tasks: value.tasks,
    inboxRead: [...new Set(value.inboxRead || [])]
  };
}

function getTask(id) {
  return state.tasks.find((task) => task.id === id);
}

function isTaskBlocked(task) {
  return task.status !== "done" && (
    (task.dependencies || []).some((id) => getTask(id)?.status !== "done") ||
    taskChildren(task.id).some((child) => child.status !== "done")
  );
}

function hasRequirementPath(fromId, toId, seen = new Set()) {
  if (fromId === toId) return true;
  if (seen.has(fromId)) return false;
  seen.add(fromId);
  const task = getTask(fromId);
  if (!task) return false;
  return [
    ...(task.dependencies || []),
    ...taskChildren(task.id).map((child) => child.id)
  ].some((id) => hasRequirementPath(id, toId, seen));
}

function taskChildren(taskId) {
  return state.tasks.filter((task) => task.parentTaskId === taskId);
}

function hasParentPath(fromId, toId) {
  let task = getTask(fromId);
  while (task) {
    if (task.id === toId) return true;
    task = task.parentTaskId ? getTask(task.parentTaskId) : null;
  }
  return false;
}

function taskTreeProgress(task) {
  return taskChildren(task.id).reduce((progress, child) => {
    const descendantProgress = taskTreeProgress(child);
    progress.total += 1 + descendantProgress.total;
    progress.done += (child.status === "done" ? 1 : 0) + descendantProgress.done;
    return progress;
  }, { done: 0, total: 0 });
}

function scopedTasks() {
  return state.tasks.filter((task) => {
    const matchesProject = !activeProject || task.project === activeProject;
    const matchesView = activeView !== "my-tasks" || task.assignee === currentUser.id;
    return matchesProject && matchesView;
  });
}

function filteredTasks() {
  const query = searchInput.value.trim().toLowerCase();
  return scopedTasks().filter((task) => {
    const matchesFilter = activeFilter === "all" || (activeFilter === "blocked" ? isTaskBlocked(task) : task.status === activeFilter);
    const matchesDifficulty = activeDifficulty === "all" || task.difficulty === activeDifficulty;
    const projectName = getProject(task.project)?.name || "";
    const matchesSearch = !query || `${task.title} ${task.description} ${projectName} ${task.difficulty}`.toLowerCase().includes(query);
    return matchesFilter && matchesDifficulty && matchesSearch;
  });
}

function renderProjects() {
  projectNav.innerHTML = state.projects.map((project) => {
    const count = state.tasks.filter((task) => task.project === project.id && task.status !== "done").length;
    return `<button class="project-link${activeProject === project.id ? " active" : ""}" type="button" data-project="${escapeHtml(project.id)}" aria-pressed="${activeProject === project.id}"><span class="project-color ${escapeHtml(project.color)}"></span><span>${escapeHtml(project.name)}</span><span class="project-task-count">${count}</span></button>`;
  }).join("");
  document.getElementById("myTaskCount").textContent = String(state.tasks.filter((task) => task.assignee === currentUser.id && task.status !== "done").length);
  const projectSelect = document.getElementById("taskProject");
  const currentValue = projectSelect.value;
  projectSelect.innerHTML = state.projects.map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`).join("");
  if (state.projects.some((project) => project.id === currentValue)) projectSelect.value = currentValue;
  renderDependencyOptions();
  renderInboxCount();
}

function getInboxActivities() {
  return state.tasks.flatMap((task) => [
    ...(task.completedAt && task.status === "done" ? [{
      id: `completed-${task.id}`,
      taskId: task.id,
      taskTitle: task.title,
      project: getProject(task.project)?.name || "No project",
      kind: "completed",
      createdAt: task.completedAt
    }] : []),
    ...task.comments.map((comment) => ({
      id: `comment-${comment.id}`,
      taskId: task.id,
      taskTitle: task.title,
      project: getProject(task.project)?.name || "No project",
      kind: "comment",
      author: comment.author,
      text: comment.text,
      createdAt: comment.createdAt
    }))
  ]).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 50);
}

function renderInboxCount() {
  const activities = getInboxActivities();
  const unreadCount = activities.filter((activity) => !state.inboxRead.includes(activity.id)).length;
  const sidebarCount = document.getElementById("inboxUnreadCount");
  const notificationCount = document.getElementById("notificationCount");
  sidebarCount.textContent = String(unreadCount);
  sidebarCount.hidden = unreadCount === 0;
  notificationCount.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
  notificationCount.hidden = unreadCount === 0;
  document.getElementById("notificationButton").setAttribute(
    "aria-label",
    unreadCount ? `Open inbox, ${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "Open inbox"
  );
}

function renderDependencyOptions(selectedIds) {
  const select = document.getElementById("taskDependencies");
  if (!select) return;
  const task = editingTaskId && getTask(editingTaskId);
  const selected = new Set(selectedIds === undefined ? task?.dependencies || [] : selectedIds);
  select.innerHTML = state.tasks
    .filter((item) => item.id !== editingTaskId && (!editingTaskId || !hasRequirementPath(item.id, editingTaskId)))
    .map((item) => `<option value="${escapeHtml(item.id)}"${selected.has(item.id) ? " selected" : ""}>${escapeHtml(item.title)}${item.status === "done" ? " · completed" : ""}</option>`)
    .join("");
  renderParentOptions();
}

function renderParentOptions(selectedParentId) {
  const select = document.getElementById("taskParent");
  if (!select) return;
  const task = editingTaskId && getTask(editingTaskId);
  const selected = selectedParentId === undefined ? task?.parentTaskId || "" : selectedParentId || "";
  const descendants = new Set();
  function collectDescendants(id) {
    taskChildren(id).forEach((child) => {
      descendants.add(child.id);
      collectDescendants(child.id);
    });
  }
  if (editingTaskId) collectDescendants(editingTaskId);
  select.innerHTML = `<option value="">No parent task</option>${state.tasks
    .filter((item) => item.id !== editingTaskId && !descendants.has(item.id) && (!editingTaskId || !hasRequirementPath(editingTaskId, item.id)))
    .map((item) => `<option value="${escapeHtml(item.id)}"${selected === item.id ? " selected" : ""}>${escapeHtml(item.title)}</option>`)
    .join("")}`;
}

function renderStats() {
  const open = state.tasks.filter((task) => task.status !== "done");
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const completed = state.tasks.filter((task) => task.status === "done" && task.completedAt && new Date(task.completedAt) >= weekStart).length;
  const reviewed = state.tasks.filter((task) => task.status === "done" && task.completionReview);
  const averageEfficiency = reviewed.length ? reviewed.reduce((sum, task) => sum + Number(task.completionReview.efficiency), 0) / reviewed.length : null;
  const averageQuality = reviewed.length ? reviewed.reduce((sum, task) => sum + Number(task.completionReview.quality), 0) / reviewed.length : null;
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const due = open.filter((task) => task.dueDate && new Date(`${task.dueDate}T12:00:00`) <= weekEnd).length;
  document.getElementById("openStat").textContent = String(open.length).padStart(2, "0");
  document.getElementById("completedStat").textContent = String(completed).padStart(2, "0");
  document.getElementById("dueStat").textContent = String(due).padStart(2, "0");
  document.getElementById("efficiencyStat").textContent = averageEfficiency === null ? "—" : `${averageEfficiency.toFixed(1)}/5`;
  document.getElementById("qualityStat").textContent = averageQuality === null ? "Rate completed tasks" : `${averageQuality.toFixed(1)}/5 avg. quality`;
  const total = state.tasks.length;
  const done = state.tasks.filter((task) => task.status === "done").length;
  const percentage = total ? Math.round((done / total) * 100) : 0;
  document.getElementById("progressBar").style.width = `${percentage}%`;
  document.getElementById("progressLabel").textContent = `${done} of ${total} tasks completed`;
  document.getElementById("progressCopy").textContent = done ? `${percentage}% of your tasks are complete. Keep that momentum going!` : "Small steps add up. Pick a task and get started!";
}

function statusLabel(status) {
  return ({ todo: "To do", "in-progress": "In progress", done: "Completed" })[status] || "To do";
}

function difficultyLabel(difficulty) {
  return ({ beginner: "Beginner", intermediate: "Intermediate", hard: "Hard" })[difficulty] || "Intermediate";
}

function taskRow(task) {
  const project = getProject(task.project);
  const isOverdue = task.status !== "done" && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10);
  const blocked = isTaskBlocked(task);
  const label = blocked ? "Blocked" : statusLabel(task.status);
  const tree = taskTreeProgress(task);
  const children = taskChildren(task.id);
  return `<article class="task-row" data-task-row="${escapeHtml(task.id)}">
    <div class="task-main">
      <button class="task-check${task.status === "done" ? " completed" : ""}" type="button" data-toggle-task="${escapeHtml(task.id)}" aria-label="${task.status === "done" ? "Reopen" : "Complete and review"}: ${escapeHtml(task.title)}">${task.status === "done" ? '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m2 6 2.5 2.5L10 3"/></svg>' : ""}</button>
      <div class="task-title-wrap" role="button" tabindex="0" data-open-task="${escapeHtml(task.id)}" aria-label="Open ${escapeHtml(task.title)}"><span class="task-title${task.status === "done" ? " is-done" : ""}">${escapeHtml(task.title)}</span><span class="task-row-subtitle"><span class="task-project-mobile">${escapeHtml(project?.name || "No project")}</span><span class="difficulty-badge difficulty-${escapeHtml(task.difficulty)}">${difficultyLabel(task.difficulty)}</span>${task.parentTaskId ? '<span class="subtask-indicator">Subtask</span>' : ""}${children.length ? `<span class="subtask-progress">${tree.done}/${tree.total} subtasks</span>` : ""}</span></div>
    </div>
    <span class="task-project"><span class="project-color ${escapeHtml(project?.color || "violet")}"></span>${escapeHtml(project?.name || "No project")}</span>
    <span class="status-pill status-${blocked ? "blocked" : escapeHtml(task.status)}">${label}</span>
    <span class="task-due${isOverdue ? " overdue" : ""}">${escapeHtml(formatDate(task.dueDate))}</span>
    <span class="task-meta"><span class="task-comments" aria-label="${task.comments.length} comments"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 7.5a5.5 5.5 0 0 1-8.2 4.8L2.5 13l.7-2.4a5.5 5.5 0 1 1 10.3-3.1Z"/></svg>${task.comments.length}</span><span class="assignee assignee-${escapeHtml(task.assignee)}" title="${escapeHtml(getPerson(task.assignee))}">${escapeHtml(task.assignee)}</span><i class="priority-dot ${escapeHtml(task.priority)}" title="${escapeHtml(task.priority)} priority"></i>${task.completionReview ? `<span class="task-rating" title="Efficiency ${task.completionReview.efficiency}/5 · Quality ${task.completionReview.quality}/5">★ ${task.completionReview.efficiency}</span>` : ""}</span>
  </article>`;
}

function renderTasks() {
  const inbox = activeView === "inbox" && !activeProject;
  document.getElementById("workspaceSummary").style.display = inbox ? "none" : "";
  document.getElementById("weeklyProgress").style.display = inbox ? "none" : "";
  document.getElementById("taskToolbar").style.display = inbox ? "none" : "";
  document.getElementById("inboxToolbar").hidden = !inbox;
  document.getElementById("viewAllButton").style.display = inbox ? "none" : "";
  if (inbox) {
    renderInbox();
    return;
  }
  const scoped = scopedTasks();
  const tasks = filteredTasks();
  taskList.innerHTML = tasks.length ? tasks.map(taskRow).join("") : '<div class="task-empty"><strong>Nothing on your plate</strong>Try another filter, or create a task to get started.</div>';
  document.getElementById("allCount").textContent = String(scoped.length);
  const difficultyCounts = ["beginner", "intermediate", "hard"].map((difficulty) =>
    `${scoped.filter((task) => task.difficulty === difficulty).length} ${difficultyLabel(difficulty).toLowerCase()}`
  ).join(" · ");
  document.getElementById("listFooter").innerHTML = `<span>Showing ${tasks.length} of ${scoped.length} tasks <span class="difficulty-counts">${difficultyCounts}</span></span><button type="button" data-clear-filters>Clear filters</button>`;
  renderStats();
}

function renderInbox() {
  const activities = getInboxActivities();
  const unreadCount = activities.filter((activity) => !state.inboxRead.includes(activity.id)).length;
  document.getElementById("inboxUnreadLabel").textContent = `${unreadCount} unread`;
  document.getElementById("markAllReadButton").disabled = unreadCount === 0;
  document.querySelectorAll("[data-inbox-filter]").forEach((button) => {
    const selected = button.dataset.inboxFilter === activeInboxFilter;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  const visibleActivities = activities.filter((activity) =>
    activeInboxFilter === "all" || !state.inboxRead.includes(activity.id)
  );

  taskList.innerHTML = visibleActivities.length
    ? visibleActivities.map((activity) => {
      const unread = !state.inboxRead.includes(activity.id);
      return `<button class="activity-item${unread ? " is-unread" : ""}" type="button" data-open-task="${escapeHtml(activity.taskId)}" data-activity-id="${escapeHtml(activity.id)}" aria-label="${unread ? "Unread update: " : ""}${activity.kind === "completed" ? `${escapeHtml(activity.taskTitle)} was completed` : `${escapeHtml(getPerson(activity.author))} commented on ${escapeHtml(activity.taskTitle)}`}">
        <span class="activity-icon ${activity.kind === "completed" ? "activity-icon-completed" : "activity-icon-comment"}" aria-hidden="true">${activity.kind === "completed" ? "✓" : '<svg viewBox="0 0 16 16"><path d="M13.5 7.5a5.5 5.5 0 0 1-8.2 4.8L2.5 13l.7-2.4a5.5 5.5 0 1 1 10.3-3.1Z"/></svg>'}</span>
        <span class="activity-copy">
          <span class="activity-summary">${activity.kind === "completed" ? `<strong>${escapeHtml(activity.taskTitle)}</strong> was completed` : `<strong>${escapeHtml(getPerson(activity.author))}</strong> commented on <strong>${escapeHtml(activity.taskTitle)}</strong>`}</span>
          ${activity.kind === "comment" ? `<span class="activity-excerpt">${escapeHtml(activity.text)}</span>` : ""}
          <span class="activity-project">${escapeHtml(activity.project)}</span>
        </span>
        ${unread ? '<span class="activity-unread-dot" aria-label="Unread"></span>' : ""}
        <time class="activity-time" datetime="${escapeHtml(activity.createdAt)}">${escapeHtml(formatCommentDate(activity.createdAt))}</time>
      </button>`;
    }).join("")
    : activeInboxFilter === "unread"
      ? '<div class="task-empty"><strong>You’re all caught up</strong>New comments and completed work will appear here.</div>'
      : '<div class="task-empty"><strong>No activity yet</strong>Comments and completed tasks will show up here.</div>';
  document.getElementById("allCount").textContent = String(visibleActivities.length);
  document.getElementById("listFooter").innerHTML = `<span>${visibleActivities.length ? `Showing ${visibleActivities.length} ${activeInboxFilter === "unread" ? "unread " : "recent "}update${visibleActivities.length === 1 ? "" : "s"}` : "Your latest workspace activity will appear here."}</span>`;
}

function updatePageHeading() {
  const project = activeProject && getProject(activeProject);
  let title = "Overview";
  let pageTitle = "Good morning, Jamie <span class=\"wave\" aria-hidden=\"true\">✳</span>";
  let subtitle = "Here's what's happening across your projects.";
  let sectionTitle = "Your tasks";
  let description = "A good day starts with a clear plan.";
  if (project) {
    title = project.name;
    pageTitle = escapeHtml(project.name);
    subtitle = "A little progress goes a long way.";
    sectionTitle = `${escapeHtml(project.name)} tasks`;
    description = "Keep your project moving, one task at a time.";
  } else if (activeView === "my-tasks") {
    title = "My tasks";
    pageTitle = "Your task list";
    subtitle = "Everything you’re working on, in one place.";
    sectionTitle = "Assigned to you";
    description = "Here’s what’s on your plate.";
  } else if (activeView === "inbox") {
    title = "Inbox";
    pageTitle = "Your inbox";
    subtitle = "A live feed of comments and completed work across your projects.";
    sectionTitle = "Recent activity";
    description = "Open an update to jump straight into its task.";
  }
  document.getElementById("breadcrumbCurrent").textContent = title;
  document.getElementById("pageTitle").innerHTML = pageTitle;
  document.getElementById("pageSubtitle").textContent = subtitle;
  document.getElementById("taskSectionTitle").textContent = sectionTitle;
  document.getElementById("taskSectionDescription").textContent = description;
}

function render() {
  updatePageHeading();
  document.getElementById("difficultyFilter").value = activeDifficulty;
  renderProjects();
  renderTasks();
  document.querySelectorAll(".main-nav .nav-item").forEach((item) => {
    const selected = !activeProject && item.dataset.view === activeView;
    item.classList.toggle("active", selected);
    item.setAttribute("aria-current", selected ? "page" : "false");
  });
  document.querySelectorAll(".project-link").forEach((item) => item.classList.toggle("active", item.dataset.project === activeProject));
  document.querySelectorAll(".filter-tab").forEach((item) => {
    const selected = item.dataset.filter === activeFilter;
    item.classList.toggle("selected", selected);
    item.setAttribute("aria-selected", String(selected));
  });
}

function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;
  if (task.status !== "done") {
    if (isTaskBlocked(task)) {
      showToast("Complete this task's prerequisites and subtasks before marking it done.");
      return;
    }
    openCompletionReview(task.id);
    return;
  }
  task.status = "todo";
  delete task.completedAt;
  delete task.completionReview;
  const reopenedAncestors = reopenCompletedAncestors(task.parentTaskId ? getTask(task.parentTaskId) : null);
  const saved = saveState();
  render();
  if (detailModal.open) renderTaskDetails();
  if (saved) showToast(reopenedAncestors ? `Task reopened with ${reopenedAncestors} parent task${reopenedAncestors === 1 ? "" : "s"}; completion reviews were cleared.` : "Task reopened. Its completion ratings were cleared.");
}

function reopenCompletedAncestors(task) {
  let reopened = 0;
  let current = task;
  while (current) {
    if (current.status === "done") {
      current.status = "todo";
      delete current.completedAt;
      delete current.completionReview;
      reopened += 1;
    }
    current = current.parentTaskId ? getTask(current.parentTaskId) : null;
  }
  return reopened;
}

function openTaskDetails(id) {
  selectedTaskId = id;
  renderTaskDetails();
  if (!detailModal.open) detailModal.showModal();
}

function renderTaskDetails() {
  const task = state.tasks.find((item) => item.id === selectedTaskId);
  if (!task) {
    detailModal.close();
    return;
  }
  const projectOptions = state.projects.map((project) => `<option value="${escapeHtml(project.id)}"${project.id === task.project ? " selected" : ""}>${escapeHtml(project.name)}</option>`).join("");
  const dependencies = (task.dependencies || []).map((id) => getTask(id)).filter(Boolean);
  const blockedBy = dependencies.filter((dependency) => dependency.status !== "done");
  const children = taskChildren(task.id);
  const progress = taskTreeProgress(task);
  const parent = task.parentTaskId ? getTask(task.parentTaskId) : null;
  const dependencySection = dependencies.length
    ? `<section class="dependency-section"><h3>Prerequisites <span>${dependencies.length}</span></h3><ul>${dependencies.map((dependency) => `<li><button type="button" class="dependency-link${dependency.status === "done" ? " is-complete" : ""}" data-open-task="${escapeHtml(dependency.id)}">${escapeHtml(dependency.title)}</button><span>${dependency.status === "done" ? "Complete" : "Still open"}</span></li>`).join("")}</ul>${blockedBy.length ? `<p class="blocked-note">This task is blocked until ${blockedBy.length === 1 ? "its prerequisite is" : "all prerequisites are"} complete.</p>` : ""}</section>`
    : "";
  const hierarchySection = children.length || parent
    ? `<section class="task-hierarchy">
        ${parent ? `<div class="parent-task-row"><span>Part of</span><button type="button" class="dependency-link" data-open-task="${escapeHtml(parent.id)}">${escapeHtml(parent.title)}</button></div>` : ""}
        ${children.length ? `<div class="subtask-heading"><div><h3>Subtasks</h3><span>${progress.done} of ${progress.total} complete</span></div><button class="text-action" type="button" data-add-subtask="${escapeHtml(task.id)}">Add subtask</button></div><div class="subtask-progress-track" role="progressbar" aria-label="Subtask progress" aria-valuenow="${progress.done}" aria-valuemin="0" aria-valuemax="${progress.total}"><span style="width:${progress.total ? Math.round(progress.done / progress.total * 100) : 0}%"></span></div><ul class="subtask-list">${children.map((child) => `<li><button type="button" class="subtask-link" data-open-task="${escapeHtml(child.id)}">${escapeHtml(child.title)}</button><span class="difficulty-badge difficulty-${escapeHtml(child.difficulty)}">${difficultyLabel(child.difficulty)}</span><span class="status-pill status-${isTaskBlocked(child) ? "blocked" : escapeHtml(child.status)}">${isTaskBlocked(child) ? "Blocked" : statusLabel(child.status)}</span></li>`).join("")}</ul>` : ""}
      </section>`
    : `<section class="task-hierarchy empty-hierarchy"><button class="text-action" type="button" data-add-subtask="${escapeHtml(task.id)}">+ Add a subtask</button></section>`;
  const comments = task.comments.length ? task.comments.map((comment) => `<article class="comment"><span class="assignee assignee-${escapeHtml(comment.author)}">${escapeHtml(comment.author)}</span><div class="comment-body"><div class="comment-byline"><strong>${escapeHtml(getPerson(comment.author))}</strong><time datetime="${escapeHtml(comment.createdAt)}">${escapeHtml(formatCommentDate(comment.createdAt))}</time></div><p class="comment-text">${escapeHtml(comment.text)}</p></div></article>`).join("") : '<p class="comment-empty">No comments yet. Start the conversation.</p>';
  const review = task.completionReview;
  const reviewCard = review
    ? `<section class="review-card"><div class="review-card-heading"><h3>Completion review</h3><button class="text-action" type="button" data-edit-review>Edit review</button></div><div class="review-metrics"><span><strong>${escapeHtml(review.efficiency)}/5</strong> efficiency</span><span><strong>${escapeHtml(review.quality)}/5</strong> quality</span>${review.actualMinutes ? `<span><strong>${escapeHtml(review.actualMinutes)} min</strong> actual${task.estimatedMinutes ? ` · ${escapeHtml(task.estimatedMinutes)} min estimated` : ""}</span>` : ""}</div>${review.notes ? `<p>${escapeHtml(review.notes)}</p>` : ""}</section>`
    : task.status === "done" ? '<section class="review-card"><div class="review-card-heading"><h3>Completion review</h3><button class="text-action" type="button" data-edit-review>Add review</button></div><p>Add an efficiency and quality rating to learn from this task.</p></section>' : "";
  document.getElementById("detailContent").innerHTML = `
    <div class="detail-title-row"><h2 class="detail-title">${escapeHtml(task.title)}</h2><div class="detail-actions"><button class="text-action" type="button" data-edit-task>Edit</button><button class="text-action danger-action" type="button" data-delete-task>Delete</button></div></div>
    <p class="detail-description">${escapeHtml(task.description || "No description added yet.")}</p>
    <div class="detail-properties">
      <label class="detail-property"><span class="detail-property-label">Status</span><span class="detail-property-value"><select data-task-field="status" aria-label="Task status"><option value="todo"${task.status === "todo" ? " selected" : ""}>To do</option><option value="in-progress"${task.status === "in-progress" ? " selected" : ""}>In progress</option><option value="done"${task.status === "done" ? " selected" : ""}>${task.completionReview ? "Completed" : "Completed (add review)"}</option></select></span></label>
      <label class="detail-property"><span class="detail-property-label">Difficulty</span><span class="detail-property-value"><select data-task-field="difficulty" aria-label="Task difficulty"><option value="beginner"${task.difficulty === "beginner" ? " selected" : ""}>Beginner</option><option value="intermediate"${task.difficulty === "intermediate" ? " selected" : ""}>Intermediate</option><option value="hard"${task.difficulty === "hard" ? " selected" : ""}>Hard</option></select></span></label>
      <label class="detail-property"><span class="detail-property-label">Parent task</span><span class="detail-property-value"><select data-task-field="parentTaskId" aria-label="Parent task"><option value="">None</option>${state.tasks.filter((item) => item.id !== task.id && !hasParentPath(item.id, task.id) && !hasRequirementPath(task.id, item.id)).map((item) => `<option value="${escapeHtml(item.id)}"${task.parentTaskId === item.id ? " selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></span></label>
      <label class="detail-property"><span class="detail-property-label">Project</span><span class="detail-property-value"><select data-task-field="project" aria-label="Task project">${projectOptions}</select></span></label>
      <div class="detail-property"><span class="detail-property-label">Assignee</span><span class="detail-property-value"><span class="assignee assignee-${escapeHtml(task.assignee)}">${escapeHtml(task.assignee)}</span>${escapeHtml(getPerson(task.assignee))}</span></div>
      <div class="detail-property"><span class="detail-property-label">Due date</span><span class="detail-property-value">${escapeHtml(formatDate(task.dueDate))}</span></div>
    </div>
    ${hierarchySection}
    ${dependencySection}
    ${task.estimatedMinutes ? `<p class="estimate-line">Estimated effort: <strong>${escapeHtml(task.estimatedMinutes)} minutes</strong></p>` : ""}
    ${reviewCard}
    <section class="comments-section"><h3 class="comments-heading">Comments <span>${task.comments.length}</span></h3><div class="comment-list" id="commentList">${comments}</div>
      <form class="comment-form" id="commentForm"><span class="avatar avatar-sage">JD</span><textarea class="text-input comment-input" name="comment" rows="1" maxlength="500" aria-label="Write a comment" placeholder="Write a comment..." required></textarea><button class="button button-primary comment-submit" type="submit">Send</button></form>
    </section>`;
}

function openTaskForm(taskId = null, parentTaskId = null) {
  editingTaskId = taskId;
  const form = document.getElementById("taskForm");
  const task = taskId ? state.tasks.find((item) => item.id === taskId) : null;
  form.reset();
  renderDependencyOptions(task?.dependencies || []);
  renderParentOptions(task ? task.parentTaskId : parentTaskId);
  document.getElementById("taskModalTitle").textContent = task ? "Edit task" : "Create a task";
  document.getElementById("taskModalKicker").textContent = task ? "UPDATE YOUR WORKSPACE" : "ADD TO YOUR WORKSPACE";
  form.querySelector('[type="submit"]').textContent = task ? "Save changes" : "Create task";
  if (task) {
    form.elements.title.value = task.title;
    form.elements.description.value = task.description || "";
    form.elements.project.value = task.project;
    form.elements.dueDate.value = task.dueDate || "";
    form.elements.assignee.value = task.assignee;
    form.elements.priority.value = task.priority;
    form.elements.difficulty.value = task.difficulty;
    form.elements.estimatedMinutes.value = task.estimatedMinutes || "";
    form.elements.parentTaskId.value = task.parentTaskId || "";
  } else if (activeProject) {
    form.elements.project.value = activeProject;
  }
  taskModal.showModal();
  document.getElementById("taskName").focus();
}

function openCompletionReview(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  completingTaskId = taskId;
  const form = document.getElementById("completionForm");
  form.reset();
  document.getElementById("completionTaskName").textContent = task.title;
  document.getElementById("efficiencyRating").value = String(task.completionReview?.efficiency || 3);
  document.getElementById("qualityRating").value = String(task.completionReview?.quality || 3);
  document.getElementById("actualMinutes").value = task.completionReview?.actualMinutes || "";
  document.getElementById("completionNotes").value = task.completionReview?.notes || "";
  document.getElementById("estimateComparison").textContent = task.estimatedMinutes ? `Estimated: ${task.estimatedMinutes} min` : "No estimate set";
  completionModal.showModal();
  document.getElementById("efficiencyRating").focus();
}

function exportBackup() {
  const backup = { app: "orbit", version: 1, exportedAt: new Date().toISOString(), ...state };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orbit-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Backup downloaded.");
}

async function importBackup(file) {
  if (!file) return;
  try {
    const imported = JSON.parse(await file.text());
    if (imported.app !== "orbit" || imported.version !== 1) throw new Error("This is not a supported Orbit backup file.");
    const nextState = parseWorkspace(imported);
    if (!window.confirm("Replace the current workspace with this backup? Export a backup first if you want to keep both.")) return;
    state = nextState;
    activeProject = null;
    activeView = "overview";
    activeFilter = "all";
    activeDifficulty = "all";
    searchInput.value = "";
    const saved = saveState();
    render();
    if (saved) showToast("Backup restored successfully.");
  } catch (error) {
    console.error("Unable to import the Orbit backup.", error);
    showToast(`Import failed: ${error.message}`);
  } finally {
    document.getElementById("importFile").value = "";
  }
}

function handleNewTask(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const dependencies = [...new Set(formData.getAll("dependencies").map(String))].filter((id) => id !== editingTaskId);
  const parentTaskId = String(formData.get("parentTaskId") || "") || null;
  if (dependencies.some((id) => !getTask(id))) {
    showToast("A selected prerequisite no longer exists. Refresh the form and try again.");
    return;
  }
  if (editingTaskId && dependencies.some((id) => hasRequirementPath(id, editingTaskId))) {
    showToast("That prerequisite would create a completion cycle with the current task hierarchy. Choose another task.");
    return;
  }
  const taskRequirements = [
    ...dependencies,
    ...(editingTaskId ? taskChildren(editingTaskId).map((child) => child.id) : [])
  ];
  if (parentTaskId && (
    !getTask(parentTaskId) ||
    parentTaskId === editingTaskId ||
    hasParentPath(parentTaskId, editingTaskId) ||
    taskRequirements.some((id) => hasRequirementPath(id, parentTaskId))
  )) {
    showToast("That parent would create an invalid hierarchy or completion cycle. Choose another task.");
    return;
  }
  const taskFields = {
    title,
    description: String(formData.get("description") || "").trim(),
    project: String(formData.get("project") || state.projects[0]?.id || ""),
    dueDate: String(formData.get("dueDate") || ""),
    assignee: String(formData.get("assignee") || currentUser.id),
    priority: String(formData.get("priority") || "medium"),
    difficulty: String(formData.get("difficulty") || "intermediate"),
    estimatedMinutes: Number(formData.get("estimatedMinutes")) || null,
    parentTaskId,
    dependencies
  };
  const updatedTaskId = editingTaskId;
  let createdTaskId = null;
  let previousParentTaskId = null;
  if (editingTaskId) {
    const task = state.tasks.find((item) => item.id === editingTaskId);
    if (!task) {
      showToast("This task no longer exists. Refresh the page and try again.");
      return;
    }
    previousParentTaskId = task.parentTaskId || null;
    Object.assign(task, taskFields);
    if (parentTaskId && previousParentTaskId !== parentTaskId) reopenCompletedAncestors(getTask(parentTaskId));
  } else {
    createdTaskId = createId("task");
    state.tasks.unshift({ id: createdTaskId, ...taskFields, status: "todo", comments: [] });
    if (parentTaskId) reopenCompletedAncestors(getTask(parentTaskId));
  }
  const wasEditing = Boolean(editingTaskId);
  editingTaskId = null;
  activeProject = null;
  activeView = "overview";
  activeFilter = "all";
  activeDifficulty = "all";
  searchInput.value = "";
  const saved = saveState();
  render();
  taskModal.close();
  event.currentTarget.reset();
  if (wasEditing) openTaskDetails(updatedTaskId);
  else if (parentTaskId) openTaskDetails(createdTaskId);
  if (saved) showToast(wasEditing ? "Task updated." : "Task created. You're off to a great start!");
}

function handleNewProject(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const project = { id: createId("project"), name, color: String(formData.get("color") || "violet") };
  state.projects.push(project);
  activeProject = project.id;
  activeView = "overview";
  const saved = saveState();
  render();
  projectModal.close();
  event.currentTarget.reset();
  if (saved) showToast("Project created. Add your first task when you're ready.");
}

function setDateLabel() {
  const dateText = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  document.getElementById("todayLabel").textContent = dateText.toUpperCase();
}

document.querySelectorAll(".filter-tab").forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  render();
}));
document.getElementById("difficultyFilter").addEventListener("change", (event) => {
  activeDifficulty = event.currentTarget.value;
  render();
});

document.querySelectorAll(".main-nav .nav-item").forEach((button) => button.addEventListener("click", () => {
  activeView = button.dataset.view;
  activeProject = null;
  activeFilter = "all";
  activeDifficulty = "all";
  render();
}));

projectNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project]");
  if (!button) return;
  activeProject = button.dataset.project;
  activeView = "overview";
  activeFilter = "all";
  activeDifficulty = "all";
  render();
});

taskList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-task]");
  if (toggle) {
    toggleTask(toggle.dataset.toggleTask);
    return;
  }
  const open = event.target.closest("[data-open-task]");
  if (open) {
    const activityId = open.dataset.activityId;
    if (activityId && !state.inboxRead.includes(activityId)) {
      state.inboxRead.push(activityId);
      saveState();
      render();
    }
    openTaskDetails(open.dataset.openTask);
    return;
  }
  if (event.target.closest("[data-clear-filters]")) {
    activeProject = null;
    activeFilter = "all";
    activeDifficulty = "all";
    activeView = "overview";
    searchInput.value = "";
    render();
  }
});

document.querySelectorAll("[data-inbox-filter]").forEach((button) => button.addEventListener("click", () => {
  activeInboxFilter = button.dataset.inboxFilter;
  render();
}));

document.getElementById("markAllReadButton").addEventListener("click", () => {
  const activities = getInboxActivities();
  const unreadCount = activities.filter((activity) => !state.inboxRead.includes(activity.id)).length;
  if (!unreadCount) return;
  state.inboxRead = activities.map((activity) => activity.id);
  const saved = saveState();
  render();
  if (saved) showToast(`Marked ${unreadCount} update${unreadCount === 1 ? "" : "s"} as read.`);
});

taskList.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-open-task]")) {
    event.preventDefault();
    openTaskDetails(event.target.dataset.openTask);
  }
});

searchInput.addEventListener("input", renderTasks);
document.getElementById("taskForm").addEventListener("submit", handleNewTask);
document.getElementById("projectForm").addEventListener("submit", handleNewProject);
document.getElementById("completionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const task = state.tasks.find((item) => item.id === completingTaskId);
  if (!task) {
    completionModal.close();
    showToast("This task no longer exists. Refresh the page and try again.");
    return;
  }
  if (isTaskBlocked(task)) {
    completionModal.close();
    showToast("Complete this task's prerequisites and subtasks before marking it done.");
    return;
  }
  const formData = new FormData(event.currentTarget);
  task.status = "done";
  task.completedAt = new Date().toISOString();
  task.completionReview = {
    efficiency: Number(formData.get("efficiency")),
    quality: Number(formData.get("quality")),
    actualMinutes: Number(formData.get("actualMinutes")) || null,
    notes: String(formData.get("notes") || "").trim()
  };
  const saved = saveState();
  render();
  if (detailModal.open) renderTaskDetails();
  completionModal.close();
  if (saved) showToast("Task completed and reviewed. Nice work!");
});
document.getElementById("newTaskButton").addEventListener("click", () => openTaskForm());
document.getElementById("addProjectButton").addEventListener("click", () => projectModal.showModal());
document.getElementById("exportButton").addEventListener("click", exportBackup);
document.getElementById("importButton").addEventListener("click", () => document.getElementById("importFile").click());
document.getElementById("importFile").addEventListener("change", (event) => importBackup(event.currentTarget.files[0]));
document.getElementById("resetButton").addEventListener("click", () => {
  if (!window.confirm("Reset this browser's Orbit data to the original demo? This replaces all current tasks and comments.")) return;
  state = createInitialState();
  activeProject = null;
  activeView = "overview";
  activeFilter = "all";
  activeDifficulty = "all";
  searchInput.value = "";
  const saved = saveState();
  render();
  if (saved) showToast("Demo workspace restored.");
});
document.getElementById("viewAllButton").addEventListener("click", () => {
  activeFilter = "all";
  activeProject = null;
  activeView = "overview";
  activeDifficulty = "all";
  searchInput.value = "";
  render();
});

document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close]");
  if (close) close.closest("dialog").close();
});

[taskModal, detailModal, projectModal, completionModal].forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
}));

detailModal.addEventListener("change", (event) => {
  const field = event.target.dataset.taskField;
  if (!field) return;
  const task = state.tasks.find((item) => item.id === selectedTaskId);
  if (!task) return;
  if (field === "status" && event.target.value === "done" && task.status !== "done") {
    if (isTaskBlocked(task)) {
      showToast("Complete this task's prerequisites and subtasks before marking it done.");
      renderTaskDetails();
      return;
    }
    renderTaskDetails();
    openCompletionReview(task.id);
    return;
  }
  const value = event.target.value;
  if (field === "parentTaskId") {
    if (value && (!getTask(value) || value === task.id || hasParentPath(value, task.id) || hasRequirementPath(task.id, value))) {
      showToast("That parent would create an invalid hierarchy or completion cycle. Choose another task.");
      renderTaskDetails();
      return;
    }
    const previousParentTaskId = task.parentTaskId || null;
    task.parentTaskId = value || null;
    if (task.parentTaskId && task.parentTaskId !== previousParentTaskId) reopenCompletedAncestors(getTask(task.parentTaskId));
  } else {
    task[field] = value;
  }
  if (field === "status" && task.status !== "done") {
    delete task.completedAt;
    delete task.completionReview;
  }
  saveState();
  render();
  renderTaskDetails();
});

detailModal.addEventListener("click", (event) => {
  const openTask = event.target.closest("[data-open-task]");
  if (openTask) {
    openTaskDetails(openTask.dataset.openTask);
  } else if (event.target.closest("[data-add-subtask]")) {
    const parentTaskId = event.target.closest("[data-add-subtask]").dataset.addSubtask;
    detailModal.close();
    openTaskForm(null, parentTaskId);
  } else if (event.target.closest("[data-edit-task]")) {
    const taskId = selectedTaskId;
    detailModal.close();
    openTaskForm(taskId);
  } else if (event.target.closest("[data-delete-task]")) {
    const task = state.tasks.find((item) => item.id === selectedTaskId);
    if (!task || !window.confirm(`Delete "${task.title}" and its comments? This cannot be undone unless you have a backup.`)) return;
    const affected = state.tasks.filter((item) => (item.dependencies || []).includes(task.id));
    affected.forEach((item) => { item.dependencies = item.dependencies.filter((id) => id !== task.id); });
    const children = taskChildren(task.id);
    children.forEach((child) => { child.parentTaskId = task.parentTaskId || null; });
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
    detailModal.close();
    selectedTaskId = null;
    const saved = saveState();
    render();
    if (saved) {
      const updates = [];
      if (affected.length) updates.push(`removed it from ${affected.length} prerequisite list${affected.length === 1 ? "" : "s"}`);
      if (children.length) updates.push(`moved ${children.length} subtask${children.length === 1 ? "" : "s"} up one level`);
      showToast(updates.length ? `Task deleted; ${updates.join(" and ")}.` : "Task deleted.");
    }
  } else if (event.target.closest("[data-edit-review]")) {
    openCompletionReview(selectedTaskId);
  }
});

detailModal.addEventListener("submit", (event) => {
  if (event.target.id !== "commentForm") return;
  event.preventDefault();
  const input = event.target.elements.comment;
  const text = input.value.trim();
  const task = state.tasks.find((item) => item.id === selectedTaskId);
  if (!task || !text) return;
  task.comments.push({ id: createId("comment"), author: currentUser.id, text, createdAt: new Date().toISOString() });
  const saved = saveState();
  render();
  renderTaskDetails();
  if (saved) showToast("Comment added.");
  document.querySelector(".comment-input").focus();
});

document.getElementById("helpButton").addEventListener("click", () => showToast("Tip: click a task to see its details and join the conversation."));
document.getElementById("footerHelp").addEventListener("click", () => showToast("You're using the Orbit starter workspace. Your work saves in this browser."));
document.getElementById("notificationButton").addEventListener("click", () => {
  activeView = "inbox";
  activeProject = null;
  activeFilter = "all";
  activeInboxFilter = "unread";
  searchInput.value = "";
  render();
});
document.getElementById("upgradeButton").addEventListener("click", () => showToast("Plans are coming soon. Enjoy your free workspace!"));
document.getElementById("profileButton").addEventListener("click", () => showToast("Signed in as Jamie Davis."));
document.querySelector(".workspace-switcher").addEventListener("click", () => showToast("Studio North is your current workspace."));
document.getElementById("menuButton").addEventListener("click", () => document.getElementById("sidebar").classList.toggle("open"));
document.addEventListener("click", (event) => {
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth <= 700 && sidebar.classList.contains("open") && !sidebar.contains(event.target) && !event.target.closest("#menuButton")) sidebar.classList.remove("open");
});
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});

setDateLabel();
render();
if (loadWarning) showToast("Saved data could not be read. The demo is shown; import a backup to recover your workspace.");
