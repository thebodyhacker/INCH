/*
 * INCH micro SaaS app
 *
 * This script contains all of the logic for the INCH dashboard. It is a pure
 * front‑end application built with vanilla JavaScript to avoid external
 * dependencies. The app supports two roles: personal trainers (PTs) and
 * clients. PTs can log in, view their clients' health metrics, visualise
 * trends over the last seven days, and read AI‑generated coaching
 * suggestions based on sleep, calorie consumption and stress. Clients can
 * log in to view a high‑level summary of their coach's feedback.
 */

// Sample data for demonstration purposes. In a production app this would be
// fetched from remote APIs (Apple Health, MyFitnessPal, Fitbit, Google
// Calendar, etc.). Each PT has a list of client IDs. Each client has
// measurement arrays for the last seven days plus baseline metrics.
const sampleData = {
  pts: [
    {
      id: 'pt1',
      name: 'Alex Trainer',
      email: 'pt1@example.com',
      password: 'password',
      clients: ['c1', 'c2'],
    },
    {
      id: 'pt2',
      name: 'Jamie Coach',
      email: 'pt2@example.com',
      password: 'password',
      clients: ['c3'],
    },
  ],
  clients: {
    c1: {
      id: 'c1',
      name: 'John Doe',
      email: 'client1@example.com',
      password: 'password',
      metrics: {
        sleep: [7.5, 6.0, 7.0, 5.5, 8.0, 6.5, 7.2],
        calories: [2200, 2600, 2400, 2800, 2000, 2100, 2300],
        stress: [3, 5, 4, 6, 2, 3, 4],
        workouts: [1, 0, 1, 1, 0, 1, 0],
        baselineCalories: 2300,
      },
      calendar: [
        { date: '2025-07-27', event: 'Board meeting', stress: 6 },
        { date: '2025-07-28', event: 'Team presentation', stress: 5 },
      ],
    },
    c2: {
      id: 'c2',
      name: 'Sarah Lee',
      email: 'client2@example.com',
      password: 'password',
      metrics: {
        sleep: [6.5, 6.8, 7.2, 6.0, 7.5, 7.0, 7.3],
        calories: [1900, 2000, 2100, 2300, 1800, 1950, 2050],
        stress: [2, 3, 2, 4, 1, 2, 2],
        workouts: [1, 1, 0, 1, 1, 0, 1],
        baselineCalories: 2000,
      },
      calendar: [
        { date: '2025-07-25', event: 'Flight to NYC', stress: 5 },
        { date: '2025-07-29', event: 'Client dinner', stress: 4 },
      ],
    },
    c3: {
      id: 'c3',
      name: 'Michael Brown',
      email: 'client3@example.com',
      password: 'password',
      metrics: {
        sleep: [8.0, 7.8, 7.9, 8.1, 7.7, 7.6, 7.8],
        calories: [2500, 2400, 2450, 2550, 2600, 2400, 2500],
        stress: [4, 3, 4, 4, 3, 3, 4],
        workouts: [0, 1, 0, 1, 0, 1, 0],
        baselineCalories: 2500,
      },
      calendar: [
        { date: '2025-07-26', event: 'Investor call', stress: 5 },
      ],
    },
  },
};

// Utility: fetch a PT by email and password
function getPTByCredentials(email, password) {
  return sampleData.pts.find(
    (pt) => pt.email.toLowerCase() === email.toLowerCase() && pt.password === password
  );
}

// Utility: fetch a client by email and password
function getClientByCredentials(email, password) {
  return Object.values(sampleData.clients).find(
    (client) => client.email.toLowerCase() === email.toLowerCase() && client.password === password
  );
}

