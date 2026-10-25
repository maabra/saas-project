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
    tasks: [
      { id: "task-1", title: "Finalize homepage wireframes", description: "Review the latest homepage wireframes with the team and collect final feedback before handoff.", project: "website", status: "in-progress", dueDate: daysFromNow(0), assignee: "JD", priority: "high", comments: [{ id: "comment-1", author: "AL", text: "The updated hero section looks great. I left a couple of notes on the mobile flow.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }] },
      { id: "task-2", title: "Gather inspiration for color palette", description: "Put together a small collection of references for the refreshed brand palette.", project: "brand", status: "todo", dueDate: daysFromNow(1), assignee: "MK", priority: "medium", comments: [] },
      { id: "task-3", title: "Write launch announcement", description: "Draft a friendly product launch announcement for the newsletter and social channels.", project: "launch", status: "in-progress", dueDate: daysFromNow(2), assignee: "SC", priority: "high", comments: [{ id: "comment-2", author: "JD", text: "Let's keep the first paragraph short and focus on the new collaboration features.", createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() }] },
      { id: "task-4", title: "Review Q4 content calendar", description: "Check dates, owners, and themes for the next content calendar.", project: "content", status: "todo", dueDate: daysFromNow(4), assignee: "AL", priority: "low", comments: [] },
      { id: "task-5", title: "Share moodboard with the team", description: "Share the initial moodboard and collect thoughts in the project comments.", project: "brand", status: "done", completedAt: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(), estimatedMinutes: 90, completionReview: { efficiency: 4, quality: 5, actualMinutes: 75, notes: "The shared reference board made review quick." }, dueDate: daysFromNow(-1), assignee: "JD", priority: "medium", comments: [] },
      { id: "task-6", title: "Set up launch checklist", description: "Make sure each launch milestone has an owner and a clear due date.", project: "launch", status: "todo", dueDate: daysFromNow(5), assignee: "MK", priority: "medium", comments: [] },
      { id: "task-7", title: "Collect customer quotes", description: "Find a few short customer quotes for the new homepage.", project: "website", status: "done", completedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), estimatedMinutes: 45, completionReview: { efficiency: 3, quality: 4, actualMinutes: 50, notes: "Next time, collect quotes as they arrive." }, dueDate: daysFromNow(-2), assignee: "SC", priority: "low", comments: [] },
      { id: "task-8", title: "Plan next week's social posts", description: "Draft post ideas and line them up with the product launch.", project: "content", status: "in-progress", dueDate: daysFromNow(3), assignee: "JD", priority: "medium", comments: [] }
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
  return { projects: value.projects, tasks: value.tasks };
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
    const matchesFilter = activeFilter === "all" || task.status === activeFilter;
    const projectName = getProject(task.project)?.name || "";
    const matchesSearch = !query || `${task.title} ${task.description} ${projectName}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
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

function taskRow(task) {
  const project = getProject(task.project);
  const isOverdue = task.status !== "done" && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10);
  return `<article class="task-row" data-task-row="${escapeHtml(task.id)}">
    <div class="task-main">
      <button class="task-check${task.status === "done" ? " completed" : ""}" type="button" data-toggle-task="${escapeHtml(task.id)}" aria-label="${task.status === "done" ? "Reopen" : "Complete and review"}: ${escapeHtml(task.title)}">${task.status === "done" ? '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="m2 6 2.5 2.5L10 3"/></svg>' : ""}</button>
      <div class="task-title-wrap" role="button" tabindex="0" data-open-task="${escapeHtml(task.id)}" aria-label="Open ${escapeHtml(task.title)}"><span class="task-title${task.status === "done" ? " is-done" : ""}">${escapeHtml(task.title)}</span><span class="task-project-mobile">${escapeHtml(project?.name || "No project")}</span></div>
    </div>
    <span class="task-project"><span class="project-color ${escapeHtml(project?.color || "violet")}"></span>${escapeHtml(project?.name || "No project")}</span>
    <span class="status-pill status-${escapeHtml(task.status)}">${statusLabel(task.status)}</span>
    <span class="task-due${isOverdue ? " overdue" : ""}">${escapeHtml(formatDate(task.dueDate))}</span>
    <span class="task-meta"><span class="task-comments" aria-label="${task.comments.length} comments"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 7.5a5.5 5.5 0 0 1-8.2 4.8L2.5 13l.7-2.4a5.5 5.5 0 1 1 10.3-3.1Z"/></svg>${task.comments.length}</span><span class="assignee assignee-${escapeHtml(task.assignee)}" title="${escapeHtml(getPerson(task.assignee))}">${escapeHtml(task.assignee)}</span><i class="priority-dot ${escapeHtml(task.priority)}" title="${escapeHtml(task.priority)} priority"></i>${task.completionReview ? `<span class="task-rating" title="Efficiency ${task.completionReview.efficiency}/5 · Quality ${task.completionReview.quality}/5">★ ${task.completionReview.efficiency}</span>` : ""}</span>
  </article>`;
}

function renderTasks() {
  const scoped = scopedTasks();
  const tasks = filteredTasks();
  taskList.innerHTML = tasks.length ? tasks.map(taskRow).join("") : '<div class="task-empty"><strong>Nothing on your plate</strong>Try another filter, or create a task to get started.</div>';
  document.getElementById("allCount").textContent = String(scoped.length);
  document.getElementById("listFooter").innerHTML = `<span>Showing ${tasks.length} of ${scoped.length} task${scoped.length === 1 ? "" : "s"}</span><button type="button" data-clear-filters>Clear filters</button>`;
  renderStats();
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
    subtitle = "Stay up to date with your workspace.";
    sectionTitle = "Recent activity";
    description = "Tasks and conversations from across your projects.";
  }
  document.getElementById("breadcrumbCurrent").textContent = title;
  document.getElementById("pageTitle").innerHTML = pageTitle;
  document.getElementById("pageSubtitle").textContent = subtitle;
  document.getElementById("taskSectionTitle").textContent = sectionTitle;
  document.getElementById("taskSectionDescription").textContent = description;
}

function render() {
  updatePageHeading();
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
    openCompletionReview(task.id);
    return;
  }
  task.status = "todo";
  delete task.completedAt;
  delete task.completionReview;
  const saved = saveState();
  render();
  if (detailModal.open) renderTaskDetails();
  if (saved) showToast("Task reopened. Its completion ratings were cleared.");
}

function openTaskDetails(id) {
  selectedTaskId = id;
  renderTaskDetails();
  detailModal.showModal();
}

function renderTaskDetails() {
  const task = state.tasks.find((item) => item.id === selectedTaskId);
  if (!task) {
    detailModal.close();
    return;
  }
  const projectOptions = state.projects.map((project) => `<option value="${escapeHtml(project.id)}"${project.id === task.project ? " selected" : ""}>${escapeHtml(project.name)}</option>`).join("");
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
      <label class="detail-property"><span class="detail-property-label">Project</span><span class="detail-property-value"><select data-task-field="project" aria-label="Task project">${projectOptions}</select></span></label>
      <div class="detail-property"><span class="detail-property-label">Assignee</span><span class="detail-property-value"><span class="assignee assignee-${escapeHtml(task.assignee)}">${escapeHtml(task.assignee)}</span>${escapeHtml(getPerson(task.assignee))}</span></div>
      <div class="detail-property"><span class="detail-property-label">Due date</span><span class="detail-property-value">${escapeHtml(formatDate(task.dueDate))}</span></div>
    </div>
    ${task.estimatedMinutes ? `<p class="estimate-line">Estimated effort: <strong>${escapeHtml(task.estimatedMinutes)} minutes</strong></p>` : ""}
    ${reviewCard}
    <section class="comments-section"><h3 class="comments-heading">Comments <span>${task.comments.length}</span></h3><div class="comment-list" id="commentList">${comments}</div>
      <form class="comment-form" id="commentForm"><span class="avatar avatar-sage">JD</span><textarea class="text-input comment-input" name="comment" rows="1" maxlength="500" aria-label="Write a comment" placeholder="Write a comment..." required></textarea><button class="button button-primary comment-submit" type="submit">Send</button></form>
    </section>`;
}

function openTaskForm(taskId = null) {
  editingTaskId = taskId;
  const form = document.getElementById("taskForm");
  const task = taskId ? state.tasks.find((item) => item.id === taskId) : null;
  form.reset();
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
    form.elements.estimatedMinutes.value = task.estimatedMinutes || "";
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
  const taskFields = {
    title,
    description: String(formData.get("description") || "").trim(),
    project: String(formData.get("project") || state.projects[0]?.id || ""),
    dueDate: String(formData.get("dueDate") || ""),
    assignee: String(formData.get("assignee") || currentUser.id),
    priority: String(formData.get("priority") || "medium"),
    estimatedMinutes: Number(formData.get("estimatedMinutes")) || null
  };
  const updatedTaskId = editingTaskId;
  if (editingTaskId) {
    const task = state.tasks.find((item) => item.id === editingTaskId);
    if (!task) {
      showToast("This task no longer exists. Refresh the page and try again.");
      return;
    }
    Object.assign(task, taskFields);
  } else {
    state.tasks.unshift({ id: createId("task"), ...taskFields, status: "todo", comments: [] });
  }
  const wasEditing = Boolean(editingTaskId);
  editingTaskId = null;
  activeProject = null;
  activeView = "overview";
  activeFilter = "all";
  searchInput.value = "";
  const saved = saveState();
  render();
  taskModal.close();
  event.currentTarget.reset();
  if (wasEditing) openTaskDetails(updatedTaskId);
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

document.querySelectorAll(".main-nav .nav-item").forEach((button) => button.addEventListener("click", () => {
  activeView = button.dataset.view;
  activeProject = null;
  activeFilter = "all";
  render();
  if (activeView === "inbox") showToast("You're all caught up!");
}));

projectNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project]");
  if (!button) return;
  activeProject = button.dataset.project;
  activeView = "overview";
  activeFilter = "all";
  render();
});

