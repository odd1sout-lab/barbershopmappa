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

// Init theme
const saved = localStorage.getItem('blade-theme') || 'dark';
setTheme(saved);

// Schedule data
const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const times = ['10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

// Random schedule seed per master (deterministic-ish)
function getSlot(masterIdx, dayIdx, timeIdx) {
  const seed = (masterIdx * 7 + dayIdx + timeIdx * 3) % 5;
  if (dayIdx === 6 && timeIdx > 6) return 'busy'; // Sunday late
  if (seed === 0 || seed === 2) return 'busy';
  return 'free';
}

const masterIdxMap = {
  'Годжо Сатору': 0,
  'Габимару': 1,
  'Торфин Карлсефни': 2,
  'Хяккимару': 3
};

function buildScheduleTable(masterName) {
  const mi = masterIdxMap[masterName] || 0;
  let html = `<table class="schedule-table"><thead><tr><th>Время</th>`;
  days.forEach(d => { html += `<th>${d}</th>`; });
  html += `</tr></thead><tbody>`;
  times.forEach((t, ti) => {
    html += `<tr><td class="slot-time">${t}</td>`;
    days.forEach((_, di) => {
      const slot = getSlot(mi, di, ti);
      if (slot === 'free') {
        html += `<td class="slot-free">✓</td>`;
      } else {
        html += `<td class="slot-busy">✕</td>`;
      }
    });
    html += `</tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

function renderSchedule(masterName, btn) {
  // update tabs
  document.querySelectorAll('#scheduleTabs .nav-link').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('scheduleContainer').innerHTML = buildScheduleTable(masterName);
}

// Init default
renderSchedule('Годжо Сатору', document.querySelector('#scheduleTabs .nav-link'));

// Master schedule modal

function showMasterSchedule(masterName) {
  document.getElementById('scheduleModalTitle').innerHTML =
    `<i class="bi bi-calendar3 gold me-2"></i>Расписание: ${masterName}`;
  document.getElementById('scheduleModalBody').innerHTML = buildScheduleTable(masterName);
  document.getElementById('scheduleModalBook').onclick = () => {
    bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
    openBooking(masterName);
  };
  new bootstrap.Modal(document.getElementById('scheduleModal')).show();
}

// Booking modal

function openBooking(masterName) {
  const modal = new bootstrap.Modal(document.getElementById('bookingModal'));
  if (masterName) {
    document.getElementById('bookMaster').value = masterName;
  }
  // set today as default date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  document.getElementById('bookDate').value = `${yyyy}-${mm}-${dd}`;
  document.getElementById('msgPreview').style.display = 'none';
  modal.show();
}

function buildMessage() {
  const name    = document.getElementById('bookName').value.trim();
  const master  = document.getElementById('bookMaster').value;
  const date    = document.getElementById('bookDate').value;
  const time    = document.getElementById('bookTime').value;
  const service = document.getElementById('bookService').value;
  const comment = document.getElementById('bookComment').value.trim();

  // Format date
  let dateFormatted = date;
  if (date) {
    const d = new Date(date);
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateFormatted = d.toLocaleDateString('ru-RU', opts);
  }

  let msg = `*Запись в барбершоп MAPPA*\n`;
  msg += `━━━━━━━━━━━━━━━━━\n`;
  if (name)    msg += `Имя: ${name}\n`;
  if (master)  msg += `Мастер: ${master}\n`;
  if (date)    msg += `Дата: ${dateFormatted}\n`;
  if (time)    msg += `Время: ${time}\n`;
  if (service) msg += `Услуга: ${service}\n`;
  if (comment) msg += `Комментарий: ${comment}\n`;
  msg += `━━━━━━━━━━━━━━━━━\n`;
  msg += `Прошу подтвердить запись. Спасибо!`;
  return msg;
}

function previewMessage() {
  const msg = buildMessage();
  document.getElementById('msgText').textContent = msg;
  document.getElementById('msgPreview').style.display = 'block';
}

function sendWhatsApp() {
  const msg = buildMessage();
  const phone = '996558065411'; //phone number
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

window.addEventListener('scroll', () => {
  const nav = document.getElementById('mainNav');
  if (window.scrollY > 60) {
    nav.style.padding = '0.5rem 0';
  } else {
    nav.style.padding = '0.85rem 0';
  }
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  navLinks.forEach(l => {
    l.classList.remove('active-link');
    if (l.getAttribute('href') === '#' + current) l.classList.add('active-link');
  });
});