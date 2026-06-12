'use strict';

/* ═══════════════════════════════════════════
   GATE DA 2026 — STUDY TRACKER
   Modular JavaScript — localStorage-based
   ═══════════════════════════════════════════ */

/* ─── DATA: SYLLABUS ─── */
const SUBJECTS = [
  {
    name: 'Probability and Statistics',
    topics: [
      'Counting — Permutation & Combinations',
      'Probability Axioms & Sample Space',
      'Conditional & Joint Probability',
      'Bayes Theorem',
      'Discrete Distributions (Bernoulli, Binomial, Uniform)',
      'Continuous Distributions (Normal, Exponential, Poisson)',
      't-distribution & Chi-Squared',
      'Central Limit Theorem',
      'Hypothesis Testing (z-test, t-test, chi-squared)',
      'Confidence Intervals',
      'Correlation & Covariance',
      'Conditional Expectation & Variance',
    ],
  },
  {
    name: 'Linear Algebra',
    topics: [
      'Vector Spaces & Subspaces',
      'Linear Dependence & Independence',
      'Matrices & Properties',
      'Eigenvalues & Eigenvectors',
      'Determinant, Rank & Nullity',
      'Systems of Linear Equations',
      'Gaussian Elimination',
      'LU Decomposition',
      'Singular Value Decomposition (SVD)',
      'Orthogonal & Projection Matrices',
      'Quadratic Forms',
    ],
  },
  {
    name: 'Calculus and Optimization',
    topics: [
      'Limits & Continuity',
      'Differentiability',
      'Taylor Series',
      'Maxima & Minima',
      'Single-variable Optimization',
    ],
  },
  {
    name: 'Programming, Data Structures and Algorithms',
    topics: [
      'Python Programming Basics',
      'Stacks & Queues',
      'Linked Lists',
      'Trees & Hash Tables',
      'Linear & Binary Search',
      'Selection, Bubble & Insertion Sort',
      'Merge Sort & Quick Sort',
      'Graph Theory Introduction',
      'Graph Traversals (BFS, DFS)',
      'Shortest Path Algorithms',
    ],
  },
  {
    name: 'Database Management and Warehousing',
    topics: [
      'ER Model',
      'Relational Algebra & Tuple Calculus',
      'SQL & Integrity Constraints',
      'Normal Forms',
      'File Organization & Indexing',
      'Data Transformation (Normalization, Discretization)',
      'Data Warehouse Modelling',
      'Multidimensional Data Models',
      'Concept Hierarchies & Measures',
    ],
  },
  {
    name: 'Machine Learning',
    topics: [
      'Regression (Simple & Multiple Linear)',
      'Ridge Regression & Regularization',
      'Logistic Regression',
      'k-Nearest Neighbour',
      'Naive Bayes Classifier',
      'Linear Discriminant Analysis',
      'Support Vector Machine (SVM)',
      'Decision Trees',
      'Bias-Variance Trade-off',
      'Cross-Validation (LOO, k-Folds)',
      'Multi-layer Perceptron',
      'k-Means & k-Medoid Clustering',
      'Hierarchical Clustering',
      'Principal Component Analysis (PCA)',
    ],
  },
  {
    name: 'Artificial Intelligence',
    topics: [
      'Uninformed Search (BFS, DFS, UCS)',
      'Informed Search (A*, Heuristics)',
      'Adversarial Search (Minimax, Alpha-Beta)',
      'Propositional Logic',
      'Predicate Logic',
      'Conditional Independence Representation',
      'Variable Elimination (Exact Inference)',
      'Approximate Inference via Sampling',
    ],
  },
];

const SUBJECT_COLORS = ['#58a6ff','#3fb950','#ffa657','#bc8cff','#ff7b72','#f0a500','#39d3c3'];

/* ─── LOCAL STORAGE KEYS ─── */
const KEY_TASKS   = 'gate_da_tasks';
const KEY_ERRORS  = 'gate_da_errors';
const KEY_STREAK  = 'gate_da_streak';

/* ─── STATE ─── */
let tasks  = loadJSON(KEY_TASKS,  []);
let errors = loadJSON(KEY_ERRORS, []);
let streak = loadJSON(KEY_STREAK, { count: 0, lastDate: '' });

/* ─── HELPERS ─── */
function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
}
function saveJSON(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function today() { return new Date().toISOString().slice(0, 10); }
function fmtDate(d) { return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2600);
}

