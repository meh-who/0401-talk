/**
 * Meijie Hu Portfolio - Main Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initTimeline();
  initCenterCarousel();
  initMediaOverlay();
  initIntroTransition();
  initTimelineSpans();
  buildEnvDesignDiagram();
});

/* ==========================================
   Loading Animation
   ========================================== */
function initLoader() {
  const loader = document.getElementById('loaderContainer');

  setTimeout(() => {
    if (loader) {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
    }
  }, 2000);
}

function activatePortfolio() {
  const verticalLayout = document.getElementById('vertical-layout');
  if (verticalLayout) verticalLayout.classList.add('active');

  const items = document.querySelectorAll('.timeline-entry, .timeline-entry-mobile');
  items.forEach((item, i) => {
    setTimeout(() => item.classList.add('visible'), 80 + i * 60);
  });

  setTimeout(calculateTimelineSpans, 600);
}

function deactivatePortfolio() {
  const verticalLayout = document.getElementById('vertical-layout');
  if (verticalLayout) verticalLayout.classList.remove('active');

  document.querySelectorAll('.timeline-entry, .timeline-entry-mobile').forEach((item) => {
    item.classList.remove('visible');
  });

  const carousel = document.getElementById('center-carousel');
  if (carousel) carousel.scrollTop = 0;
}

/* ==========================================
   Custom Cursor
   ========================================== */
function initCursor() {
  const cursorBox = document.getElementById('cursorBox');
  const cursorFill = document.getElementById('cursorFill');
  const pixelText = document.getElementById('pixelText');

  if (!cursorBox) return;
  if (window.innerWidth < 768) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    const ease = 0.12;
    cursorX += (mouseX - cursorX) * ease;
    cursorY += (mouseY - cursorY) * ease;

    cursorBox.style.left = (cursorX - 4) + 'px';
    cursorBox.style.top = (cursorY - 4) + 'px';
    if (cursorFill) {
      cursorFill.style.left = (cursorX - 5) + 'px';
      cursorFill.style.top = (cursorY - 5) + 'px';
    }
    if (pixelText) {
      pixelText.style.position = 'fixed';
      pixelText.style.left = (cursorX + 10) + 'px';
      pixelText.style.top = cursorY + 'px';
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

/* ==========================================
   Video Playback Helpers
   ========================================== */
function playVideosForIndices(track, indices) {
  indices.forEach((idx) => {
    const el = track.querySelector(`.center-carousel-item[data-index="${idx}"]`);
    if (el && el.tagName === 'VIDEO') {
      el.play().catch(() => {});
    }
  });
}

function pauseAllVideos(track) {
  track.querySelectorAll('video.center-carousel-item').forEach((v) => {
    v.pause();
  });
}

/* ==========================================
   Center Vertical Image Carousel
   ========================================== */
function initCenterCarousel() {
  const carousel = document.getElementById('center-carousel');
  const track = document.getElementById('center-carousel-track');
  const timeline = document.getElementById('timeline');
  if (!track || !timeline || !carousel) return;

  const items = track.querySelectorAll('.center-carousel-item');
  const entries = timeline.querySelectorAll('.timeline-entry');

  items.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const itemIndex = parseInt(item.dataset.index, 10);

      if (item.tagName === 'VIDEO') {
        item.play().catch(() => {});
      }

      timeline.classList.add('carousel-hover');
      entries.forEach((entry) => {
        const entryImages = entry.dataset.images ? entry.dataset.images.split(',').map(Number) : [];
        if (entryImages.includes(itemIndex)) {
          entry.classList.add('highlighted');
        } else {
          entry.classList.remove('highlighted');
        }
      });
    });

    item.addEventListener('mouseleave', () => {
      if (item.tagName === 'VIDEO') {
        item.pause();
      }

      timeline.classList.remove('carousel-hover');
      entries.forEach((entry) => entry.classList.remove('highlighted'));
    });
  });

  entries.forEach((entry) => {
    entry.addEventListener('mouseenter', () => {
      const entryImages = entry.dataset.images ? entry.dataset.images.split(',').map(Number) : [];
      if (entryImages.length === 0) return;

      carousel.classList.add('entry-hover');
      playVideosForIndices(track, entryImages);

      items.forEach((item) => {
        const itemIndex = parseInt(item.dataset.index, 10);
        if (entryImages.includes(itemIndex)) {
          item.classList.add('highlighted');
        } else {
          item.classList.remove('highlighted');
        }
      });

      const firstItem = track.querySelector(`.center-carousel-item[data-index="${entryImages[0]}"]`);
      if (firstItem) {
        const targetScroll = firstItem.offsetTop - carousel.clientHeight / 3;
        carousel.scrollTo({ top: Math.max(0, targetScroll), behavior: 'smooth' });
      }
    });

    entry.addEventListener('mouseleave', () => {
      carousel.classList.remove('entry-hover');
      pauseAllVideos(track);
      items.forEach((item) => item.classList.remove('highlighted'));
    });
  });
}

