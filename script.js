/* script.js — single-file app logic (mock back-end using localStorage) */

/* ---------- Helpers ---------- */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
const uid = () => Math.random().toString(36).slice(2,9);

/* ---------- UI Setup ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
const navToggle = $('#nav-toggle'), navMenu = $('#nav-menu');
navToggle?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('show');
  navToggle.setAttribute('aria-expanded', open);
});

/* Populate stats (mock) */
function updateStats(){ 
  $('#stat-students').textContent = localStorage.getItem('stat_students') || 124;
  $('#stat-startups').textContent = localStorage.getItem('stat_startups') || 18;
  $('#stat-mentors').textContent = localStorage.getItem('stat_mentors') || 32;
}
updateStats();

/* ---------- Sample data ---------- */
const MENTORS = [
  {id:'m1',name:'Rohit Kumar', role:'CTO in Residence', bio:'Tech founder, full-stack mentor', topics:['Tech','Scaling']},
  {id:'m2',name:'Alok Raj', role:'CMO', bio:'Growth & marketing expert', topics:['Growth','Content']},
  {id:'m3',name:'Nobesh Yogi', role:'IP Advisor', bio:'Patent & legal counsel', topics:['IP','Legal']},
];

const STARTUPS = [
  {id:'s1',name:'EcoCharge', founders:'Aisha & Ravi', stage:'MVP Ready', pitch:'Portable solar chargers for students', demo:'https://www.youtube.com/watch?v=dQw4w9WgXcQ'},
  {id:'s2',name:'StudyBuddy', founders:'Tina', stage:'Pre-MVP', pitch:'AI note generator for lectures', demo:''},
];

const BLOGS = [
  {id:'b1',title:'How to pick a co-founder', excerpt:'Quick practical checklist...'},
  {id:'b2',title:'Running a 2-week hackathon', excerpt:'Plan, tools, exercises...'},
];

/* ---------- Render lists ---------- */
function renderMentors(){
  const root = $('#mentors-list');
  root.innerHTML = MENTORS.map(m=>`
    <article class="card">
      <h4>${m.name}</h4>
      <p class="muted">${m.role}</p>
      <p>${m.bio}</p>
      <p class="small muted">Topics: ${m.topics.join(', ')}</p>
      <div class="card-actions">
        <button class="btn small" data-mentor="${m.id}" onclick="bookMentor('${m.id}')">Book</button>
      </div>
    </article>
  `).join('');
}
function renderStartups(){
  $('#startups-list').innerHTML = STARTUPS.map(s=>`
    <article class="card">
      <h4>${s.name}</h4>
      <p class="muted">Founders: ${s.founders} • ${s.stage}</p>
      <p>${s.pitch}</p>
      <div class="card-actions">
        ${s.demo ? `<a class="btn small" href="${s.demo}" target="_blank">Demo</a>` : `<button class="btn small ghost" disabled>No Demo</button>`}
      </div>
    </article>
  `).join('');
}
function renderBlog(){
  $('#blog-list').innerHTML = BLOGS.map(b=>`
    <article class="card">
      <h4>${b.title}</h4>
      <p class="muted">${b.excerpt}</p>
      <div class="card-actions"><a class="btn small" href="#">Read</a></div>
    </article>
  `).join('');
}
renderMentors(); renderStartups(); renderBlog();

/* ---------- Apply form multi-step & save ---------- */
const applyForm = $('#apply-form');
const steps = $$('.step', applyForm);
let currentStep = 0;

function showStep(i){
  steps.forEach((s, idx)=> s.classList.toggle('hidden', idx !== i));
  currentStep = i;
}
showStep(0);

/* Prefill when clicking "Apply" on cards */
$$('a[data-prefill]').forEach(a => a.addEventListener('click', e=>{
  const p = e.currentTarget.dataset.prefill;
  $('#program-select').value = p;
  document.location.hash = '#apply';
  showStep(1);
}));

$('#to-step-2').addEventListener('click', ()=> showStep(1));
$('#to-step-1').addEventListener('click', ()=> showStep(0));
$('#to-step-3').addEventListener('click', ()=> showStep(2));
$('#to-step-2b').addEventListener('click', ()=> showStep(1));