// Render the login form for both roles in a polished style
function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  // Header
  const header = document.createElement('div');
  header.className = 'header';
  const logo = document.createElement('div');
  logo.className = 'logo';
  const logoImg = document.createElement('img');
  logoImg.src = 'logo.png';
  logoImg.alt = 'INCH logo';
  logoImg.style.height = '36px';
  logoImg.style.display = 'block';
  logo.appendChild(logoImg);
  const subtitle = document.createElement('div');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Own Every Inch';
  header.appendChild(logo);
  header.appendChild(subtitle);
  app.appendChild(header);
  // Auth card
  const card = document.createElement('div');
  card.className = 'auth-card';
  const title = document.createElement('h1');
  title.textContent = 'Welcome back';
  card.appendChild(title);
  const tagline = document.createElement('p');
  tagline.className = 'tagline';
  tagline.textContent = 'Unlock powerful insights for you and your clients';
  card.appendChild(tagline);
  // Form elements
  const form = document.createElement('div');
  // Email
  const emailGroup = document.createElement('div');
  emailGroup.className = 'input-group';
  const emailLabel = document.createElement('label');
  emailLabel.textContent = 'Email';
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.placeholder = 'you@example.com';
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  form.appendChild(emailGroup);
  // Password
  const passGroup = document.createElement('div');
  passGroup.className = 'input-group';
  const passLabel = document.createElement('label');
  passLabel.textContent = 'Password';
  const passInput = document.createElement('input');
  passInput.type = 'password';
  passInput.placeholder = '••••••••';
  passGroup.appendChild(passLabel);
  passGroup.appendChild(passInput);
  form.appendChild(passGroup);
  // Role
  const roleGroup = document.createElement('div');
  roleGroup.className = 'input-group';
  const roleLabel = document.createElement('label');
  roleLabel.textContent = 'I am a';
  const roleSelect = document.createElement('select');
  ['Personal Trainer', 'Client'].forEach((label, idx) => {
    const opt = document.createElement('option');
    opt.value = idx === 0 ? 'pt' : 'client';
    opt.textContent = label;
    roleSelect.appendChild(opt);
  });
  roleGroup.appendChild(roleLabel);
  roleGroup.appendChild(roleSelect);
  form.appendChild(roleGroup);
  // Button
  const button = document.createElement('button');
  button.className = 'btn';
  button.textContent = 'Sign in';
  button.addEventListener('click', () => {
    const email = emailInput.value.trim();
    const password = passInput.value;
    const role = roleSelect.value;
    if (!email || !password) {
      alert('Please enter your email and password');
      return;
    }
    if (role === 'pt') {
      const pt = getPTByCredentials(email, password);
      if (pt) {
        localStorage.setItem('role', 'pt');
        localStorage.setItem('userId', pt.id);
        renderPTDashboard(pt);
      } else {
        alert('Invalid credentials for PT');
      }
    } else {
      const client = getClientByCredentials(email, password);
      if (client) {
        localStorage.setItem('role', 'client');
        localStorage.setItem('userId', client.id);
        renderClientSummary(client);
      } else {
        alert('Invalid credentials for client');
      }
    }
  });
  form.appendChild(button);
  card.appendChild(form);
  app.appendChild(card);
}