function subjectIndex(name) { return SUBJECTS.findIndex(s => s.name === name); }
function subjectTag(name) {
  const i = subjectIndex(name);
  const abbr = name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  return `<span class="subject-tag subj-${i}">${abbr}</span>`;
}

/* ─── STREAK ─── */
function updateStreak() {
  const td = today();
  const hasTodayActivity = tasks.some(t => t.date === td && t.status !== 'not_started');
  if (hasTodayActivity) {
    if (streak.lastDate !== td) {
      const yesterday = new Date(td);
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      streak.count = (streak.lastDate === yStr) ? streak.count + 1 : 1;
      streak.lastDate = td;
      saveJSON(KEY_STREAK, streak);
    }
  }
  document.getElementById('streakCount').textContent = streak.count;
  document.getElementById('mobileStreak').textContent = `🔥 ${streak.count}`;
}

/* ─── NAVIGATION ─── */
function initNav() {
  /* ── Sidebar nav buttons (Dashboard, Planner, etc.) ── */
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const sec = btn.dataset.section;
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(sec).classList.add('active');
      // close sidebar on mobile after navigating
      closeSidebar();
      // refresh section
      if (sec === 'dashboard') renderDashboard();
      if (sec === 'planner')   renderPlanner();
      if (sec === 'tracker')   renderTracker();
      if (sec === 'analytics') renderAnalytics();
      if (sec === 'errorlog')  renderErrorLog();
    });
  });

  /* ── Sidebar hamburger (app-bar, mobile only) ── */
  const sidebarHamburger = document.getElementById('sidebarHamburger');
  const sidebar          = document.getElementById('sidebar');
  const sidebarOverlay   = document.getElementById('sidebarOverlay');

  if (sidebarHamburger) {
    sidebarHamburger.addEventListener('click', () => {
      const isOpen = sidebar.classList.contains('open');
      isOpen ? closeSidebar() : openSidebar();
    });
  }

  // Close sidebar when overlay is tapped
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  /* ── Site topnav hamburger (mobile site links) ── */
  const topnavHamburger = document.getElementById('topnavHamburger');
  const topnavLinks     = document.getElementById('topnavLinks');

  if (topnavHamburger && topnavLinks) {
    topnavHamburger.addEventListener('click', () => {
      topnavLinks.classList.toggle('open');
    });

    // Close site nav when a link inside it is clicked
    topnavLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => topnavLinks.classList.remove('open'));
    });

    // Close site nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!topnavHamburger.contains(e.target) && !topnavLinks.contains(e.target)) {
        topnavLinks.classList.remove('open');
      }
    });
  }
}

function openSidebar() {
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  sidebar.classList.add('open');
  if (sidebarOverlay) sidebarOverlay.classList.add('show');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeSidebar() {
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('open');
  if (sidebarOverlay) sidebarOverlay.classList.remove('show');
  document.body.style.overflow = '';
}

/* ─── POPULATE SUBJECT / TOPIC SELECTS ─── */
function fillSubjectSelect(selectId) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = '<option value="">Select subject…</option>';
  SUBJECTS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    sel.appendChild(opt);
  });
}

function fillTopicSelect(topicSelectId, subjectName) {
  const sel = document.getElementById(topicSelectId);
  sel.innerHTML = '<option value="">Select topic…</option>';
  const subj = SUBJECTS.find(s => s.name === subjectName);
  if (!subj) return;
  subj.topics.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
}

function linkSubjectTopic(subjectId, topicId) {
  document.getElementById(subjectId).addEventListener('change', e => {
    fillTopicSelect(topicId, e.target.value);
  });
}

