document.addEventListener("DOMContentLoaded", () => {
/* ════════════════════════════════════════
   JKPS Tech Solutions — script.js
   Replace SUPABASE_URL and SUPABASE_ANON_KEY
   before deploying.
════════════════════════════════════════ */

// ── SUPABASE INIT ──────────────────────
const SUPABASE_URL      = "https://meseaqdbvchhbaiosejc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lc2VhcWRidmNoaGJhaW9zZWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDI4OTUsImV4cCI6MjA5MTc3ODg5NX0.4UtbneF89OZiPlAYypkODp7PmJcbprajW0m6jRpLsGA";
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── CORRECT ANSWERS ────────────────────
const ANSWERS = {
  q1:  'b', // 80 km/h
  q2:  'b', // 36
  q3:  'b', // 42
  q4:  'b', // ₹1050
  q5:  'a', // KBWB
  q6:  'b', // <style>
  q7:  'c', // font-size
  q8:  'b', // hyperlink
  q9:  'c', // background-color
  q10: 'b', // alt
};

let currentAssessmentCode  = null;
let currentAssessmentEmail = null;

/* ════════════════════════════════════════
   HEADER — scroll shadow + mobile menu
════════════════════════════════════════ */
const header    = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Active nav highlight on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('nav .nav-link');

function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top    = sec.offsetTop;
    const height = sec.offsetHeight;
    const id     = sec.getAttribute('id');
    const link   = document.querySelector(`nav a[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + height);
  });
}
window.addEventListener('scroll', updateActiveNav);

/* ════════════════════════════════════════
   INTERSECTION OBSERVER — fade-in
════════════════════════════════════════ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.info-card, .question-card').forEach(el => observer.observe(el));

/* ════════════════════════════════════════
   COUNTDOWN TIMER
════════════════════════════════════════ */
(function initCountdown() {
  const now      = new Date();
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + 1);
  deadline.setHours(23, 59, 0, 0);

  const hoursEl = document.getElementById('cd-hours');
  const minsEl  = document.getElementById('cd-mins');
  const secsEl  = document.getElementById('cd-secs');
  const timerEl = document.getElementById('countdown');
  const closedEl = document.getElementById('closedMsg');

  function tick() {
    const diff = deadline - new Date();
    if (diff <= 0) {
      timerEl.style.display  = 'none';
      closedEl.style.display = 'block';
      return;
    }
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000)    / 1_000);
    hoursEl.textContent = String(h).padStart(2, '0');
    minsEl.textContent  = String(m).padStart(2, '0');
    secsEl.textContent  = String(s).padStart(2, '0');
  }
  tick();
  setInterval(tick, 1000);
})();

/* ════════════════════════════════════════
   FILE DROP ZONE
════════════════════════════════════════ */
const fileDrop    = document.getElementById('fileDrop');
const fileInput   = document.getElementById('fresume');
const fileContent = document.getElementById('fileDropContent');

fileDrop.addEventListener('click', () => fileInput.click());
fileDrop.addEventListener('dragover', e => { e.preventDefault(); fileDrop.classList.add('drag-over'); });
fileDrop.addEventListener('dragleave', () => fileDrop.classList.remove('drag-over'));
fileDrop.addEventListener('drop', e => {
  e.preventDefault();
  fileDrop.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFileSelect(fileInput.files[0]);
});

function handleFileSelect(file) {
  if (file.type !== 'application/pdf') {
    setFieldErr('fresume', 'Only PDF files are accepted.');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    setFieldErr('fresume', 'File size must be under 5 MB.');
    return;
  }
  clearFieldErr('fresume');
  fileInput._selectedFile = file;
  fileDrop.classList.add('has-file');
  fileContent.innerHTML = `<div class="file-icon">✅</div><div>${file.name}</div><div class="file-hint">${(file.size/1024).toFixed(0)} KB — ready to upload</div>`;
}

/* ════════════════════════════════════════
   FORM VALIDATION HELPERS
════════════════════════════════════════ */
function setFieldErr(id, msg) {
  const el = document.getElementById(id);
  const errEl = document.getElementById('err-' + id);
  if (el)    el.classList.add('invalid');
  if (errEl) errEl.textContent = msg;
}
function clearFieldErr(id) {
  const el = document.getElementById(id);
  const errEl = document.getElementById('err-' + id);
  if (el)    el.classList.remove('invalid');
  if (errEl) errEl.textContent = '';
}

function validateForm() {
  let valid = true;
  const fields = ['fname', 'femail', 'fcollege', 'fyear', 'fskills'];
  fields.forEach(f => clearFieldErr(f));
  clearFieldErr('fresume');

  if (!document.getElementById('fname').value.trim())    { setFieldErr('fname', 'Full name is required.'); valid = false; }
  const email = document.getElementById('femail').value.trim();
  if (!email)                                             { setFieldErr('femail', 'Email address is required.'); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))   { setFieldErr('femail', 'Enter a valid email address.'); valid = false; }
  if (!document.getElementById('fcollege').value.trim()) { setFieldErr('fcollege', 'College name is required.'); valid = false; }
  if (!document.getElementById('fyear').value)           { setFieldErr('fyear', 'Please select your year.'); valid = false; }
  if (!document.getElementById('fskills').value.trim())  { setFieldErr('fskills', 'Please mention at least one skill.'); valid = false; }
  if (!fileInput._selectedFile)                          { setFieldErr('fresume', 'Please upload your resume (PDF).'); valid = false; }

  return valid;
}

/* ════════════════════════════════════════
   GENERATE UNIQUE CODE
════════════════════════════════════════ */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/* ════════════════════════════════════════
   REGISTRATION FORM SUBMIT
════════════════════════════════════════ */
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const btn     = document.getElementById('submitBtn');
  const txtEl   = document.getElementById('submitText');
  const spinEl  = document.getElementById('submitSpinner');
  btn.disabled  = true;
  txtEl.style.display  = 'none';
  spinEl.style.display = 'inline-block';

  try {
    const name    = document.getElementById('fname').value.trim();
    const email   = document.getElementById('femail').value.trim();
    const college = document.getElementById('fcollege').value.trim();
    const year    = document.getElementById('fyear').value;
    const skills  = document.getElementById('fskills').value.trim();
    const file    = fileInput._selectedFile;

    // 1️⃣ Upload resume to Supabase Storage
    const fileName   = `${Date.now()}_${email.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    const { data: uploadData, error: uploadErr } = await supabase
      .storage.from('resumes').upload(fileName, file, { contentType: 'application/pdf' });

    if (uploadErr) throw new Error('Resume upload failed: ' + uploadErr.message);

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);
    const resumeUrl = urlData.publicUrl;

    // 2️⃣ Insert registration record
    const { error: insertErr } = await supabase.from('intern_registrations').insert({
      name, email, college, year, skills, resume_url: resumeUrl
    });
    if (insertErr) throw new Error('Registration save failed: ' + insertErr.message);

    // 3️⃣ Generate & store assessment code
    const code = generateCode();
    const { error: codeErr } = await supabase.from('assessment_codes').insert({
      email, code, is_used: false
    });
    if (codeErr) throw new Error('Code generation failed: ' + codeErr.message);
    // auto email sending
    await fetch("https://meseaqdbvchhbaiosejc.functions.supabase.co/send-registration-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email,
    name,
    code
  })
});

    // 4️⃣ Show success
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('formSuccess').style.display      = 'block';
    document.getElementById('formSuccess').scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    console.error(err);
    alert('Something went wrong: ' + err.message + '\n\nMake sure your Supabase keys are configured correctly.');
    btn.disabled = false;
    txtEl.style.display  = 'inline';
    spinEl.style.display = 'none';
  }
});