taskList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-task]");
  if (toggle) {
    toggleTask(toggle.dataset.toggleTask);
    return;
  }
  const open = event.target.closest("[data-open-task]");
  if (open) openTaskDetails(open.dataset.openTask);
  if (event.target.closest("[data-clear-filters]")) {
    activeProject = null;
    activeFilter = "all";
    activeView = "overview";
    searchInput.value = "";
    render();
  }
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
  searchInput.value = "";
  const saved = saveState();
  render();
  if (saved) showToast("Demo workspace restored.");
});
document.getElementById("viewAllButton").addEventListener("click", () => {
  activeFilter = "all";
  activeProject = null;
  activeView = "overview";
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
    renderTaskDetails();
    openCompletionReview(task.id);
    return;
  }
  task[field] = event.target.value;
  if (field === "status" && task.status !== "done") {
    delete task.completedAt;
    delete task.completionReview;
  }
  saveState();
  render();
  renderTaskDetails();
});

detailModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-edit-task]")) {
    const taskId = selectedTaskId;
    detailModal.close();
    openTaskForm(taskId);
  } else if (event.target.closest("[data-delete-task]")) {
    const task = state.tasks.find((item) => item.id === selectedTaskId);
    if (!task || !window.confirm(`Delete "${task.title}" and its comments? This cannot be undone unless you have a backup.`)) return;
    state.tasks = state.tasks.filter((item) => item.id !== task.id);
    detailModal.close();
    selectedTaskId = null;
    const saved = saveState();
    render();
    if (saved) showToast("Task deleted.");
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
document.getElementById("notificationButton").addEventListener("click", () => showToast("You're all caught up!"));
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