// Render PT dashboard listing clients
function renderPTDashboard(pt) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  // Header bar
  const header = document.createElement('div');
  header.className = 'header';
  const logo = document.createElement('div');
  logo.className = 'logo';
  const logoImg = document.createElement('img');
  logoImg.src = 'logo.png';
  logoImg.alt = 'INCH logo';
  logoImg.style.height = '32px';
  logoImg.style.display = 'block';
  logo.appendChild(logoImg);
  const subtitle = document.createElement('div');
  subtitle.className = 'subtitle';
  subtitle.textContent = 'Dashboard';
  const user = document.createElement('div');
  user.className = 'user';
  user.textContent = `👋 ${pt.name}`;
  header.appendChild(logo);
  header.appendChild(subtitle);
  header.appendChild(user);
  app.appendChild(header);
  // Compute aggregated metrics across all of the PT's clients
  let totalSleep = 0;
  let totalCalories = 0;
  let totalStress = 0;
  let count = 0;
  pt.clients.forEach((clientId) => {
    const c = sampleData.clients[clientId];
    totalSleep += c.metrics.sleep.reduce((a, b) => a + b, 0) / c.metrics.sleep.length;
    totalCalories += c.metrics.calories.reduce((a, b) => a + b, 0) / c.metrics.calories.length;
    totalStress += c.metrics.stress.reduce((a, b) => a + b, 0) / c.metrics.stress.length;
    count++;
  });
  const avgSleep = (totalSleep / count).toFixed(1);
  const avgCal = Math.round(totalCalories / count);
  const avgStress = (totalStress / count).toFixed(1);
  // Summary metrics grid
  const metricsGrid = document.createElement('div');
  metricsGrid.className = 'metrics-grid';
  // Metric cards configuration
  const summaryMetrics = [
    { label: 'Avg Sleep (h)', value: `${avgSleep}`, icon: '💤' },
    { label: 'Avg Calories', value: `${avgCal}`, icon: '🍽️' },
    { label: 'Avg Stress', value: `${avgStress}`, icon: '😓' },
  ];
  summaryMetrics.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = m.icon;
    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = m.value;
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = m.label;
    card.appendChild(icon);
    card.appendChild(value);
    card.appendChild(label);
    metricsGrid.appendChild(card);
  });
  app.appendChild(metricsGrid);
  // Clients grid
  const clientsGrid = document.createElement('div');
  clientsGrid.className = 'clients-grid';
  pt.clients.forEach((clientId) => {
    const client = sampleData.clients[clientId];
    const card = document.createElement('div');
    card.className = 'client-card';
    // Name
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = client.name;
    card.appendChild(name);
    // Sparkline canvas for calories
    const sparkline = document.createElement('canvas');
    sparkline.width = 240;
    sparkline.height = 60;
    sparkline.className = 'sparkline';
    card.appendChild(sparkline);
    // Stats row
    const stats = document.createElement('div');
    stats.className = 'stats';
    const avgSleepC = (
      client.metrics.sleep.reduce((a, b) => a + b, 0) /
      client.metrics.sleep.length
    ).toFixed(1);
    const avgCalC = Math.round(
      client.metrics.calories.reduce((a, b) => a + b, 0) / client.metrics.calories.length
    );
    const avgStressC = (
      client.metrics.stress.reduce((a, b) => a + b, 0) / client.metrics.stress.length
    ).toFixed(1);
    [
      { icon: '💤', value: avgSleepC },
      { icon: '🍽️', value: avgCalC },
      { icon: '😓', value: avgStressC },
    ].forEach((item) => {
      const span = document.createElement('span');
      span.innerHTML = `${item.icon} ${item.value}`;
      stats.appendChild(span);
    });
    card.appendChild(stats);
    card.addEventListener('click', () => {
      renderPTClientDetail(pt, client);
    });
    clientsGrid.appendChild(card);
    // Draw sparkline after adding to DOM
    setTimeout(() => {
      drawSparkline(sparkline, client.metrics.calories, client.metrics.baselineCalories);
    }, 0);
  });
  app.appendChild(clientsGrid);
  // Actions
  const actions = document.createElement('div');
  actions.className = 'actions';
  const logoutLink = document.createElement('div');
  logoutLink.className = 'link';
  logoutLink.textContent = 'Log out';
  logoutLink.addEventListener('click', () => {
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    renderLogin();
  });
  actions.appendChild(logoutLink);
  app.appendChild(actions);
}