/* ==========================================
   Timeline Hover Effects
   ========================================== */
function initTimeline() {
  const navItems = document.querySelectorAll('header a, header li:not(.timeline-entry)');
  navItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      const cursorBox = document.getElementById('cursorBox');
      const cursorFill = document.getElementById('cursorFill');
      if (cursorBox) cursorBox.style.transform = 'translate(-50%, -50%) scale(0.5)';
      if (cursorFill) cursorFill.style.clipPath = 'inset(0%)';
    });
    item.addEventListener('mouseleave', () => {
      const cursorBox = document.getElementById('cursorBox');
      const cursorFill = document.getElementById('cursorFill');
      if (cursorBox) cursorBox.style.transform = 'translate(-50%, -50%) scale(1)';
      if (cursorFill) cursorFill.style.clipPath = 'inset(100%)';
    });
  });
}

/* ==========================================
   Timeline Multi-Year Span Heights
   ========================================== */
function calculateTimelineSpans() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const entries = Array.from(timeline.querySelectorAll('.timeline-entry'));

  entries.forEach((entry) => {
    if (!entry.classList.contains('multi-year') || !entry.dataset.spanTo) return;

    const targetIdx = parseInt(entry.dataset.spanTo, 10);
    const targetEntry = entries[targetIdx];
    if (!targetEntry) return;

    const spanHeight = targetEntry.offsetTop - entry.offsetTop;
    entry.style.setProperty('--span-height', spanHeight + 'px');
  });
}

function initTimelineSpans() {
  window.addEventListener('resize', () => requestAnimationFrame(calculateTimelineSpans));
}

/* ==========================================
   Intro Page Scroll Transition (bidirectional)
   ========================================== */
