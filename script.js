// Theme
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

function setTheme(t) {
  html.setAttribute('data-theme', t);
  localStorage.setItem('blade-theme', t);

  if (t === 'dark') {
    themeIcon.className = 'bi bi-sun';
    themeLabel.textContent = 'Светлая';
  } else {
    themeIcon.className = 'bi bi-moon-stars';
    themeLabel.textContent = 'Тёмная';
  }
}

themeToggle.addEventListener('click', () => {
  const cur = html.getAttribute('data-theme');
  setTheme(cur === 'dark' ? 'light' : 'dark');
});

const saved = localStorage.getItem('blade-theme') || 'dark';
setTheme(saved);

// Schedule data
const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
// DB link
// https://docs.google.com/spreadsheets/d/1jXKz_qHcsQQzFAolH8s18QhYP18JfQme2FsEYzMn8gs/edit?gid=0#gid=0
const SHEET_URL = "https://opensheet.elk.sh/1jXKz_qHcsQQzFAolH8s18QhYP18JfQme2FsEYzMn8gs/Sheet1";

let scheduleData = [];

async function loadScheduleFromSheet() {
  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();

    console.log("RAW:", text);

    scheduleData = JSON.parse(text);

    console.log("Parsed:", scheduleData);

    renderSchedule('Годжо Сатору', document.querySelector('#scheduleTabs .nav-link'));

  } catch (err) {
    console.error("Ошибка загрузки:", err);
  }
}

function getSlotFromSheet(masterName, dayIdx, time) {
  if (!scheduleData.length) return 'free';

  const today = new Date();
  let day = today.getDay();
  if (day === 0) day = 7;

  const monday = new Date(today);
  monday.setDate(today.getDate() - (day - 1));

  const target = new Date(monday);
  target.setDate(monday.getDate() + dayIdx);

  const yyyy = target.getFullYear();
  const mm = String(target.getMonth() + 1).padStart(2, '0');
  const dd = String(target.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;

  const slot = scheduleData.find(item =>
    item.master === masterName &&
    item.date === dateStr &&
    item.time === time
  );

  return slot && slot.status === 'busy' ? 'busy' : 'free';
}

function buildScheduleTable(masterName) {
  let html = `<table class="schedule-table"><thead><tr><th>Время</th>`;

  days.forEach(d => {
    html += `<th>${d}</th>`;
  });

  html += `</tr></thead><tbody>`;

  times.forEach(t => {
    html += `<tr><td class="slot-time">${t}</td>`;

    days.forEach((_, di) => {
      const slot = getSlotFromSheet(masterName, di, t);

      html += slot === 'free'
        ? `<td class="slot-free">✓</td>`
        : `<td class="slot-busy">✕</td>`;
    });

    html += `</tr>`;
  });

  html += `</tbody></table>`;
  return html;
}

function renderSchedule(masterName, btn) {
  document.querySelectorAll('#scheduleTabs .nav-link')
    .forEach(b => b.classList.remove('active'));

  if (btn) btn.classList.add('active');

  document.getElementById('scheduleContainer').innerHTML =
    buildScheduleTable(masterName);
}

loadScheduleFromSheet();
