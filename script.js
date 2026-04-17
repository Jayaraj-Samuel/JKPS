document.addEventListener("DOMContentLoaded", () => {
/* ════════════════════════════════════════
   JKPS Tech Solutions — script.js
   Uses EmailJS for sending emails (no edge functions needed)
════════════════════════════════════════ */

// ── SUPABASE INIT ──────────────────────
const SUPABASE_URL      = "https://meseaqdbvchhbaiosejc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lc2VhcWRidmNoaGJhaW9zZWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDI4OTUsImV4cCI6MjA5MTc3ODg5NX0.4UtbneF89OZiPlAYypkODp7PmJcbprajW0m6jRpLsGA";
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── EMAILJS CONFIG ─────────────────────
// 👇 Fill in these 4 values from your EmailJS dashboard
const EMAILJS_PUBLIC_KEY          = "YOUR_PUBLIC_KEY";          // Account → General
const EMAILJS_SERVICE_ID          = "YOUR_SERVICE_ID";          // Email Services
const EMAILJS_TEMPLATE_REG        = "YOUR_REGISTRATION_TEMPLATE_ID";  // Template 1
const EMAILJS_TEMPLATE_RESULT     = "YOUR_RESULT_TEMPLATE_ID";        // Template 2

// Initialise EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

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
const header     = document.getElementById('header');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-menu .nav-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Active nav highlight on scroll
const sections = document.querySelectorAll('section[id]');

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
   REGISTRATIONS CLOSED — show immediately
════════════════════════════════════════ */
(function initCountdown() {
  const timerEl  = document.getElementById('countdown');
  const closedEl = document.getElementById('closedMsg');
  if (timerEl)  timerEl.style.display  = 'none';
  if (closedEl) closedEl.style.display = 'block';
  // Hide the Register Now button in the countdown card
  const regBtn = document.querySelector('.countdown-card .btn-primary');
  if (regBtn) regBtn.style.display = 'none';
})();

/* ════════════════════════════════════════
   REGISTRATION FORM — CLOSED
   Replace form with closed message
════════════════════════════════════════ */
(function lockRegistration() {
  const form    = document.getElementById('registrationForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  // Hide the form entirely
  form.style.display = 'none';

  // Show closed notice in its place
  const closed = document.createElement('div');
  closed.style.cssText = `
    text-align:center; padding:3rem 2rem;
    background:rgba(248,113,113,0.05);
    border:1px solid rgba(248,113,113,0.2);
    border-radius:20px; animation:fadeUp 0.5s ease;
  `;
  closed.innerHTML = `
    <div style="font-size:3rem;margin-bottom:1rem">⛔</div>
    <h3 style="font-family:'Syne',sans-serif;font-size:1.5rem;font-weight:700;color:#f87171;margin-bottom:0.75rem">Registrations Closed</h3>
    <p style="color:#7b829a;font-size:1rem;max-width:420px;margin:0 auto 1.5rem">
      Applications for the JKPS Summer Internship 2025 are now closed. The internship has already begun on April 20, 2025.
    </p>
    <p style="color:#7b829a;font-size:0.875rem">
      Already registered? <a href="intern-portal.html" style="color:#00e5ff;font-weight:600;text-decoration:none">Access your Intern Portal →</a>
    </p>
  `;
  form.parentNode.insertBefore(closed, success);
})();

// Dummy file input refs so rest of script doesn't break
const fileDrop   = document.getElementById('fileDrop');
const fileInput  = document.getElementById('fresume');
const fileContent = document.getElementById('fileDropContent');
function handleFileSelect() {}
function setFieldErr() {}
function clearFieldErr() {}
function validateForm() { return false; }
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}


/* ════════════════════════════════════════
   REGISTRATION FORM SUBMIT — DISABLED
   (Registrations are closed)
════════════════════════════════════════ */
// Registration is closed — form submit is blocked

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

  btn.disabled         = true;
  txtEl.style.display  = 'none';
  spinEl.style.display = 'inline-block';

  try {
    const { data, error } = await supabase
      .from('assessment_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (error || !data) throw new Error('Invalid or already used code. Please check and try again.');
    if (data.is_used)   throw new Error('This code has already been used. Each code is valid for one attempt only.');

    // Valid code — unlock quiz
    currentAssessmentCode  = code;
    currentAssessmentEmail = data.email;

    document.getElementById('assessment').style.display  = 'none';
    document.getElementById('quizSection').style.display = 'block';
    document.getElementById('quizSection').scrollIntoView({ behavior: 'smooth' });

    document.querySelectorAll('.question-card').forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });

    initQuizProgress();

  } catch (err) {
    errEl.textContent   = '❌ ' + err.message;
    errEl.style.display = 'block';
    btn.disabled         = false;
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

  btn.disabled         = true;
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

    // 2️⃣ Send result email via EmailJS
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_RESULT, {
      to_email : currentAssessmentEmail,
      score    : score,
    });

    // 3️⃣ Mark code as used
    const { error: codeErr } = await supabase
      .from('assessment_codes')
      .update({ is_used: true })
      .eq('code', currentAssessmentCode);
    if (codeErr) console.warn('Could not mark code as used:', codeErr.message);

    // 4️⃣ Show success
    document.getElementById('quizForm').style.display    = 'none';
    document.getElementById('quizSuccess').style.display = 'block';
    document.getElementById('scoreMsg').textContent =
      `You scored ${score} out of ${total}. Your result has been recorded and will be reviewed by our team.`;
    document.getElementById('quizSuccess').scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    console.error(err);
    errEl.textContent   = '❌ ' + err.message;
    errEl.style.display = 'block';
    btn.disabled         = false;
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