/* ─── DASHBOARD ─── */
function renderDashboard() {
  const td = today();
  document.getElementById('todayDateLabel').textContent = fmtDate(td);

  const todayTasks = tasks.filter(t => t.date === td);
  const completed  = todayTasks.filter(t => t.status === 'completed');
  const inProg     = todayTasks.filter(t => t.status === 'in_progress');
  const totalPlan  = todayTasks.reduce((s, t) => s + Number(t.plannedHours || 0), 0);
  const totalAct   = todayTasks.reduce((s, t) => s + Number(t.actualHours  || 0), 0);
  const totalQ     = todayTasks.reduce((s, t) => s + Number(t.targetQ      || 0), 0);
  const solvedQ    = todayTasks.reduce((s, t) => s + Number(t.solvedQ      || 0), 0);
  const pct        = todayTasks.length ? Math.round((completed.length / todayTasks.length) * 100) : 0;

  document.getElementById('todayTaskCount').textContent = todayTasks.length;
  document.getElementById('todayCompleted').textContent = `${completed.length} completed`;
  document.getElementById('hoursPlanned').textContent   = `${totalPlan}h`;
  document.getElementById('hoursActual').textContent    = `${totalAct}h actual`;
  document.getElementById('completionPct').textContent  = `${pct}%`;
  document.getElementById('questionsSolved').textContent = solvedQ;
  document.getElementById('questionsTarget').textContent = `of ${totalQ} target`;

  updateStreak();

  // today task list
  const listEl = document.getElementById('todayTaskList');
  if (!todayTasks.length) {
    listEl.innerHTML = '<div class="empty-state">No tasks planned for today. Go to Daily Planner to add some.</div>';
  } else {
    listEl.innerHTML = todayTasks.map(t => dashTaskHTML(t)).join('');
  }

  // weak subjects
  renderWeakSubjects();
}

function dashTaskHTML(t) {
  const pct = t.plannedHours > 0 ? Math.min(100, Math.round((t.actualHours || 0) / t.plannedHours * 100)) : 0;
  return `
    <div class="task-item status-${t.status}">
      <div class="task-header">
        <div>
          ${subjectTag(t.subject)}
          <span class="task-title">${t.topic}</span>
          <span class="status-badge ${t.status}">${t.status.replace('_',' ')}</span>
        </div>
        <div class="task-meta">${t.plannedHours}h planned · ${t.targetQ || 0} Qs</div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label">
          <span>Hours: ${t.actualHours || 0}/${t.plannedHours}</span>
          <span>Questions: ${t.solvedQ || 0}/${t.targetQ || 0}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill${pct >= 100 ? ' green' : ''}" style="width:${pct}%"></div></div>
      </div>
    </div>`;
}

function renderWeakSubjects() {
  const container = document.getElementById('weakSubjects');
  if (!tasks.length) {
    container.innerHTML = '<div class="empty-state">Complete some tasks to see analysis.</div>';
    return;
  }
  const data = SUBJECTS.map((s, i) => {
    const sTasks  = tasks.filter(t => t.subject === s.name);
    const done    = sTasks.filter(t => t.status === 'completed').length;
    const rate    = sTasks.length ? Math.round((done / sTasks.length) * 100) : 100;
    return { name: s.name, rate, color: SUBJECT_COLORS[i] };
  }).filter(s => tasks.some(t => t.subject === s.name))
    .sort((a, b) => a.rate - b.rate);

  if (!data.length) {
    container.innerHTML = '<div class="empty-state">No data yet.</div>';
    return;
  }
  container.innerHTML = data.slice(0, 5).map(s => `
    <div class="weak-subj-item">
      <div class="weak-subj-name">${s.name}</div>
      <div class="weak-subj-bar">
        <div class="weak-subj-fill" style="width:${s.rate}%;background:${s.color}"></div>
      </div>
      <div class="weak-subj-pct">${s.rate}%</div>
    </div>`).join('');
}

/* ─── PLANNER ─── */
function initPlanner() {
  // Set default date to today
  document.getElementById('taskDate').value = today();
  document.getElementById('filterDate').value = today();

  fillSubjectSelect('taskSubject');
  linkSubjectTopic('taskSubject', 'taskTopic');

  document.getElementById('showAddTaskBtn').addEventListener('click', () => {
    const f = document.getElementById('addTaskForm');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
    if (f.style.display === 'block') document.getElementById('taskDate').value = today();
  });

  document.getElementById('cancelTaskBtn').addEventListener('click', () => {
    document.getElementById('addTaskForm').style.display = 'none';
  });

  document.getElementById('saveTaskBtn').addEventListener('click', saveTask);

  document.getElementById('filterDate').addEventListener('change', renderPlanner);

  renderPlanner();
}