/* File upload simulation */
const resumeInput = $('#resume-input');
const progress = $('#upload-progress');
const uploadFilename = $('#upload-filename');

resumeInput.addEventListener('change', async (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  if(f.size > 5*1024*1024){ alert('File too large > 5MB'); resumeInput.value=''; return; }
  uploadFilename.textContent = f.name;
  progress.classList.remove('hidden');
  // simulate upload
  for(let p=0;p<=100;p+=10){
    progress.value = p; await new Promise(r=>setTimeout(r,60));
  }
  progress.classList.add('hidden');
});

/* Submit */
applyForm.addEventListener('submit', (ev)=>{
  ev.preventDefault();
  const form = new FormData(applyForm);
  const app = {
    id: uid(),
    name: form.get('fullName'),
    email: form.get('email'),
    phone: form.get('phone'),
    program: form.get('program'),
    summary: form.get('summary'),
    resumeName: resumeInput.files[0] ? resumeInput.files[0].name : null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  // Save to local "db"
  const apps = JSON.parse(localStorage.getItem('apps')||'[]');
  apps.unshift(app);
  localStorage.setItem('apps', JSON.stringify(apps));
  $('#apply-result').classList.remove('hidden');
  $('#apply-result').textContent = 'Application submitted! Check your dashboard. (This demo stores data locally.)';
  // Reset form lightly for demo
  applyForm.reset(); showStep(0);
  // update student stat
  localStorage.setItem('stat_students', (Number(localStorage.getItem('stat_students')||124)+1));
  updateStats();
});

/* ---------- Dashboard & login (simple mock) ---------- */
const loginBtn = $('#login-btn');
loginBtn.addEventListener('click', ()=> openLogin());

function openLogin(){
  const email = prompt('Enter your email (demo login):');
  if(!email) return;
  localStorage.setItem('user', JSON.stringify({email, name: email.split('@')[0]}));
  alert('Logged in as ' + email);
  renderDashboard();
  document.location.hash = '#dashboard';
}

function renderDashboard(){
  const user = JSON.parse(localStorage.getItem('user')||'null');
  if(!user) return;
  $('#dashboard').classList.remove('hidden');
  $('#dash-name').textContent = `Hi, ${user.name}`;
  const apps = JSON.parse(localStorage.getItem('apps')||'[]').filter(a=>a.email === user.email);
  const bookings = JSON.parse(localStorage.getItem('bookings')||'[]').filter(b=>b.email===user.email);
  $('#dash-info').innerHTML = `
    <p class="muted small">Applications: ${apps.length || 0}</p>
    <ul>${apps.map(a=>`<li>${a.program} — ${a.status} <small class="muted">(${new Date(a.createdAt).toLocaleDateString()})</small></li>`).join('')}</ul>
    <p class="muted small">Bookings: ${bookings.length || 0}</p>
  `;
  // sandbox score (demo)
  const score = Math.min(100, (apps.length*20 + (bookings.length*10)));
  $('#sandbox-score').innerHTML = `<div class="progress" aria-hidden="true"><i style="width:${score}%"></i></div><p class="muted small">Points: ${score}</p>`;
}

/* On load show dashboard if logged in */
if(localStorage.getItem('user')) renderDashboard();

/* ---------- Booking modal & logic ---------- */
function createModal(html){
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div><style>
    .modal{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);z-index:9999}
    .modal .card{max-width:520px;width:100px;padding:1rem}
  </style>`;
  root.addEventListener('click', e=>{ if(e.target===root) root.innerHTML=''; });
}
window.bookMentor = function(mid){
  const m = MENTORS.find(x=>x.id===mid);
  createModal(`<div class="card"><h3>Book Mentor — ${m.name}</h3>
    <p class="muted">${m.role}</p>
    <label>Your email <input id="book-email" type="email" required /></label>
    <label>Select slot <input id="book-slot" placeholder="2025-11-15 15:00" /></label>
    <div class="card-actions"><button class="btn" id="confirm-book">Confirm</button><button class="btn ghost" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button></div>
    </div>`);
  $('#confirm-book').addEventListener('click', ()=>{
    const email = $('#book-email').value;
    const slot = $('#book-slot').value;
    if(!email || !slot){ alert('Fill email and slot'); return; }
    const bookings = JSON.parse(localStorage.getItem('bookings')||'[]');
    bookings.unshift({id:uid(),mentor:mid,email,slot,status:'pending',createdAt:new Date().toISOString()});
    localStorage.setItem('bookings', JSON.stringify(bookings));
    alert('Booked (demo). Mentor will confirm via admin.');
    document.getElementById('modal-root').innerHTML='';
    updateStats();
  });
};

$$('.book-btn').forEach(btn => btn.addEventListener('click', e=>{
  const type = e.currentTarget.dataset.type;
  createModal(`<div class="card"><h3>Book NovStay — ${type}</h3>
    <label>Your email <input id="stay-email" type="email" /></label>
    <label>Start date <input id="stay-start" type="date" /></label>
    <label>Duration (weeks) <input id="stay-weeks" type="number" value="4" min="1" /></label>
    <div class="card-actions"><button class="btn" id="confirm-stay">Proceed</button><button class="btn ghost" onclick="document.getElementById('modal-root').innerHTML=''">Cancel</button></div>
  </div>`);
  $('#confirm-stay').addEventListener('click', ()=>{
    const email = $('#stay-email').value;
    const start = $('#stay-start').value;
    const weeks = $('#stay-weeks').value;
    if(!email || !start){ alert('Email and start date required'); return; }
    const bookings = JSON.parse(localStorage.getItem('bookings')||'[]');
    bookings.unshift({id:uid(),type,email,start,weeks,status:'requested',createdAt:new Date().toISOString()});
    localStorage.setItem('bookings', JSON.stringify(bookings));
    alert('Booking requested (demo). Pay later via admin or your dashboard.');
    document.getElementById('modal-root').innerHTML='';
    updateStats();
  });
}));

/* ---------- Contact form (demo) ---------- */
$('#contact-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const f = new FormData(e.target);
  // In production: send to server / SendGrid
  $('#contact-result').textContent = 'Message received — we will contact you soon (demo)';
  e.target.reset();
});

/* ---------- Admin simple unlock & view ---------- */
$('#admin-unlock').addEventListener('click', ()=>{
  const pass = $('#admin-pass').value;
  // NOTE: replace with real auth & strong checks in production
  if(pass === 'novadmin123'){
    $('#admin-area').classList.remove('hidden');
    $('#admin-login').classList.add('hidden');
    renderAdminApps();
  } else alert('Wrong passcode.');
});

function renderAdminApps(){
  const apps = JSON.parse(localStorage.getItem('apps')||'[]');
  $('#admin-apps').innerHTML = apps.length ? apps.map(a=>`
    <div class="card">
      <strong>${a.name}</strong> (${a.program}) — <em>${a.status}</em>
      <p class="muted small">${a.email} • ${new Date(a.createdAt).toLocaleString()}</p>
      <div class="card-actions">
        <button class="btn small" onclick="adminAction('${a.id}','approve')">Approve</button>
        <button class="btn ghost small" onclick="adminAction('${a.id}','reject')">Reject</button>
      </div>
    </div>
  `).join('') : '<p class="muted small">No applications yet.</p>';
}

window.adminAction = function(id, action){
  const apps = JSON.parse(localStorage.getItem('apps')||'[]');
  const idx = apps.findIndex(a=>a.id===id);
  if(idx===-1) return alert('Not found');
  apps[idx].status = action==='approve' ? 'approved' : 'rejected';
  apps[idx].reviewedAt = new Date().toISOString();
  localStorage.setItem('apps', JSON.stringify(apps));
  renderAdminApps();
  alert('Application ' + apps[idx].status);
};

/* ---------- Ready / hydration ---------- */
window.addEventListener('hashchange', ()=>{
  const h = location.hash.replace('#','');
  if(h==='dashboard' && localStorage.getItem('user')) renderDashboard();
});