// Compute AI suggestions based on metrics
function computeSuggestions(client) {
  const { sleep, calories, stress, baselineCalories } = client.metrics;
  const suggestions = [];
  const avgSleep = sleep.reduce((a, b) => a + b, 0) / sleep.length;
  const avgCal = calories.reduce((a, b) => a + b, 0) / calories.length;
  const avgStress = stress.reduce((a, b) => a + b, 0) / stress.length;

  // Sleep suggestion
  if (avgSleep < 7) {
    suggestions.push(
      `Average sleep is ${avgSleep.toFixed(1)} hours. Encourage maintaining at least 7 hours of quality sleep by establishing a consistent bedtime routine.`
    );
  } else if (avgSleep > 8) {
    suggestions.push(
      `Average sleep is ${avgSleep.toFixed(1)} hours. Ensure the client wakes up refreshed and avoids oversleeping that may impact alertness.`
    );
  }

  // Calorie suggestion
  if (avgCal > baselineCalories * 1.05) {
    const surplus = Math.round(avgCal - baselineCalories);
    suggestions.push(
      `Average daily caloric intake exceeds baseline by about ${surplus} calories. Plan nutrient‑dense meals and reduce high‑calorie snacks.`
    );
  } else if (avgCal < baselineCalories * 0.95) {
    const deficit = Math.round(baselineCalories - avgCal);
    suggestions.push(
      `Average daily caloric intake is below baseline by about ${deficit} calories. Ensure adequate fuel for performance and recovery.`
    );
  }

  // Stress suggestion
  if (avgStress > 4) {
    suggestions.push(
      `Average stress level is elevated. Incorporate stress‑management techniques such as mindfulness, controlled breathing or short walks.`
    );
  }

  // Event‑based suggestions from calendar
  client.calendar.forEach((event) => {
    if (event.stress >= 5) {
      suggestions.push(
        `Upcoming event “${event.event}” on ${event.date} may increase stress. Recommend extra sleep the night before and a balanced meal to maintain energy.`
      );
    }
  });

  if (suggestions.length === 0) {
    suggestions.push('No major flags detected. Keep up the good work and continue monitoring.');
  }
  return suggestions;
}