function saveTask() {
  const date    = document.getElementById('taskDate').value;
  const subject = document.getElementById('taskSubject').value;
  const topic   = document.getElementById('taskTopic').value;
  const hours   = parseFloat(document.getElementById('taskHours').value);
  const qns     = parseInt(document.getElementById('taskQuestions').value) || 0;
  const notes   = document.getElementById('taskNotes').value.trim();

  if (!date || !subject || !topic || isNaN(hours) || hours <= 0) {
    showToast('Please fill in date, subject, topic and planned hours.', 'error');
    return;
  }

  const task = {
    id: uid(),
    date, subject, topic,
    plannedHours: hours,
    actualHours: 0,
    targetQ: qns,
    solvedQ: 0,
    notes,
    status: 'not_started',
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  saveJSON(KEY_TASKS, tasks);
  showToast('Task added!');
  document.getElementById('addTaskForm').style.display = 'none';
  document.getElementById('taskDate').value = today();
  document.getElementById('taskSubject').value = '';
  document.getElementById('taskTopic').innerHTML = '<option value="">Select topic…</option>';
  document.getElementById('taskHours').value = '';
  document.getElementById('taskQuestions').value = '';
  document.getElementById('taskNotes').value = '';
  renderPlanner();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveJSON(KEY_TASKS, tasks);
  showToast('Task deleted.');
  renderPlanner();
  if (document.getElementById('tracker').classList.contains('active')) renderTracker();
  if (document.getElementById('dashboard').classList.contains('active')) renderDashboard();
}

function renderPlanner() {
  const filter = document.getElementById('filterDate').value;
  const list   = filter ? tasks.filter(t => t.date === filter) : tasks;
  const container = document.getElementById('plannerTaskList');

  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No tasks for this date.</div>';
    return;
  }

  // group by date
  const byDate = {};
  list.forEach(t => {
    if (!byDate[t.date]) byDate[t.date] = [];
    byDate[t.date].push(t);
  });

  container.innerHTML = Object.keys(byDate).sort((a,b) => b.localeCompare(a)).map(d => `
    <div style="margin-bottom:12px">
      <div style="font-size:0.78rem;color:var(--text-muted);font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">${fmtDate(d)}</div>
      ${byDate[d].map(t => plannerTaskHTML(t)).join('')}
    </div>`).join('');
}

function plannerTaskHTML(t) {
  return `
    <div class="task-item status-${t.status}" id="ptask-${t.id}">
      <div class="task-header">
        <div>
          ${subjectTag(t.subject)}
          <span class="task-title">${t.topic}</span>
          <span class="status-badge ${t.status}">${t.status.replace('_',' ')}</span>
        </div>
        <div class="task-actions">
          <button class="btn-sm danger" onclick="deleteTask('${t.id}')">Delete</button>
        </div>
      </div>
      <div class="task-meta">${t.plannedHours}h planned · ${t.targetQ} Qs${t.notes ? ' · ' + t.notes : ''}</div>
    </div>`;
}

/* ─── TRACKER ─── */
function initTracker() {
  document.getElementById('trackerDateFilter').value = today();
  document.getElementById('trackerDateFilter').addEventListener('change', renderTracker);
  renderTracker();
}

function renderTracker() {
  const filter = document.getElementById('trackerDateFilter').value;
  const list   = filter ? tasks.filter(t => t.date === filter) : tasks;
  const container = document.getElementById('trackerTaskList');

  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No tasks for this date. Add tasks in Daily Planner.</div>';
    return;
  }

  container.innerHTML = list.map(t => trackerTaskHTML(t)).join('');
}

function trackerTaskHTML(t) {
  const pct = t.plannedHours > 0 ? Math.min(100, Math.round((t.actualHours || 0) / t.plannedHours * 100)) : 0;
  return `
    <div class="task-item status-${t.status}" id="ttask-${t.id}">
      <div class="task-header">
        <div>
          ${subjectTag(t.subject)}
          <span class="task-title">${t.topic}</span>
          <span class="status-badge ${t.status}">${t.status.replace('_',' ')}</span>
        </div>
        <div class="task-meta">${t.date}</div>
      </div>
      <div class="progress-wrap">
        <div class="progress-label">
          <span>Hours: ${t.actualHours || 0} / ${t.plannedHours}</span>
          <span>Questions: ${t.solvedQ || 0} / ${t.targetQ || 0}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill${pct >= 100 ? ' green' : ''}" style="width:${pct}%"></div></div>
      </div>
      <div class="tracker-controls">
        <div class="form-group">
          <label>Actual Hours</label>
          <input type="number" min="0" max="24" step="0.5" value="${t.actualHours || 0}"
            id="ah-${t.id}" onchange="updateTask('${t.id}', 'actualHours', this.value)" />
        </div>
        <div class="form-group">
          <label>Questions Solved</label>
          <input type="number" min="0" step="1" value="${t.solvedQ || 0}"
            id="sq-${t.id}" onchange="updateTask('${t.id}', 'solvedQ', this.value)" />
        </div>
        <div class="form-group">
          <label>Status</label>
          <select onchange="updateTask('${t.id}', 'status', this.value)">
            <option value="not_started" ${t.status==='not_started'?'selected':''}>Not Started</option>
            <option value="in_progress" ${t.status==='in_progress'?'selected':''}>In Progress</option>
            <option value="completed"   ${t.status==='completed'  ?'selected':''}>Completed</option>
          </select>
        </div>
        <button class="btn-primary" onclick="saveTrackerTask('${t.id}')">Save</button>
      </div>
    </div>`;
}

