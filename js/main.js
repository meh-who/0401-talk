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
  var introText = document.getElementById('introText');
  var scrollIndicator = document.getElementById('scrollIndicator');
  var carousel = document.getElementById('center-carousel');
  var navIntro = document.getElementById('navIntro');
  var navJourney = document.getElementById('navJourney');
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
      var atTop = !carousel || carousel.scrollTop <= 1;
      if (delta < 0 && atTop) {
        reverseAccum = Math.min(reverseAccum + Math.abs(delta), reverseThreshold + 100);
        if (reverseAccum >= reverseThreshold) {
          transitionToIntro();
        }
      } else if (delta > 0) {
        reverseAccum = 0;
      }
    }
  }

  function transitionToPortfolio() {
    if (isTransitioning || currentView === 'portfolio') return;
    isTransitioning = true;

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
    deactivatePortfolio();

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

    tl.to(introPage, { yPercent: 0, duration: 0.9, ease: 'power3.inOut' })
      .to(introText, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
      .to(scrollIndicator, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
  }

  if (navJourney) {
    navJourney.addEventListener('click', function() { transitionToPortfolio(); });
  }
  if (navIntro) {
    navIntro.addEventListener('click', function() { transitionToIntro(); });
  }

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