/* ════════════════════════════════════════
   ASSESSMENT CODE VALIDATION
════════════════════════════════════════ */
document.getElementById('startTestBtn').addEventListener('click', async () => {
  const codeInput = document.getElementById('assessCode');
  const errEl     = document.getElementById('codeErr');
  const btn       = document.getElementById('startTestBtn');
  const txtEl     = document.getElementById('startTestText');
  const spinEl    = document.getElementById('startTestSpinner');
  const code      = codeInput.value.trim().toUpperCase();

  errEl.style.display = 'none';
  errEl.textContent   = '';

  if (!code) {
    errEl.textContent   = '⚠️ Please enter your assessment code.';
    errEl.style.display = 'block';
    return;
  }

  btn.disabled = true;
  txtEl.style.display  = 'none';
  spinEl.style.display = 'inline-block';

  try {
    const { data, error } = await supabase
      .from('assessment_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) {
      throw new Error('Invalid or already used code. Please check and try again.');
    }
    if (data.is_used) {
      throw new Error('This code has already been used. Each code is valid for one attempt only.');
    }

    // Valid code — unlock quiz
    currentAssessmentCode  = code;
    currentAssessmentEmail = data.email;

    document.getElementById('assessment').style.display  = 'none';
    document.getElementById('quizSection').style.display = 'block';
    document.getElementById('quizSection').scrollIntoView({ behavior: 'smooth' });

    // Re-observe question cards for fade-in
    document.querySelectorAll('.question-card').forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });

    // Track answered questions for progress bar
    initQuizProgress();

  } catch (err) {
    errEl.textContent   = '❌ ' + err.message;
    errEl.style.display = 'block';
    btn.disabled = false;
    txtEl.style.display  = 'inline';
    spinEl.style.display = 'none';
  }
});