function updateTask(id, field, value) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  if (field === 'actualHours' || field === 'solvedQ') {
    task[field] = parseFloat(value) || 0;
  } else {
    task[field] = value;
  }
}

function saveTrackerTask(id) {
  // read live values from inputs in case user changed without triggering onchange
  const ah = document.getElementById('ah-' + id);
  const sq = document.getElementById('sq-' + id);
  if (ah) updateTask(id, 'actualHours', ah.value);
  if (sq) updateTask(id, 'solvedQ', sq.value);
  saveJSON(KEY_TASKS, tasks);
  updateStreak();
  renderTracker();
  showToast('Progress saved!');
}

/* ─── ANALYTICS ─── */
function initAnalytics() {
  document.getElementById('analyticsRange').addEventListener('change', renderAnalytics);
  renderAnalytics();
}

function renderAnalytics() {
  const days   = parseInt(document.getElementById('analyticsRange').value);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutStr = cutoff.toISOString().slice(0, 10);

  const filtered = tasks.filter(t => t.date >= cutStr);

  const totalHours     = filtered.reduce((s, t) => s + (t.actualHours || 0), 0);
  const totalCompleted = filtered.filter(t => t.status === 'completed').length;
  const totalTasks     = filtered.length;
  const rate           = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  const totalQ         = filtered.reduce((s, t) => s + (t.solvedQ || 0), 0);

  document.getElementById('anaHours').textContent    = `${totalHours.toFixed(1)}h`;
  document.getElementById('anaCompleted').textContent = totalCompleted;
  document.getElementById('anaRate').textContent      = `${rate}%`;
  document.getElementById('anaQuestions').textContent  = totalQ;

  drawSubjectChart(filtered);
  drawDailyChart(filtered, days);
  renderSubjectCompletion(filtered);
}

function drawSubjectChart(filtered) {
  const canvas = document.getElementById('subjectChart');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const data = SUBJECTS.map((s, i) => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    hours: filtered.filter(t => t.subject === s.name).reduce((sum, t) => sum + (t.actualHours || 0), 0),
    color: SUBJECT_COLORS[i],
  }));

  const maxH = Math.max(...data.map(d => d.hours), 1);
  const pad  = { top: 20, right: 20, bottom: 60, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;

  const barW   = Math.floor(chartW / data.length * 0.55);
  const barGap = Math.floor(chartW / data.length);

  // grid lines
  ctx.strokeStyle = '#2a3140';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    // label
    const val = (maxH - (maxH / 4) * i).toFixed(1);
    ctx.fillStyle = '#4d5969';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val + 'h', pad.left - 4, y + 4);
  }

  data.forEach((d, i) => {
    const x = pad.left + barGap * i + (barGap - barW) / 2;
    const bh = (d.hours / maxH) * chartH;
    const y = pad.top + chartH - bh;

    ctx.fillStyle = d.color + '33';
    ctx.fillRect(x, pad.top, barW, chartH);
    ctx.fillStyle = d.color;
    ctx.fillRect(x, y, barW, bh);

    // value
    if (d.hours > 0) {
      ctx.fillStyle = d.color;
      ctx.font = 'bold 11px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.hours.toFixed(1) + 'h', x + barW / 2, y - 6);
    }

    // label
    ctx.fillStyle = '#7d8998';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    const words = d.name.split(' ');
    ctx.fillText(words[0], x + barW / 2, H - pad.bottom + 14);
    if (words[1]) ctx.fillText(words[1], x + barW / 2, H - pad.bottom + 26);
  });
}

