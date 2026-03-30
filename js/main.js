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

  // Re-enable carousel item interactions
  document.querySelectorAll('.center-carousel-item').forEach(function(item) {
    item.style.pointerEvents = 'auto';
  });

  setTimeout(calculateTimelineSpans, 600);
}

function deactivatePortfolio() {
  const verticalLayout = document.getElementById('vertical-layout');
  if (verticalLayout) verticalLayout.classList.remove('active');

  document.querySelectorAll('.timeline-entry, .timeline-entry-mobile').forEach((item) => {
    item.classList.remove('visible');
  });

  // Explicitly disable carousel item interactions to prevent click-through
  document.querySelectorAll('.center-carousel-item').forEach(function(item) {
    item.style.pointerEvents = 'none';
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
        if (forwardAccum >= forwardThreshold) transitionToPortfolio();
      } else {
        forwardAccum = Math.max(0, forwardAccum + delta);
        var progress = Math.min(forwardAccum / forwardThreshold, 1);
        introText.style.transform = 'translateY(' + (-progress * 50) + 'px)';
        introText.style.opacity = String(1 - progress * 0.6);
        scrollIndicator.style.opacity = String(Math.max(0, 1 - progress * 3));
      }
    } else if (currentView === 'portfolio') {
      var atTop    = !carousel || carousel.scrollTop <= 1;
      var atBottom = carousel  && (carousel.scrollTop + carousel.clientHeight >= carousel.scrollHeight - 10);
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
      gsap.to(whatIsEPage, { yPercent: 100, duration: 0.9, ease: 'power3.inOut',
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
      // Intro slides down over whatIsE (z-51 > z-49), then reset whatIsE
      tl.to(introPage, { yPercent: 0, duration: 0.9, ease: 'power3.inOut' }, 0)
        .to(introText, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
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
   What is E — SVG Node Diagram
   ========================================== */
var _env = null;

function buildEnvDesignDiagram() {
  var page = document.getElementById('whatIsEPage');
  if (!page) return;

  var W = window.innerWidth;
  var H = window.innerHeight;
  var FH = 10;
  var FW = FH * (W / H);

  function px(x) { return (x / FW + 0.5) * W; }
  function py(y) { return (-y / FH + 0.5) * H; }
  function pr(r) { return r * W / FW; }

  var nodes = [
    { id: 'env',      label: 'Environment Design',             x: -4.5, y:  0.10, r: 0.16,  type: 'center'    },
    { id: 'set',      label: 'Set design',                     x: -1.8, y:  2.50, r: 0.09,  type: 'primary'   },
    { id: 'xr',       label: 'XR design',                      x: -0.9, y:  1.15, r: 0.09,  type: 'primary'   },
    { id: 'interior', label: 'Interior Design',                x:  0.0, y: -0.35, r: 0.09,  type: 'primary'   },
    { id: 'exp',      label: 'Experiential Branding Design',   x: -1.4, y: -2.10, r: 0.09,  type: 'primary'   },
    { id: 'set_ta',   label: 'technical artist',               x:  1.0, y:  3.50, r: 0.055, type: 'secondary' },
    { id: 'set_3d',   label: '3D artist',                      x:  1.3, y:  2.20, r: 0.055, type: 'secondary' },
    { id: 'xr_ta',    label: 'technical artist',               x:  2.0, y:  2.00, r: 0.055, type: 'secondary' },
    { id: 'xr_pd',    label: 'product design',                 x:  2.3, y:  1.00, r: 0.055, type: 'secondary' },
    { id: 'xr_pdp',   label: 'product design prototyper',      x:  1.9, y: -0.10, r: 0.055, type: 'secondary' },
    { id: 'exp_eg',   label: 'Environmental graphic designer', x:  1.6, y: -1.45, r: 0.055, type: 'secondary' },
    { id: 'exp_ad',   label: 'art director',                   x:  2.0, y: -2.40, r: 0.055, type: 'secondary' },
    { id: 'exp_ct',   label: 'creative technologist',          x:  1.6, y: -3.40, r: 0.055, type: 'secondary' },
  ];

  var edges = [
    { from: 'env', to: 'set'      },
    { from: 'env', to: 'xr'       },
    { from: 'env', to: 'interior' },
    { from: 'env', to: 'exp'      },
    { from: 'set', to: 'set_ta'   },
    { from: 'set', to: 'set_3d'   },
    { from: 'xr',  to: 'xr_ta'   },
    { from: 'xr',  to: 'xr_pd'   },
    { from: 'xr',  to: 'xr_pdp'  },
    { from: 'exp', to: 'exp_eg'   },
    { from: 'exp', to: 'exp_ad'   },
    { from: 'exp', to: 'exp_ct'   },
  ];

  var nodeMap = {};
  nodes.forEach(function(n) {
    nodeMap[n.id] = n;
    n.connected = [];
  });
  edges.forEach(function(e) {
    nodeMap[e.from].connected.push(e.to);
    nodeMap[e.to].connected.push(e.from);
    e.baseOpacity = (e.from === 'env') ? 0.22 : 0.14;
  });

  var NS = 'http://www.w3.org/2000/svg';

  // SVG element — pointer-events:none so the svg background doesn't block page scrolling
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  page.appendChild(svg);

  // Edge lines
  edges.forEach(function(e) {
    var fn = nodeMap[e.from];
    var tn = nodeMap[e.to];
    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', px(fn.x).toFixed(1));
    line.setAttribute('y1', py(fn.y).toFixed(1));
    line.setAttribute('x2', px(tn.x).toFixed(1));
    line.setAttribute('y2', py(tn.y).toFixed(1));
    line.setAttribute('stroke', '#1a1a1a');
    line.setAttribute('stroke-width', '0.75');
    line.style.opacity = '0';
    svg.appendChild(line);
    e.el = line;
  });

  // Node circles
  nodes.forEach(function(n) {
    var circle = document.createElementNS(NS, 'circle');
    circle.setAttribute('cx', px(n.x).toFixed(1));
    circle.setAttribute('cy', py(n.y).toFixed(1));
    circle.setAttribute('r',  pr(n.r).toFixed(1));
    circle.setAttribute('fill', n.type === 'secondary' ? '#999999' : '#1a1a1a');
    circle.style.opacity = '0';
    svg.appendChild(circle);
    n.circleEl = circle;
  });

  // HTML label overlay
  var labelCont = document.createElement('div');
  labelCont.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
  page.appendChild(labelCont);

  nodes.forEach(function(n) {
    var div = document.createElement('div');
    div.className = 'env-label ' + n.type;
    div.textContent = n.label;
    div.style.left = (px(n.x) + pr(n.r) + 7) + 'px';
    div.style.top  = py(n.y) + 'px';
    div.style.opacity = '0';
    labelCont.appendChild(div);
    n.labelEl = div;
  });

  // Transparent hit circles for hover (children of svg with pointer-events:all
  // still receive events even when parent svg has pointer-events:none)
  nodes.forEach(function(n) {
    var hit = document.createElementNS(NS, 'circle');
    hit.setAttribute('cx', px(n.x).toFixed(1));
    hit.setAttribute('cy', py(n.y).toFixed(1));
    hit.setAttribute('r',  Math.max(pr(n.r) * 3.5, 16).toFixed(1));
    hit.setAttribute('fill', 'transparent');
    hit.style.pointerEvents = 'all';
    svg.appendChild(hit);
    hit.addEventListener('mouseenter', function() { applyHover(n.id); });
    hit.addEventListener('mouseleave', function() { applyHover(null);  });
  });

  function applyHover(id) {
    if (id) {
      var conn = {};
      conn[id] = true;
      nodeMap[id].connected.forEach(function(cid) { conn[cid] = true; });
      nodes.forEach(function(n) {
        gsap.to(n.circleEl, { opacity: conn[n.id] ? 1 : 0.08, duration: 0.2, overwrite: 'auto' });
        gsap.to(n.labelEl,  { opacity: conn[n.id] ? 1 : 0.07, duration: 0.2, overwrite: 'auto' });
        n.labelEl.style.fontWeight = (n.id === id) ? '500' : '';
      });
      edges.forEach(function(e) {
        var active = conn[e.from] && conn[e.to];
        gsap.to(e.el, { opacity: active ? e.baseOpacity * 3.5 : 0.02, duration: 0.2, overwrite: 'auto' });
      });
    } else {
      nodes.forEach(function(n) {
        gsap.to(n.circleEl, { opacity: 1, duration: 0.25, overwrite: 'auto' });
        gsap.to(n.labelEl,  { opacity: 1, duration: 0.25, overwrite: 'auto' });
        n.labelEl.style.fontWeight = '';
      });
      edges.forEach(function(e) {
        gsap.to(e.el, { opacity: e.baseOpacity, duration: 0.25, overwrite: 'auto' });
      });
    }
  }

  function resetAll() {
    nodes.forEach(function(n) {
      gsap.killTweensOf(n.circleEl);
      gsap.killTweensOf(n.labelEl);
      gsap.set(n.circleEl, { opacity: 0 });
      gsap.set(n.labelEl,  { opacity: 0 });
      n.labelEl.style.fontWeight = '';
    });
    edges.forEach(function(e) {
      gsap.killTweensOf(e.el);
      gsap.set(e.el, { opacity: 0 });
    });
  }

  function playEntrance() {
    var tl = gsap.timeline();
    edges.forEach(function(e, i) {
      tl.fromTo(e.el,
        { opacity: 0 },
        { opacity: e.baseOpacity, duration: 0.5, ease: 'power2.out' },
        i * 0.025
      );
    });
    nodes.forEach(function(n, i) {
      tl.fromTo(n.circleEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.08 + i * 0.04
      );
      tl.fromTo(n.labelEl,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.2 + i * 0.06
      );
    });
  }

  _env = {
    start: function() { resetAll(); playEntrance(); },
    stop:  function() { resetAll(); }
  };
}

function animateEnvDiagram() {
  if (_env) _env.start();
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