function initIntroTransition() {
  var introPage = document.getElementById('introPage');
  var whatIsEPage = document.getElementById('whatIsEPage');
  var introText = document.getElementById('introText');
  var scrollIndicator = document.getElementById('scrollIndicator');
  var carousel = document.getElementById('center-carousel');
  var navIntro = document.getElementById('navIntro');
  var navJourney = document.getElementById('navJourney');
  var navWhatIsE = document.getElementById('navWhatIsE');
  if (!introPage) return;

  var forwardAccum = 0;
  var reverseAccum = 0;
  var forwardThreshold = 250;
  var reverseThreshold = 200;
  var isTransitioning = false;
  var currentView = 'intro';

  setTimeout(function() {
    gsap.fromTo(introText,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }
    );
    gsap.to(scrollIndicator, { opacity: 1, duration: 0.8, delay: 0.4, ease: 'power2.out' });
  }, 2200);

  function updateNav() {
    if (navIntro) navIntro.classList.toggle('nav-active', currentView === 'intro');
    if (navJourney) navJourney.classList.toggle('nav-active', currentView === 'portfolio');
    if (navWhatIsE) navWhatIsE.classList.toggle('nav-active', currentView === 'whatIsE');
  }

  function handleScroll(delta) {
    if (isTransitioning) return;

    if (currentView === 'intro') {
      if (delta > 0) {
        forwardAccum = Math.min(forwardAccum + delta, forwardThreshold + 100);
        var progress = Math.min(forwardAccum / forwardThreshold, 1);
        introText.style.transform = 'translateY(' + (-progress * 50) + 'px)';
        introText.style.opacity = String(1 - progress * 0.6);
        scrollIndicator.style.opacity = String(Math.max(0, 1 - progress * 3));
        if (forwardAccum >= forwardThreshold) {
          transitionToPortfolio();
        }
      } else {
        forwardAccum = Math.max(0, forwardAccum + delta);
        var progress = Math.min(forwardAccum / forwardThreshold, 1);
        introText.style.transform = 'translateY(' + (-progress * 50) + 'px)';
        introText.style.opacity = String(1 - progress * 0.6);
        scrollIndicator.style.opacity = String(Math.max(0, 1 - progress * 3));
      }
    } else if (currentView === 'portfolio') {
      var atTop    = !carousel || carousel.scrollTop <= 1;
      var atBottom = carousel && (carousel.scrollTop + carousel.clientHeight >= carousel.scrollHeight - 10);
      if (delta < 0 && atTop) {
        reverseAccum = Math.min(reverseAccum + Math.abs(delta), reverseThreshold + 100);
        if (reverseAccum >= reverseThreshold) transitionToIntro();
      } else if (delta > 0 && atBottom) {
        forwardAccum = Math.min(forwardAccum + delta, forwardThreshold + 100);
        if (forwardAccum >= forwardThreshold) transitionToWhatIsE();
      } else {
        reverseAccum = 0;
        if (!atBottom) forwardAccum = 0;
      }
    } else if (currentView === 'whatIsE') {
      if (delta < 0) {
        reverseAccum = Math.min(reverseAccum + Math.abs(delta), reverseThreshold + 100);
        if (reverseAccum >= reverseThreshold) transitionToPortfolio();
      } else {
        reverseAccum = 0;
      }
    }
  }

  function transitionToPortfolio() {
    if (isTransitioning || currentView === 'portfolio') return;
    isTransitioning = true;
    var prevView = currentView;

    if (prevView === 'whatIsE') {
      if (_env) _env.stop();
      gsap.set(introPage, { yPercent: -100 });
      introPage.style.pointerEvents = 'none';
      gsap.to(whatIsEPage, {
        yPercent: 100, duration: 0.9, ease: 'power3.inOut',
        onComplete: function() {
          whatIsEPage.style.pointerEvents = 'none';
          isTransitioning = false;
          currentView = 'portfolio';
          forwardAccum = 0; reverseAccum = 0;
          updateNav();
          activatePortfolio();
        }
      });
      return;
    }

    var tl = gsap.timeline({
      onComplete: function() {
        isTransitioning = false;
        currentView = 'portfolio';
        forwardAccum = 0;
        reverseAccum = 0;
        introPage.style.pointerEvents = 'none';
        updateNav();
        activatePortfolio();
      }
    });

    tl.to(introText, { y: -120, opacity: 0, duration: 0.7, ease: 'power3.inOut' })
      .to(scrollIndicator, { opacity: 0, duration: 0.2 }, '<')
      .to(introPage, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, '-=0.3');
  }

  function transitionToIntro() {
    if (isTransitioning || currentView === 'intro') return;
    isTransitioning = true;
    var prevView = currentView;

    if (prevView === 'portfolio') deactivatePortfolio();

    introPage.style.pointerEvents = '';
    gsap.set(introPage, { yPercent: -100 });
    gsap.set(introText, { y: 40, opacity: 0 });
    gsap.set(scrollIndicator, { opacity: 0 });

    var tl = gsap.timeline({
      onComplete: function() {
        isTransitioning = false;
        currentView = 'intro';
        forwardAccum = 0;
        reverseAccum = 0;
        updateNav();
      }
    });

    if (prevView === 'whatIsE' && whatIsEPage) {
      if (_env) _env.stop();
      // intro (z-51) slides down over whatIsE (z-49), then reset whatIsE
      tl.to(introPage, { yPercent: 0, duration: 0.9, ease: 'power3.inOut' }, 0)
        .to(introText, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.35')
        .to(scrollIndicator, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3')
        .call(function() {
          gsap.set(whatIsEPage, { yPercent: 100 });
          whatIsEPage.style.pointerEvents = 'none';
        });
    } else {
      tl.to(introPage, { yPercent: 0, duration: 0.9, ease: 'power3.inOut' })
        .to(introText, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
        .to(scrollIndicator, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    }
  }

  function transitionToWhatIsE() {
    if (isTransitioning || currentView === 'whatIsE') return;
    isTransitioning = true;
    var prevView = currentView;

    if (prevView === 'portfolio') {
      deactivatePortfolio();
      gsap.set(introPage, { yPercent: -100 });
      introPage.style.pointerEvents = 'none';
    }

    gsap.set(whatIsEPage, { yPercent: 100 });
    if (whatIsEPage) whatIsEPage.style.pointerEvents = 'auto';

    var tl = gsap.timeline({
      onComplete: function() {
        isTransitioning = false;
        currentView = 'whatIsE';
        forwardAccum = 0; reverseAccum = 0;
        introPage.style.pointerEvents = 'none';
        updateNav();
        animateEnvDiagram();
      }
    });

    if (prevView === 'intro') {
      tl.to(introText, { y: -120, opacity: 0, duration: 0.5, ease: 'power3.inOut' }, 0)
        .to(scrollIndicator, { opacity: 0, duration: 0.2 }, 0)
        .to(introPage, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, 0.1)
        .to(whatIsEPage, { yPercent: 0, duration: 0.85, ease: 'power3.inOut' }, 0.2);
    } else {
      // from portfolio — slide whatIsE up from below
      tl.to(whatIsEPage, { yPercent: 0, duration: 0.9, ease: 'power3.inOut' }, 0);
    }
  }

  if (navJourney) navJourney.addEventListener('click', function() { transitionToPortfolio(); });
  if (navIntro) navIntro.addEventListener('click', function() { transitionToIntro(); });
  if (navWhatIsE) navWhatIsE.addEventListener('click', function() { transitionToWhatIsE(); });

  window.addEventListener('wheel', function(e) {
    handleScroll(e.deltaY);
  }, { passive: true });

  var touchStartY = 0;
  window.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', function(e) {
    var delta = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;
    handleScroll(delta * 3);
  }, { passive: true });
}

/* ==========================================
   What is E — Environment Design Diagram
   ========================================== */
function buildEnvDesignDiagram() {
  var svg = document.getElementById('envDesignSvg');
  if (!svg) return;

  var NS = 'http://www.w3.org/2000/svg';
  svg.setAttribute('viewBox', '0 0 1000 680');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  function el(tag, attrs, text) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    if (text != null) node.textContent = text;
    return node;
  }

  var cX = 175, cY = 340;

  var primaries = [
    { id: 'set',      label: 'Set design',                   x: 368, y: 165 },
    { id: 'xr',       label: 'XR design',                    x: 428, y: 262 },
    { id: 'interior', label: 'Interior Design',              x: 482, y: 368 },
    { id: 'exp',      label: 'Experiential Branding Design', x: 395, y: 488 },
  ];

  var secondaries = [
    { label: 'technical artist',               x: 568, y: 98,  parent: 'set' },
    { label: '3D artist',                      x: 592, y: 185, parent: 'set' },
    { label: 'technical artist',               x: 638, y: 198, parent: 'xr'  },
    { label: 'product design',                 x: 658, y: 270, parent: 'xr'  },
    { label: 'product design prototyper',      x: 635, y: 345, parent: 'xr'  },
    { label: 'Environmental graphic designer', x: 612, y: 440, parent: 'exp' },
    { label: 'art director',                   x: 638, y: 508, parent: 'exp' },
    { label: 'creative technologist',          x: 612, y: 575, parent: 'exp' },
  ];

  // Lines
  var linesG = document.createElementNS(NS, 'g');
  linesG.setAttribute('id', 'diagram-lines');

  primaries.forEach(function(p) {
    linesG.appendChild(el('line', {
      x1: cX, y1: cY, x2: p.x, y2: p.y,
      stroke: '#1a1a1a', 'stroke-width': '0.75', opacity: '0.28'
    }));
  });

  secondaries.forEach(function(s) {
    var par = primaries.filter(function(p) { return p.id === s.parent; })[0];
    if (!par) return;
    linesG.appendChild(el('line', {
      x1: par.x, y1: par.y, x2: s.x, y2: s.y,
      stroke: '#1a1a1a', 'stroke-width': '0.55', opacity: '0.18'
    }));
  });

  svg.appendChild(linesG);

  // Circles
  var circlesG = document.createElementNS(NS, 'g');
  circlesG.setAttribute('id', 'env-circles');

  circlesG.appendChild(el('circle', { cx: cX, cy: cY, r: '7', fill: '#1a1a1a' }));
  primaries.forEach(function(p) {
    circlesG.appendChild(el('circle', { cx: p.x, cy: p.y, r: '4.5', fill: '#1a1a1a' }));
  });
  secondaries.forEach(function(s) {
    circlesG.appendChild(el('circle', { cx: s.x, cy: s.y, r: '3', fill: '#666' }));
  });

  svg.appendChild(circlesG);

  // Labels
  var labelsG = document.createElementNS(NS, 'g');
  labelsG.setAttribute('id', 'env-labels');

  var ff = '"Neue Montreal", Inter, system-ui, sans-serif';

  labelsG.appendChild(el('text', {
    x: cX + 13, y: cY + 4,
    'font-size': '11', 'font-family': ff,
    fill: '#1a1a1a', 'font-weight': '500', 'letter-spacing': '0.02em'
  }, 'Environment Design'));

  primaries.forEach(function(p) {
    labelsG.appendChild(el('text', {
      x: p.x + 9, y: p.y + 4,
      'font-size': '10', 'font-family': ff,
      fill: '#1a1a1a', 'font-weight': '400'
    }, p.label));
  });

  secondaries.forEach(function(s) {
    labelsG.appendChild(el('text', {
      x: s.x + 7, y: s.y + 3.5,
      'font-size': '8.5', 'font-family': ff,
      fill: '#5a5a5a', 'font-weight': '300'
    }, s.label));
  });

  svg.appendChild(labelsG);
}