function drawDailyChart(filtered, days) {
  const canvas = document.getElementById('dailyChart');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // build date array
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const daily = dates.map(d => ({
    date: d,
    hours: filtered.filter(t => t.date === d).reduce((s, t) => s + (t.actualHours || 0), 0),
  }));

  const maxH = Math.max(...daily.map(d => d.hours), 1);
  const pad  = { top: 16, right: 16, bottom: 40, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top  - pad.bottom;
  const step   = chartW / (dates.length - 1 || 1);

  // grid
  ctx.strokeStyle = '#2a3140';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 3; i++) {
    const y = pad.top + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.stroke();
    const val = (maxH - (maxH / 3) * i).toFixed(1);
    ctx.fillStyle = '#4d5969';
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(val + 'h', pad.left - 4, y + 4);
  }

  // area fill
  ctx.beginPath();
  daily.forEach((d, i) => {
    const x = pad.left + step * i;
    const y = pad.top + chartH - (d.hours / maxH) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.lineTo(pad.left + step * (daily.length - 1), pad.top + chartH);
  ctx.lineTo(pad.left, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = 'rgba(240,165,0,0.1)';
  ctx.fill();

  // line
  ctx.beginPath();
  ctx.strokeStyle = '#f0a500';
  ctx.lineWidth = 2;
  daily.forEach((d, i) => {
    const x = pad.left + step * i;
    const y = pad.top + chartH - (d.hours / maxH) * chartH;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  // dots
  daily.forEach((d, i) => {
    const x = pad.left + step * i;
    const y = pad.top + chartH - (d.hours / maxH) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = d.hours > 0 ? '#f0a500' : '#2a3140';
    ctx.fill();
  });

  // x labels (show every N)
  const every = Math.ceil(days / 8);
  daily.forEach((d, i) => {
    if (i % every === 0 || i === daily.length - 1) {
      const x = pad.left + step * i;
      ctx.fillStyle = '#4d5969';
      ctx.font = '9px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.date.slice(5), x, H - pad.bottom + 14);
    }
  });
}

function renderSubjectCompletion(filtered) {
  const container = document.getElementById('subjectCompletionList');
  const rows = SUBJECTS.map((s, i) => {
    const sTasks = filtered.filter(t => t.subject === s.name);
    const done   = sTasks.filter(t => t.status === 'completed').length;
    const total  = sTasks.length;
    const pct    = total ? Math.round((done / total) * 100) : 0;
    return { name: s.name, pct, done, total, color: SUBJECT_COLORS[i] };
  }).filter(r => r.total > 0);

  if (!rows.length) {
    container.innerHTML = '<div class="empty-state">No data in this period.</div>';
    return;
  }

  container.innerHTML = rows.map(r => `
    <div class="subj-comp-row">
      <div class="subj-comp-header">
        <span>${r.name}</span>
        <span class="subj-comp-pct">${r.done}/${r.total} tasks · ${r.pct}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${r.pct}%;background:${r.color}"></div>
      </div>
    </div>`).join('');
}

/* ─── ERROR LOG ─── */
function initErrorLog() {
  fillSubjectSelect('errSubject');
  fillSubjectSelect('filterErrSubject');
  linkSubjectTopic('errSubject', 'errTopic');

  const filterSel = document.getElementById('filterErrSubject');
  filterSel.innerHTML = '<option value="">All Subjects</option>';
  SUBJECTS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name; opt.textContent = s.name;
    filterSel.appendChild(opt);
  });

  document.getElementById('showAddErrorBtn').addEventListener('click', () => {
    const f = document.getElementById('addErrorForm');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
  });

  document.getElementById('cancelErrorBtn').addEventListener('click', () => {
    document.getElementById('addErrorForm').style.display = 'none';
  });

  document.getElementById('saveErrorBtn').addEventListener('click', saveError);

  document.getElementById('filterErrSubject').addEventListener('change', renderErrorLog);
  document.getElementById('filterErrType').addEventListener('change', renderErrorLog);
  document.getElementById('filterErrRevised').addEventListener('change', renderErrorLog);

  renderErrorLog();
}

function saveError() {
  const subject  = document.getElementById('errSubject').value;
  const topic    = document.getElementById('errTopic').value;
  const type     = document.getElementById('errType').value;
  const question = document.getElementById('errQuestion').value.trim();
  const notes    = document.getElementById('errNotes').value.trim();

  if (!subject || !topic || !question) {
    showToast('Please fill subject, topic, and question.', 'error');
    return;
  }

  const entry = {
    id: uid(),
    date: today(),
    subject, topic, type, question, notes,
    revised: false,
    createdAt: new Date().toISOString(),
  };

  errors.push(entry);
  saveJSON(KEY_ERRORS, errors);
  showToast('Mistake logged!');
  document.getElementById('addErrorForm').style.display = 'none';
  document.getElementById('errSubject').value = '';
  document.getElementById('errTopic').innerHTML = '<option value="">Select topic…</option>';
  document.getElementById('errQuestion').value = '';
  document.getElementById('errNotes').value = '';
  renderErrorLog();
}

function toggleRevised(id) {
  const e = errors.find(e => e.id === id);
  if (!e) return;
  e.revised = !e.revised;
  saveJSON(KEY_ERRORS, errors);
  renderErrorLog();
  showToast(e.revised ? 'Marked as revised ✓' : 'Marked as pending');
}

function deleteError(id) {
  errors = errors.filter(e => e.id !== id);
  saveJSON(KEY_ERRORS, errors);
  renderErrorLog();
  showToast('Entry deleted.');
}

function renderErrorLog() {
  const fSubj    = document.getElementById('filterErrSubject').value;
  const fType    = document.getElementById('filterErrType').value;
  const fRevised = document.getElementById('filterErrRevised').value;

  let list = [...errors].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (fSubj)    list = list.filter(e => e.subject === fSubj);
  if (fType)    list = list.filter(e => e.type    === fType);
  if (fRevised === 'yes') list = list.filter(e =>  e.revised);
  if (fRevised === 'no')  list = list.filter(e => !e.revised);

  const container = document.getElementById('errorList');

  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No entries matching the filters.</div>';
    return;
  }

  container.innerHTML = list.map(e => `
    <div class="error-item${e.revised ? ' revised' : ''}" id="err-${e.id}">
      <div class="error-header">
        <div>
          ${subjectTag(e.subject)}
          <span class="error-type-badge ${e.type}">${e.type}</span>
          ${e.revised ? '<span style="font-size:0.72rem;color:var(--green);margin-left:6px">✓ Revised</span>' : ''}
        </div>
        <div class="error-actions">
          <button class="btn-sm" onclick="toggleRevised('${e.id}')">${e.revised ? 'Unmark' : 'Mark Revised'}</button>
          <button class="btn-sm danger" onclick="deleteError('${e.id}')">Delete</button>
        </div>
      </div>
      <div class="error-question">${e.question}</div>
      <div class="task-meta" style="margin:4px 0 6px">${e.topic}</div>
      ${e.notes ? `<div class="error-notes">${e.notes}</div>` : ''}
      <div class="error-date">${fmtDate(e.date)}</div>
    </div>`).join('');
}

/* ─── RESET ─── */
function initReset() {
  document.getElementById('resetBtn').addEventListener('click', () => {
    document.getElementById('resetModal').style.display = 'flex';
  });

  document.getElementById('cancelReset').addEventListener('click', () => {
    document.getElementById('resetModal').style.display = 'none';
  });

  document.getElementById('confirmReset').addEventListener('click', () => {
    tasks  = [];
    errors = [];
    streak = { count: 0, lastDate: '' };
    localStorage.removeItem(KEY_TASKS);
    localStorage.removeItem(KEY_ERRORS);
    localStorage.removeItem(KEY_STREAK);
    document.getElementById('resetModal').style.display = 'none';
    showToast('All data cleared.');
    renderDashboard();
  });

  // click outside closes modal
  document.getElementById('resetModal').addEventListener('click', e => {
    if (e.target === e.currentTarget)
      document.getElementById('resetModal').style.display = 'none';
  });
}

/* ─── INIT ─── */
function init() {
  initNav();
  initPlanner();
  initTracker();
  initAnalytics();
  initErrorLog();
  initReset();
  renderDashboard();

  // Set today's date label
  document.getElementById('todayDateLabel').textContent = fmtDate(today());
}

document.addEventListener('DOMContentLoaded', init);

// expose for inline handlers
window.deleteTask      = deleteTask;
window.updateTask      = updateTask;
window.saveTrackerTask = saveTrackerTask;
window.toggleRevised   = toggleRevised;
window.deleteError     = deleteError;