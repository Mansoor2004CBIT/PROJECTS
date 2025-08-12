// Vite: you can set VITE_API_URL for production. When not set we use '' so /api/... works locally (Vite proxy)
const API_ROOT = import.meta.env.VITE_API_URL || ''; // e.g., 'https://backend-xxx.onrender.com'

document.getElementById('year').textContent = new Date().getFullYear();

async function loadProjects() {
  try {
    const res = await fetch(`${API_ROOT}/api/projects`);
    const projects = await res.json();
    const container = document.getElementById('project-list');
    container.innerHTML = '';
    projects.forEach(p => {
      const el = document.createElement('div');
      el.className = 'project';
      el.innerHTML = `
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.description)}</p>
        ${p.url ? `<a href="${p.url}" target="_blank" rel="noreferrer">Open</a>` : ''}
      `;
      container.appendChild(el);
    });
  } catch (err) {
    console.error('Failed to load projects', err);
    document.getElementById('project-list').textContent = 'Failed to load projects.';
  }
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// Contact form submit
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  status.textContent = 'Sending…';
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch(`${API_ROOT}/api/contact`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (res.ok) {
      status.textContent = 'Message sent — thank you!';
      form.reset();
    } else {
      status.textContent = json.error || 'Error sending message';
    }
  } catch (err) {
    console.error(err);
    status.textContent = 'Server error. Try again later.';
  }
});

// init
loadProjects();