/* ════════════════════════════════════════
   QUIZ PROGRESS BAR
════════════════════════════════════════ */
function initQuizProgress() {
  const progressBar = document.getElementById('quizProgressBar');
  document.querySelectorAll('.question-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const total    = 10;
      const answered = new Set(
        [...document.querySelectorAll('.question-card input[type="radio"]:checked')]
          .map(r => r.name)
      ).size;
      progressBar.style.width = `${(answered / total) * 100}%`;

      // Mark card as answered
      const card = radio.closest('.question-card');
      if (card) card.classList.add('answered');
    });
  });
}

/* ════════════════════════════════════════
   QUIZ SUBMIT
════════════════════════════════════════ */
document.getElementById('quizForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const errEl  = document.getElementById('quizErr');
  const btn    = document.getElementById('quizSubmitBtn');
  const txtEl  = document.getElementById('quizSubmitText');
  const spinEl = document.getElementById('quizSpinner');

  errEl.style.display = 'none';

  // Ensure all questions answered
  const total    = 10;
  const answered = new Set(
    [...document.querySelectorAll('.question-card input[type="radio"]:checked')]
      .map(r => r.name)
  ).size;

  if (answered < total) {
    errEl.textContent   = `⚠️ Please answer all questions before submitting. (${answered}/${total} answered)`;
    errEl.style.display = 'block';
    errEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  btn.disabled = true;
  txtEl.style.display  = 'none';
  spinEl.style.display = 'inline-block';

  // Calculate score
  let score = 0;
  Object.entries(ANSWERS).forEach(([qId, correct]) => {
    const selected = document.querySelector(`input[name="${qId}"]:checked`);
    if (selected && selected.value === correct) score++;
  });

  try {
    // 1️⃣ Store result
    const { error: resultErr } = await supabase.from('assessment_results').insert({
      email: currentAssessmentEmail,
      score,
      submitted_at: new Date().toISOString()
    });
    if (resultErr) throw new Error('Failed to save result: ' + resultErr.message);
    // 1.5️⃣ Send result email
await fetch("https://meseaqdbvchhbaiosejc.functions.supabase.co/send-result-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: currentAssessmentEmail,
    score
  })
});

    // 2️⃣ Mark code as used
    const { error: codeErr } = await supabase
      .from('assessment_codes')
      .update({ is_used: true })
      .eq('code', currentAssessmentCode);
    if (codeErr) console.warn('Could not mark code as used:', codeErr.message);

    // 3️⃣ Show success
    document.getElementById('quizForm').style.display    = 'none';
    document.getElementById('quizSuccess').style.display = 'block';
    document.getElementById('scoreMsg').textContent =
      `You scored ${score} out of ${total}. Your result has been recorded and will be reviewed by our team.`;
    document.getElementById('quizSuccess').scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    console.error(err);
    errEl.textContent   = '❌ ' + err.message;
    errEl.style.display = 'block';
    btn.disabled = false;
    txtEl.style.display  = 'inline';
    spinEl.style.display = 'none';
  }
});

/* ════════════════════════════════════════
   SMOOTH SCROLL for all anchor links
════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
});