function animateEnvDiagram() {
  var lines = document.querySelectorAll('#diagram-lines line');
  var circles = document.querySelectorAll('#env-circles circle');
  var labels = document.querySelectorAll('#env-labels text');

  // Reset to hidden
  gsap.set(lines, { opacity: 0 });
  gsap.set(circles, { opacity: 0 });
  gsap.set(labels, { opacity: 0 });

  // Animate lines
  lines.forEach(function(line, i) {
    var target = parseFloat(line.getAttribute('opacity') || 0.25);
    gsap.to(line, { opacity: target, duration: 0.7, delay: 0.05 + i * 0.065, ease: 'power2.out' });
  });

  // Animate circles — grow from r=0
  circles.forEach(function(circle, i) {
    var finalR = circle.getAttribute('r');
    gsap.fromTo(circle,
      { attr: { r: 0 }, opacity: 0 },
      { attr: { r: finalR }, opacity: 1, duration: 0.45, delay: 0.2 + i * 0.07, ease: 'back.out(1.7)' }
    );
  });

  // Animate labels
  labels.forEach(function(label, i) {
    gsap.fromTo(label,
      { opacity: 0, x: -4 },
      { opacity: 1, x: 0, duration: 0.5, delay: 0.4 + i * 0.045, ease: 'power2.out' }
    );
  });
}

/* ==========================================
   Media Overlay (click-to-expand)
   ========================================== */
function initMediaOverlay() {
  const overlay = document.getElementById('mediaOverlay');
  const content = document.getElementById('mediaOverlayContent');
  if (!overlay || !content) return;

  document.querySelectorAll('.center-carousel-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      content.innerHTML = '';

      if (item.tagName === 'VIDEO') {
        const video = document.createElement('video');
        video.src = item.src;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        content.appendChild(video);
      } else {
        const img = document.createElement('img');
        img.src = item.src;
        img.alt = item.alt || '';
        content.appendChild(img);
      }

      overlay.classList.add('active');
    });
  });

  overlay.addEventListener('click', () => {
    overlay.classList.remove('active');
    const video = content.querySelector('video');
    if (video) video.pause();
    setTimeout(() => { content.innerHTML = ''; }, 300);
  });
}