// Render detailed view for a PT's single client
function renderPTClientDetail(pt, client) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  // Header bar with back button
  const header = document.createElement('div');
  header.className = 'header';
  const back = document.createElement('div');
  back.className = 'link';
  back.textContent = '← Back';
  back.addEventListener('click', () => {
    renderPTDashboard(pt);
  });
  const logo = document.createElement('div');
  logo.className = 'logo';
  const logoImg = document.createElement('img');
  logoImg.src = 'logo.png';
  logoImg.alt = 'INCH logo';
  logoImg.style.height = '32px';
  logoImg.style.display = 'block';
  logo.appendChild(logoImg);
  const titleSpan = document.createElement('span');
  titleSpan.style.color = '#B6FF00';
  titleSpan.style.fontSize = '1.2rem';
  titleSpan.style.fontWeight = '600';
  titleSpan.style.marginLeft = '8px';
  titleSpan.textContent = client.name;
  logo.appendChild(titleSpan);
  const user = document.createElement('div');
  user.className = 'user';
  user.textContent = `👤 ${pt.name}`;
  header.appendChild(back);
  header.appendChild(logo);
  header.appendChild(user);
  app.appendChild(header);
  // Detail content grid
  const detailContent = document.createElement('div');
  detailContent.className = 'detail-content';
  // Chart
  const chartDiv = document.createElement('div');
  const chartCanvas = document.createElement('canvas');
  chartCanvas.height = 300;
  chartCanvas.width = 800;
  chartDiv.appendChild(chartCanvas);
  detailContent.appendChild(chartDiv);
  setTimeout(() => {
    drawBarChart(chartCanvas, client.metrics);
  }, 0);
  // Metrics cards for individual categories
  const metricsSection = document.createElement('div');
  metricsSection.className = 'detail-metrics';
  const metricsList = [
    { label: 'Sleep (avg h)', value: (
        client.metrics.sleep.reduce((a, b) => a + b, 0) / client.metrics.sleep.length
      ).toFixed(1), icon: '💤' },
    { label: 'Calories (avg)', value: Math.round(
        client.metrics.calories.reduce((a, b) => a + b, 0) / client.metrics.calories.length
      ), icon: '🍽️' },
    { label: 'Stress (avg)', value: (
        client.metrics.stress.reduce((a, b) => a + b, 0) / client.metrics.stress.length
      ).toFixed(1), icon: '😓' },
    { label: 'Workouts (last 7d)', value: client.metrics.workouts.reduce((a, b) => a + b, 0), icon: '🏋️' },
  ];
  metricsList.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'metric-card';
    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = m.icon;
    const value = document.createElement('div');
    value.className = 'value';
    value.textContent = m.value;
    const label = document.createElement('div');
    label.className = 'label';
    label.textContent = m.label;
    card.appendChild(icon);
    card.appendChild(value);
    card.appendChild(label);
    metricsSection.appendChild(card);
  });
  detailContent.appendChild(metricsSection);
  // Suggestions
  const suggestions = computeSuggestions(client);
  const suggestionsContainer = document.createElement('div');
  const suggestionsTitle = document.createElement('h3');
  suggestionsTitle.style.color = '#B6FF00';
  suggestionsTitle.textContent = 'AI suggestions & insights';
  suggestionsContainer.appendChild(suggestionsTitle);
  const list = document.createElement('ul');
  list.className = 'suggestions-list';
  suggestions.forEach((text) => {
    const li = document.createElement('li');
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'emoji';
    emojiSpan.textContent = getSuggestionEmoji(text);
    const msg = document.createElement('span');
    msg.textContent = text;
    li.appendChild(emojiSpan);
    li.appendChild(msg);
    list.appendChild(li);
  });
  suggestionsContainer.appendChild(list);
  detailContent.appendChild(suggestionsContainer);
  app.appendChild(detailContent);
  // Actions
  const actions = document.createElement('div');
  actions.className = 'actions';
  const backBtn = document.createElement('button');
  backBtn.className = 'btn';
  backBtn.textContent = 'Back to clients';
  backBtn.addEventListener('click', () => {
    renderPTDashboard(pt);
  });
  const sendBtn = document.createElement('button');
  sendBtn.className = 'btn';
  sendBtn.textContent = 'Send summary to client';
  sendBtn.addEventListener('click', () => {
    alert('Summary sent to client!');
  });
  const logoutLink = document.createElement('div');
  logoutLink.className = 'link';
  logoutLink.textContent = 'Log out';
  logoutLink.addEventListener('click', () => {
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    renderLogin();
  });
  actions.appendChild(backBtn);
  actions.appendChild(sendBtn);
  actions.appendChild(logoutLink);
  app.appendChild(actions);
}

