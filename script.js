document.addEventListener("DOMContentLoaded", () => {

/* ═══════════════════════════════════════════
   JKPS Solutions — script.js
   Registrations: CLOSED
   Assessment: OPEN (for registered interns only)
   EmailJS: used for result email after quiz
═══════════════════════════════════════════ */

// ── SUPABASE ─────────────────────────────
const SUPABASE_URL      = "https://meseaqdbvchhbaiosejc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lc2VhcWRidmNoaGJhaW9zZWpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDI4OTUsImV4cCI6MjA5MTc3ODg5NX0.4UtbneF89OZiPlAYypkODp7PmJcbprajW0m6jRpLsGA";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── EMAILJS ───────────────────────────────
// Fill these 3 values from your EmailJS dashboard
const EMAILJS_PUBLIC_KEY      = "it0vy-uY3kT-sow_l";
const EMAILJS_SERVICE_ID      = "service_2w1y38i";
const EMAILJS_TEMPLATE_RESULT = "template_lkkps7q";
emailjs.init(EMAILJS_PUBLIC_KEY);

// ── QUIZ ANSWERS ─────────────────────────
const ANSWERS = {
  q1: 'b', q2: 'b', q3: 'b', q4: 'b', q5: 'a',
  q6: 'b', q7: 'c', q8: 'b', q9: 'c', q10: 'b',
};

let currentAssessmentCode  = null;
let currentAssessmentEmail = null;

/* ═══════════════════════════════════════════
   HEADER — scroll + mobile menu
═══════════════════════════════════════════ */
const header    = document.getElementById('header');
const hamburger = document.getElementById('hamburger');
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

// Active nav on scroll
const sections = document.querySelectorAll('section[id]');
function updateActiveNav() {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const id   = sec.getAttribute('id');
    const link = document.querySelector(`nav a[href="#${id}"]`);
    if (link) {
      link.classList.toggle('active',
        scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight
      );
    }
  });
}
window.addEventListener('scroll', updateActiveNav);

/* ═══════════════════════════════════════════
   INTERSECTION OBSERVER — fade-in cards
═══════════════════════════════════════════ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.info-card, .question-card').forEach(el => observer.observe(el));

/* ═══════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ═══════════════════════════════════════════
   ASSESSMENT CODE VALIDATION
═══════════════════════════════════════════ */
const startTestBtn = document.getElementById('startTestBtn');
if (startTestBtn) {
  startTestBtn.addEventListener('click', async () => {
    const codeInput = document.getElementById('assessCode');
    const errEl     = document.getElementById('codeErr');
    const txtEl     = document.getElementById('startTestText');
    const spinEl    = document.getElementById('startTestSpinner');
    const code      = codeInput.value.trim().toUpperCase();

    // Reset error
    errEl.style.display = 'none';
    errEl.textContent   = '';

    if (!code) {
      errEl.textContent   = '⚠️ Please enter your assessment code.';
      errEl.style.display = 'block';
      return;
    }

    startTestBtn.disabled = true;
    txtEl.style.display   = 'none';
    spinEl.style.display  = 'inline-block';

    try {
      const { data, error } = await supabase
        .from('assessment_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        throw new Error('Invalid code. Please double-check your assessment code and try again.');
      }
      if (data.is_used) {
        throw new Error('This code has already been used. Each code is valid for one attempt only.');
      }

      // Valid — store and show quiz
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
      startTestBtn.disabled = false;
      txtEl.style.display   = 'inline';
      spinEl.style.display  = 'none';
    }
  });
}

/* ═══════════════════════════════════════════
   QUIZ PROGRESS BAR
═══════════════════════════════════════════ */
function initQuizProgress() {
  const progressBar = document.getElementById('quizProgressBar');
  document.querySelectorAll('.question-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const answered = new Set(
        [...document.querySelectorAll('.question-card input[type="radio"]:checked')]
          .map(r => r.name)
      ).size;
      if (progressBar) progressBar.style.width = `${(answered / 10) * 100}%`;
      const card = radio.closest('.question-card');
      if (card) card.classList.add('answered');
    });
  });
}

/* ═══════════════════════════════════════════
   QUIZ SUBMIT
═══════════════════════════════════════════ */
const quizForm = document.getElementById('quizForm');
if (quizForm) {
  quizForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const errEl  = document.getElementById('quizErr');
    const btn    = document.getElementById('quizSubmitBtn');
    const txtEl  = document.getElementById('quizSubmitText');
    const spinEl = document.getElementById('quizSpinner');

    errEl.style.display = 'none';

    const answered = new Set(
      [...document.querySelectorAll('.question-card input[type="radio"]:checked')]
        .map(r => r.name)
    ).size;

    if (answered < 10) {
      errEl.textContent   = `⚠️ Please answer all 10 questions before submitting. (${answered}/10 answered)`;
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
      // 1. Save result to Supabase
      const { error: resultErr } = await supabase
        .from('assessment_results')
        .insert({
          email: currentAssessmentEmail,
          score,
          submitted_at: new Date().toISOString()
        });
      if (resultErr) throw new Error('Failed to save result: ' + resultErr.message);

      // 2. Send result email via EmailJS
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_RESULT, {
          to_email: currentAssessmentEmail,
          score:    score,
        });
      } catch (emailErr) {
        // Email failure should not block the user seeing their result
        console.warn('Email send failed:', emailErr);
      }

      // 3. Mark code as used
      await supabase
        .from('assessment_codes')
        .update({ is_used: true })
        .eq('code', currentAssessmentCode);

      // 4. Show success
      quizForm.style.display = 'none';
      const successBox = document.getElementById('quizSuccess');
      successBox.style.display = 'block';
      document.getElementById('scoreMsg').textContent =
        `You scored ${score} out of 10. Your result has been recorded and will be reviewed by our team. Check your email for your score summary.`;
      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      console.error(err);
      errEl.textContent   = '❌ ' + err.message;
      errEl.style.display = 'block';
      btn.disabled         = false;
      txtEl.style.display  = 'inline';
      spinEl.style.display = 'none';
    }
  });
}

}); // end DOMContentLoaded