// Draw a simple bar chart for calories relative to baseline using Canvas API
function drawBarChart(canvas, metrics) {
  const ctx = canvas.getContext('2d');
  const { calories, baselineCalories, sleep, stress } = metrics;
  const days = calories.length;
  const width = canvas.width;
  const height = canvas.height;
  const margin = 40;
  const barWidth = (width - margin * 2) / days;
  // Determine max value to scale bars (max of calories and baseline)
  const maxValue = Math.max(...calories.concat([baselineCalories])) * 1.2;
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  // Draw axes
  ctx.strokeStyle = '#6B6B6B';
  ctx.lineWidth = 1;
  // Y axis
  ctx.beginPath();
  ctx.moveTo(margin, margin);
  ctx.lineTo(margin, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.stroke();
  // Draw baseline line
  const baseY = height - margin - (baselineCalories / maxValue) * (height - margin * 2);
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#B6FF00';
  ctx.beginPath();
  ctx.moveTo(margin, baseY);
  ctx.lineTo(width - margin, baseY);
  ctx.stroke();
  ctx.setLineDash([]);
  // Label baseline
  ctx.fillStyle = '#B6FF00';
  ctx.font = '12px sans-serif';
  ctx.fillText('Baseline', width - margin - 60, baseY - 6);
  // Draw bars and day labels
  for (let i = 0; i < days; i++) {
    const barHeight = (calories[i] / maxValue) * (height - margin * 2);
    const x = margin + i * barWidth + barWidth * 0.2;
    const y = height - margin - barHeight;
    const w = barWidth * 0.6;
    // Bar color: above baseline -> electric lime; below -> grey
    ctx.fillStyle = calories[i] >= baselineCalories ? '#B6FF00' : '#6B6B6B';
    ctx.fillRect(x, y, w, barHeight);
    // Day label (Day 1..7)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px sans-serif';
    ctx.fillText(`Day ${i + 1}`, x + w / 4, height - margin + 12);
    // Value label
    ctx.fillText(calories[i], x + w / 4, y - 4);
  }
}
// Draw a tiny sparkline within client cards
function drawSparkline(canvas, calories, baseline) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const marginX = 4;
  const points = calories.length;
  const maxVal = Math.max(...calories.concat([baseline])) * 1.1;
  // Clear
  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();
  ctx.strokeStyle = '#6B6B6B';
  ctx.lineWidth = 1;
  // Baseline line
  const baselineY = height - (baseline / maxVal) * height;
  ctx.setLineDash([2, 2]);
  ctx.moveTo(marginX, baselineY);
  ctx.lineTo(width - marginX, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);
  // Draw spark line
  ctx.beginPath();
  calories.forEach((val, idx) => {
    const x = marginX + (idx / (points - 1)) * (width - marginX * 2);
    const y = height - (val / maxVal) * height;
    if (idx === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = '#B6FF00';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// Get an emoji based on the suggestion text
function getSuggestionEmoji(text) {
  const lower = text.toLowerCase();
  if (lower.includes('sleep')) return '💤';
  if (lower.includes('calor')) return '🍽️';
  if (lower.includes('stress')) return '😓';
  if (lower.includes('event')) return '📅';
  return '✅';
}

// Render client summary page for clients
function renderClientSummary(client) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  // Header
  const header = document.createElement('div');
  header.className = 'header';
  const logo = document.createElement('div');
  logo.className = 'logo';
  const logoImg = document.createElement('img');
  logoImg.src = 'logo.png';
  logoImg.alt = 'INCH logo';
  logoImg.style.height = '32px';
  logoImg.style.display = 'block';
  logo.appendChild(logoImg);
  const subtitle = document.createElement('div');
  subtitle.className = 'subtitle';
  subtitle.textContent = `Hello, ${client.name}`;
  const logoutLink = document.createElement('div');
  logoutLink.className = 'user';
  logoutLink.textContent = 'Log out';
  logoutLink.style.cursor = 'pointer';
  logoutLink.addEventListener('click', () => {
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    renderLogin();
  });
  header.appendChild(logo);
  header.appendChild(subtitle);
  header.appendChild(logoutLink);
  app.appendChild(header);
  // Suggestions section
  const container = document.createElement('div');
  container.style.marginTop = '40px';
  const tag = document.createElement('h2');
  tag.style.color = '#B6FF00';
  tag.textContent = 'Your coach’s latest feedback';
  container.appendChild(tag);
  const suggestions = computeSuggestions(client);
  const list = document.createElement('ul');
  list.className = 'suggestions-list';
  suggestions.forEach((text) => {
    const li = document.createElement('li');
    const emojiSpan = document.createElement('span');
    emojiSpan.className = 'emoji';
    emojiSpan.textContent = getSuggestionEmoji(text);
    const msg = document.createElement('span');
    msg.textContent = text;
    li.appendChild(emojiSpan);
    li.appendChild(msg);
    list.appendChild(li);
  });
  container.appendChild(list);
  app.appendChild(container);
}

// On page load, check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  if (role && userId) {
    if (role === 'pt') {
      const pt = sampleData.pts.find((p) => p.id === userId);
      if (pt) {
        renderPTDashboard(pt);
        return;
      }
    } else if (role === 'client') {
      const client = sampleData.clients[userId];
      if (client) {
        renderClientSummary(client);
        return;
      }
    }
  }
  // Default: show login
  renderLogin();
});