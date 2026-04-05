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
  initWhyEDrag();
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
  var whyEPage = document.getElementById('whyEPage');
  var whatIsEPage = document.getElementById('whatIsEPage');
  var mindsetsPage = document.getElementById('mindsetsPage');
  var introText = document.getElementById('introText');
  var scrollIndicator = document.getElementById('scrollIndicator');
  var whyETitle = document.getElementById('whyETitle');
  var whyEImages = document.getElementById('whyEImages');
  var whyEScroll = document.getElementById('whyEScroll');
  var carousel = document.getElementById('center-carousel');
  var navIntro = document.getElementById('navIntro');
  var navWhyE = document.getElementById('navWhyE');
  var navJourney = document.getElementById('navJourney');
  var navWhatIsE = document.getElementById('navWhatIsE');
  var navMindsets = document.getElementById('navMindsets');
  if (!introPage) return;

  var forwardAccum = 0;
  var reverseAccum = 0;
  var forwardAccumE = 0;
  var reverseAccumE = 0;
  var forwardThreshold = 250;
  var reverseThreshold = 200;
  var isTransitioning = false;
  var currentView = 'intro';

  function resetAccums() {
    forwardAccum = 0; reverseAccum = 0;
    forwardAccumE = 0; reverseAccumE = 0;
  }

  setTimeout(function() {
    gsap.fromTo(introText,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }
    );
    gsap.to(scrollIndicator, { opacity: 1, duration: 0.8, delay: 0.4, ease: 'power2.out' });
  }, 2200);

  function updateNav() {
    if (navIntro) navIntro.classList.toggle('nav-active', currentView === 'intro');
    if (navWhyE) navWhyE.classList.toggle('nav-active', currentView === 'whyE');
    if (navJourney) navJourney.classList.toggle('nav-active', currentView === 'portfolio');
    if (navWhatIsE) navWhatIsE.classList.toggle('nav-active', currentView === 'whatIsE');
    if (navMindsets) navMindsets.classList.toggle('nav-active', currentView === 'mindsets');
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
          transitionToWhyE();
        }
      } else {
        forwardAccum = Math.max(0, forwardAccum + delta);
        var progress = Math.min(forwardAccum / forwardThreshold, 1);
        introText.style.transform = 'translateY(' + (-progress * 50) + 'px)';
        introText.style.opacity = String(1 - progress * 0.6);
        scrollIndicator.style.opacity = String(Math.max(0, 1 - progress * 3));
      }
    } else if (currentView === 'whyE') {
      if (delta > 0) {
        reverseAccum = 0;
        forwardAccum = Math.min(forwardAccum + delta, forwardThreshold + 100);
        if (forwardAccum >= forwardThreshold) {
          transitionToPortfolio();
        }
      } else if (delta < 0) {
        forwardAccum = 0;
        reverseAccum = Math.min(reverseAccum + Math.abs(delta), reverseThreshold + 100);
        if (reverseAccum >= reverseThreshold) {
          transitionToIntro();
        }
      }
    } else if (currentView === 'portfolio') {
      var atTop = !carousel || carousel.scrollTop <= 1;
      var atBottom = !carousel || (carousel.scrollTop + carousel.clientHeight >= carousel.scrollHeight - 2);
      if (delta < 0 && atTop) {
        forwardAccumE = 0;
        reverseAccum = Math.min(reverseAccum + Math.abs(delta), reverseThreshold + 100);
        if (reverseAccum >= reverseThreshold) {
          transitionToWhyE();
        }
      } else if (delta > 0 && atBottom) {
        reverseAccum = 0;
        forwardAccumE = Math.min(forwardAccumE + delta, forwardThreshold + 100);
        if (forwardAccumE >= forwardThreshold) {
          transitionToWhatIsE();
        }
      } else {
        reverseAccum = 0;
        forwardAccumE = 0;
      }
    } else if (currentView === 'whatIsE') {
      if (delta < 0) {
        forwardAccumE = 0;
        reverseAccumE = Math.min(reverseAccumE + Math.abs(delta), reverseThreshold + 100);
        if (reverseAccumE >= reverseThreshold) {
          transitionToPortfolio();
        }
      } else if (delta > 0) {
        reverseAccumE = 0;
        forwardAccumE = Math.min(forwardAccumE + delta, forwardThreshold + 100);
        if (forwardAccumE >= forwardThreshold) {
          transitionToMindsets();
        }
      }
    } else if (currentView === 'mindsets') {
      if (delta < 0) {
        reverseAccumE = Math.min(reverseAccumE + Math.abs(delta), reverseThreshold + 100);
        if (reverseAccumE >= reverseThreshold) {
          transitionToWhatIsE();
        }
      } else {
        reverseAccumE = 0;
      }
    }
  }

  function hideMindsetsPage() {
    if (mindsetsPage) { gsap.set(mindsetsPage, { opacity: 0 }); mindsetsPage.style.pointerEvents = 'none'; }
  }

  function transitionToWhyE() {
    if (isTransitioning || currentView === 'whyE') return;
    isTransitioning = true;
    var prevView = currentView;

    hideMindsetsPage();
    if (prevView === 'portfolio') deactivatePortfolio();
    if (prevView === 'whatIsE' && whatIsEPage) {
      gsap.to(whatIsEPage, { opacity: 0, duration: 0.4, ease: 'power2.inOut',
        onComplete: function() { whatIsEPage.style.pointerEvents = 'none'; }
      });
    }

    whyEPage.style.pointerEvents = 'auto';

    function playWhyEVideo() {
      var v = whyEImages ? whyEImages.querySelector('video') : null;
      if (v) v.play().catch(function() {});
    }
    function pauseWhyEVideo() {
      var v = whyEImages ? whyEImages.querySelector('video') : null;
      if (v) v.pause();
    }

    if (prevView === 'intro') {
      gsap.set(whyEPage, { yPercent: 0 });
      gsap.set(whyETitle, { y: 20, opacity: 0 });
      if (whyEImages) gsap.set(whyEImages, { opacity: 0 });
      gsap.set(whyEScroll, { opacity: 0 });

      var tl = gsap.timeline({
        onComplete: function() {
          isTransitioning = false;
          currentView = 'whyE';
          resetAccums();
          introPage.style.pointerEvents = 'none';
          updateNav();
          playWhyEVideo();
        }
      });

      tl.to(introText, { y: -120, opacity: 0, duration: 0.7, ease: 'power3.inOut' })
        .to(scrollIndicator, { opacity: 0, duration: 0.2 }, '<')
        .to(introPage, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, '-=0.3')
        .to(whyETitle, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
        .to(whyEImages, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
        .to(whyEScroll, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    } else {
      gsap.set(introPage, { yPercent: -100 });
      introPage.style.pointerEvents = 'none';
      gsap.set(whyEPage, { yPercent: -100 });
      gsap.set(whyETitle, { y: 40, opacity: 0 });
      if (whyEImages) gsap.set(whyEImages, { opacity: 0 });
      gsap.set(whyEScroll, { opacity: 0 });

      var tl = gsap.timeline({
        onComplete: function() {
          isTransitioning = false;
          currentView = 'whyE';
          resetAccums();
          updateNav();
          playWhyEVideo();
        }
      });

      tl.to(whyEPage, { yPercent: 0, duration: 0.9, ease: 'power3.inOut' })
        .to(whyETitle, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
        .to(whyEImages, { opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
        .to(whyEScroll, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
    }
  }

  function transitionToPortfolio() {
    if (isTransitioning || currentView === 'portfolio') return;
    isTransitioning = true;
    var prevView = currentView;

    hideMindsetsPage();

    if (prevView === 'whatIsE') {
      if (whatIsEPage) {
        gsap.to(whatIsEPage, {
          opacity: 0, duration: 0.5, ease: 'power2.inOut',
          onComplete: function() { whatIsEPage.style.pointerEvents = 'none'; }
        });
      }
      gsap.set(introPage, { yPercent: -100 });
      gsap.set(whyEPage, { yPercent: -100 });
      introPage.style.pointerEvents = 'none';
      whyEPage.style.pointerEvents = 'none';
      setTimeout(function() {
        isTransitioning = false;
        currentView = 'portfolio';
        resetAccums();
        updateNav();
        activatePortfolio();
      }, 520);
      return;
    }

    if (prevView === 'whyE') {
      var tl = gsap.timeline({
        onComplete: function() {
          isTransitioning = false;
          currentView = 'portfolio';
          resetAccums();
          whyEPage.style.pointerEvents = 'none';
          updateNav();
          activatePortfolio();
        }
      });

      tl.to(whyETitle, { y: -120, opacity: 0, duration: 0.5, ease: 'power3.inOut' })
        .to(whyEImages, { opacity: 0, duration: 0.3 }, '<')
        .to(whyEScroll, { opacity: 0, duration: 0.2 }, '<')
        .to(whyEPage, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, '-=0.3');
      return;
    }

    gsap.set(whyEPage, { yPercent: -100 });
    whyEPage.style.pointerEvents = 'none';

    var tl = gsap.timeline({
      onComplete: function() {
        isTransitioning = false;
        currentView = 'portfolio';
        resetAccums();
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

    hideMindsetsPage();
    if (prevView === 'portfolio') deactivatePortfolio();

    introPage.style.pointerEvents = '';
    gsap.set(introPage, { yPercent: -100 });
    gsap.set(introText, { y: 40, opacity: 0 });
    gsap.set(scrollIndicator, { opacity: 0 });
    gsap.set(whyEPage, { yPercent: 0 });

    var tl = gsap.timeline({
      onComplete: function() {
        isTransitioning = false;
        currentView = 'intro';
        resetAccums();
        updateNav();
      }
    });

    if (prevView === 'whatIsE' && whatIsEPage) {
      tl.to(whatIsEPage, { opacity: 0, duration: 0.4, ease: 'power2.inOut',
        onComplete: function() { whatIsEPage.style.pointerEvents = 'none'; }
      }, 0)
        .to(introPage, { yPercent: 0, duration: 0.85, ease: 'power3.inOut' }, 0.15)
        .to(introText, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' }, '-=0.3')
        .to(scrollIndicator, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.3');
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
    }

    gsap.set(introPage, { yPercent: -100 });
    gsap.set(whyEPage, { yPercent: -100 });
    introPage.style.pointerEvents = 'none';
    whyEPage.style.pointerEvents = 'none';

    if (whatIsEPage) whatIsEPage.style.pointerEvents = 'auto';
    resetEnvDiagram();

    var tl = gsap.timeline({
      onComplete: function() {
        isTransitioning = false;
        currentView = 'whatIsE';
        resetAccums();
        updateNav();
        animateEnvDiagram();
      }
    });

    if (prevView === 'intro') {
      tl.to(introText, { y: -120, opacity: 0, duration: 0.5, ease: 'power3.inOut' }, 0)
        .to(scrollIndicator, { opacity: 0, duration: 0.2 }, 0)
        .to(introPage, { yPercent: -100, duration: 0.7, ease: 'power3.inOut' }, 0.1)
        .to(whatIsEPage, { opacity: 1, duration: 0.65, ease: 'power2.inOut' }, 0.25);
    } else if (prevView === 'mindsets') {
      tl.to(mindsetsPage, { opacity: 0, duration: 0.4, ease: 'power2.inOut',
        onComplete: function() { mindsetsPage.style.pointerEvents = 'none'; }
      }, 0)
      .to(whatIsEPage, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 0.1);
    } else {
      tl.to(whatIsEPage, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, 0);
    }
  }

  function transitionToMindsets() {
    if (isTransitioning || currentView === 'mindsets') return;
    isTransitioning = true;
    var prevView = currentView;

    if (prevView === 'portfolio') deactivatePortfolio();

    gsap.set(introPage, { yPercent: -100 });
    gsap.set(whyEPage, { yPercent: -100 });
    introPage.style.pointerEvents = 'none';
    whyEPage.style.pointerEvents = 'none';

    if (mindsetsPage) mindsetsPage.style.pointerEvents = 'auto';
    resetMindsets();

    var tl = gsap.timeline({
      onComplete: function() {
        isTransitioning = false;
        currentView = 'mindsets';
        resetAccums();
        updateNav();
        animateMindsets();
      }
    });

    if (prevView === 'whatIsE') {
      tl.to(whatIsEPage, { opacity: 0, duration: 0.5, ease: 'power2.inOut',
        onComplete: function() { whatIsEPage.style.pointerEvents = 'none'; }
      }, 0)
      .to(mindsetsPage, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 0.1);
    } else {
      if (whatIsEPage) { gsap.set(whatIsEPage, { opacity: 0 }); whatIsEPage.style.pointerEvents = 'none'; }
      tl.to(mindsetsPage, { opacity: 1, duration: 0.6, ease: 'power2.inOut' }, 0);
    }
  }

  if (navIntro) navIntro.addEventListener('click', function() { transitionToIntro(); });
  if (navWhyE) navWhyE.addEventListener('click', function() { transitionToWhyE(); });
  if (navJourney) navJourney.addEventListener('click', function() { transitionToPortfolio(); });
  if (navWhatIsE) navWhatIsE.addEventListener('click', function() { transitionToWhatIsE(); });
  if (navMindsets) navMindsets.addEventListener('click', function() { transitionToMindsets(); });

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
   Diverging Career Paths — Environment Design Diagram
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
    { id: 'set', label: 'Set design',                   x: 368, y: 175, type: 'creative' },
    { id: 'xr',  label: 'XR design',                    x: 428, y: 340, type: 'technical' },
    { id: 'exp', label: 'Experiential Branding Design', x: 395, y: 505, type: 'creative' },
  ];

  var secondaries = [
    { id: 'ta-set',   label: 'technical artist (set)',           x: 568, y: 105, parent: 'set', type: 'technical' },
    { id: '3d',       label: '3D artist',                       x: 592, y: 225, parent: 'set', type: 'creative' },
    { id: 'ta-xr',    label: 'technical artist (XR)',            x: 638, y: 270, parent: 'xr',  type: 'technical' },
    { id: 'pd',       label: 'product design',                  x: 658, y: 340, parent: 'xr',  type: 'creative' },
    { id: 'pd-proto', label: 'product design prototyper',       x: 635, y: 410, parent: 'xr',  type: 'technical' },
    { id: 'env-gd',   label: 'Environmental graphic designer',  x: 612, y: 450, parent: 'exp', type: 'creative' },
    { id: 'art-dir',  label: 'art director',                    x: 638, y: 525, parent: 'exp', type: 'creative' },
    { id: 'ct',       label: 'creative technologist',           x: 612, y: 590, parent: 'exp', type: 'technical' },
  ];

  // Lines
  var linesG = document.createElementNS(NS, 'g');
  linesG.setAttribute('id', 'diagram-lines');

  linesG.appendChild(el('line', {
    x1: 0, y1: cY, x2: cX, y2: cY,
    stroke: '#1a1a1a', 'stroke-width': '0.75', opacity: '0.28'
  }));

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

  // Shapes — circles for creative roles, diamonds for technical roles
  var shapesG = document.createElementNS(NS, 'g');
  shapesG.setAttribute('id', 'env-shapes');
  var shapeRefs = {};

  function makeDiamondPoints(cx, cy, r) {
    return cx + ',' + (cy - r) + ' ' + (cx + r) + ',' + cy + ' ' + cx + ',' + (cy + r) + ' ' + (cx - r) + ',' + cy;
  }

  shapesG.appendChild(el('circle', { cx: cX, cy: cY, r: '7', fill: '#1a1a1a' }));

  primaries.forEach(function(p) {
    var shape;
    if (p.type === 'technical') {
      shape = el('polygon', {
        points: makeDiamondPoints(p.x, p.y, 5.5),
        fill: '#1a1a1a',
        'data-cx': p.x, 'data-cy': p.y
      });
    } else {
      shape = el('circle', { cx: p.x, cy: p.y, r: '4.5', fill: '#1a1a1a' });
    }
    shapeRefs[p.id] = shape;
    shapesG.appendChild(shape);
  });

  secondaries.forEach(function(s) {
    var shape;
    if (s.type === 'technical') {
      shape = el('polygon', {
        points: makeDiamondPoints(s.x, s.y, 3.5),
        fill: '#666',
        'data-cx': s.x, 'data-cy': s.y
      });
    } else {
      shape = el('circle', { cx: s.x, cy: s.y, r: '3', fill: '#666' });
    }
    shapeRefs[s.id] = shape;
    shapesG.appendChild(shape);
  });

  svg.appendChild(shapesG);

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

  // Hover hit targets
  var hitG = document.createElementNS(NS, 'g');
  hitG.setAttribute('id', 'env-hit-targets');
  var hoverTimer = null;

  function scheduleHide() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(hideRoleInfo, 250);
  }

  function cancelHide() {
    clearTimeout(hoverTimer);
  }

  primaries.forEach(function(p) {
    var hit = el('circle', { cx: p.x, cy: p.y, r: '20', fill: 'transparent', style: 'cursor: pointer;' });
    hit.addEventListener('mouseenter', function() {
      cancelHide();
      showRoleInfo(p.id);
      if (p.type === 'technical') {
        gsap.to(shapeRefs[p.id], { scale: 1.5, svgOrigin: p.x + ' ' + p.y, duration: 0.2, ease: 'power2.out' });
      } else {
        gsap.to(shapeRefs[p.id], { attr: { r: 7 }, duration: 0.2, ease: 'power2.out' });
      }
      var cb = document.getElementById('cursorBox');
      var cf = document.getElementById('cursorFill');
      if (cb) cb.style.transform = 'translate(-50%, -50%) scale(0.5)';
      if (cf) cf.style.clipPath = 'inset(0%)';
    });
    hit.addEventListener('mouseleave', function() {
      scheduleHide();
      if (p.type === 'technical') {
        gsap.to(shapeRefs[p.id], { scale: 1, svgOrigin: p.x + ' ' + p.y, duration: 0.2, ease: 'power2.out' });
      } else {
        gsap.to(shapeRefs[p.id], { attr: { r: 4.5 }, duration: 0.2, ease: 'power2.out' });
      }
      var cb = document.getElementById('cursorBox');
      var cf = document.getElementById('cursorFill');
      if (cb) cb.style.transform = 'translate(-50%, -50%) scale(1)';
      if (cf) cf.style.clipPath = 'inset(100%)';
    });
    hitG.appendChild(hit);
  });

  secondaries.forEach(function(s) {
    var hit = el('circle', { cx: s.x, cy: s.y, r: '16', fill: 'transparent', style: 'cursor: pointer;' });
    hit.addEventListener('mouseenter', function() {
      cancelHide();
      showRoleInfo(s.id);
      if (s.type === 'technical') {
        gsap.to(shapeRefs[s.id], { scale: 1.5, svgOrigin: s.x + ' ' + s.y, duration: 0.2, ease: 'power2.out' });
      } else {
        gsap.to(shapeRefs[s.id], { attr: { r: 5 }, duration: 0.2, ease: 'power2.out' });
      }
      var cb = document.getElementById('cursorBox');
      var cf = document.getElementById('cursorFill');
      if (cb) cb.style.transform = 'translate(-50%, -50%) scale(0.5)';
      if (cf) cf.style.clipPath = 'inset(0%)';
    });
    hit.addEventListener('mouseleave', function() {
      scheduleHide();
      if (s.type === 'technical') {
        gsap.to(shapeRefs[s.id], { scale: 1, svgOrigin: s.x + ' ' + s.y, duration: 0.2, ease: 'power2.out' });
      } else {
        gsap.to(shapeRefs[s.id], { attr: { r: 3 }, duration: 0.2, ease: 'power2.out' });
      }
      var cb = document.getElementById('cursorBox');
      var cf = document.getElementById('cursorFill');
      if (cb) cb.style.transform = 'translate(-50%, -50%) scale(1)';
      if (cf) cf.style.clipPath = 'inset(100%)';
    });
    hitG.appendChild(hit);
  });

  svg.appendChild(hitG);

  var legendG = document.createElementNS(NS, 'g');
  legendG.setAttribute('id', 'env-legend');
  legendG.appendChild(el('circle', { cx: '40', cy: '618', r: '3.5', fill: '#1a1a1a' }));
  legendG.appendChild(el('text', { x: '52', y: '622', 'font-size': '9', 'font-family': ff, fill: '#999', 'font-weight': '400' }, 'Creative'));
  legendG.appendChild(el('polygon', { points: makeDiamondPoints(40, 642, 3.5), fill: '#1a1a1a' }));
  legendG.appendChild(el('text', { x: '52', y: '646', 'font-size': '9', 'font-family': ff, fill: '#999', 'font-weight': '400' }, 'Technical'));
  svg.appendChild(legendG);

  resetEnvDiagram();

  var closeBtn = document.getElementById('envInfoClose');
  var cardEl = document.getElementById('envInfoCard');
  if (closeBtn) closeBtn.addEventListener('click', function(e) { e.stopPropagation(); cancelHide(); hideRoleInfo(); });
  if (cardEl) {
    cardEl.addEventListener('mouseenter', cancelHide);
    cardEl.addEventListener('mouseleave', scheduleHide);
  }
}

/* ==========================================
   Role Info Data & Overlay
   ========================================== */
var roleData = {
  set: {
    title: 'Set Design',
    desc: 'Crafts physical and digital environments for film, television, theater, and live events. Combines architecture, art direction, and storytelling to build immersive worlds that serve the narrative.',
    tools: 'SketchUp, Vectorworks, Cinema 4D, AutoCAD, Adobe Photoshop',
    img: 'assets/why-e.jpg'
  },
  xr: {
    title: 'XR Design',
    desc: 'Designs immersive spatial experiences across virtual, augmented, and mixed reality platforms. Focuses on 3D interaction patterns, spatial UI, and embodied user experiences at the frontier of computing.',
    tools: 'Unity, Unreal Engine, Figma, Blender, Adobe Aero, ShapesXR',
    img: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&h=300&fit=crop&auto=format'
  },
  exp: {
    title: 'Experiential Branding Design',
    desc: 'Creates immersive brand experiences through spatial installations, pop-ups, and multi-sensory environments that forge emotional connections between audiences and brand narratives.',
    tools: 'Cinema 4D, After Effects, TouchDesigner, SketchUp, Arduino',
    img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=300&fit=crop&auto=format'
  },
  'ta-set': {
    title: 'Technical Artist — Set Design',
    desc: 'Bridges the gap between art and engineering in production pipelines. Optimizes assets, builds shaders, and creates tools that empower creative teams to work more efficiently.',
    tools: 'Maya, Houdini, Python, HLSL/GLSL, Unity, Unreal Engine',
    img: 'assets/tech-artist-set.jpeg'
  },
  '3d': {
    title: '3D Artist',
    desc: 'Creates detailed 3D models, textures, lighting setups, and rendered environments. Brings concepts to life through digital sculpting, look development, and visualization.',
    tools: 'Blender, Maya, ZBrush, Substance Painter, Cinema 4D',
    img: 'assets/3d-artist-set.png'
  },
  'ta-xr': {
    title: 'Technical Artist — XR Design',
    desc: 'Develops real-time rendering solutions, optimizes XR assets for performance, and builds interaction systems for spatial computing platforms.',
    tools: 'Unity, Unreal Engine, Python, Shader Graph, Blender',
    img: 'assets/tech-artist-xr-design.jpg'
  },
  pd: {
    title: 'Product Designer',
    desc: 'Designs user-centered digital products and interfaces for spatial platforms. Defines interaction patterns, user flows, and visual systems for XR and emerging tech experiences.',
    tools: 'Figma, Protopie, Unity, Adobe XD, Framer',
    img: 'assets/xr-design-product-design.jpg'
  },
  'pd-proto': {
    title: 'Product Design Prototyper',
    desc: 'Builds high-fidelity interactive prototypes that simulate real product experiences. Bridges the gap between design intent and engineering feasibility through functional demos.',
    tools: 'Protopie, Framer, Unity, SwiftUI, React, After Effects',
    img: 'assets/xr-design-product-design-prototyper.gif'
  },
  'env-gd': {
    title: 'Environmental Graphic Designer',
    desc: 'Designs wayfinding systems, signage, and branded graphics that integrate with architectural spaces. Guides human movement and creates a sense of place through visual communication.',
    tools: 'Adobe Illustrator, SketchUp, AutoCAD, Rhino, InDesign',
    img: 'assets/environmental-graphics.jpeg'
  },
  'art-dir': {
    title: 'Art Director',
    desc: 'Leads the visual creative direction for campaigns, brand experiences, and installations. Guides teams to deliver cohesive, impactful visual narratives across media.',
    tools: 'Adobe Creative Suite, Figma, Cinema 4D, Keynote, Midjourney',
    img: 'assets/art-director.webp'
  },
  ct: {
    title: 'Creative Technologist',
    desc: 'Combines design thinking with technical prototyping to create novel interactive experiences. Uses emerging technologies to push creative boundaries and solve complex problems.',
    tools: 'TouchDesigner, p5.js, Arduino, Three.js, Unity, Python',
    img: 'assets/creative-tech-experiential-branding.webp'
  }
};

function showRoleInfo(roleId) {
  var data = roleData[roleId];
  if (!data) return;

  var overlay = document.getElementById('envInfoOverlay');
  var card = document.getElementById('envInfoCard');

  document.getElementById('envInfoImg').src = data.img;
  document.getElementById('envInfoImg').alt = data.title;
  document.getElementById('envInfoTitle').textContent = data.title;
  document.getElementById('envInfoDesc').textContent = data.desc;
  document.getElementById('envInfoTools').textContent = data.tools;

  gsap.killTweensOf(overlay);
  gsap.killTweensOf(card);
  card.style.pointerEvents = 'auto';
  gsap.to(overlay, { opacity: 1, duration: 0.25, ease: 'power2.out' });
  gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
}

function hideRoleInfo() {
  var overlay = document.getElementById('envInfoOverlay');
  var card = document.getElementById('envInfoCard');
  if (!overlay) return;

  gsap.killTweensOf(overlay);
  gsap.killTweensOf(card);
  gsap.to(card, { y: 8, duration: 0.15, ease: 'power2.in' });
  gsap.to(overlay, {
    opacity: 0, duration: 0.2, ease: 'power2.in',
    onComplete: function() { card.style.pointerEvents = 'none'; }
  });
}

/* ==========================================
   Why I Chose E — Draggable Mood Board
   ========================================== */
function initWhyEDrag() {
  var container = document.getElementById('whyEImages');
  if (!container) return;

  var items = container.querySelectorAll('.why-e-item');
  var maxZ = 10;
  var dragItem = null;
  var startX, startY, origX, origY;

  items.forEach(function(item) {
    item.addEventListener('mousedown', function(e) {
      e.preventDefault();
      e.stopPropagation();
      dragItem = item;
      item.classList.add('dragging');
      maxZ++;
      item.style.zIndex = maxZ;
      startX = e.clientX;
      startY = e.clientY;
      origX = item.offsetLeft;
      origY = item.offsetTop;
    });

    item.addEventListener('mouseenter', function() {
      var cb = document.getElementById('cursorBox');
      var cf = document.getElementById('cursorFill');
      if (cb) cb.style.transform = 'translate(-50%, -50%) scale(0.5)';
      if (cf) cf.style.clipPath = 'inset(0%)';
    });
    item.addEventListener('mouseleave', function() {
      var cb = document.getElementById('cursorBox');
      var cf = document.getElementById('cursorFill');
      if (cb) cb.style.transform = 'translate(-50%, -50%) scale(1)';
      if (cf) cf.style.clipPath = 'inset(100%)';
    });
  });

  document.addEventListener('mousemove', function(e) {
    if (!dragItem) return;
    var dx = e.clientX - startX;
    var dy = e.clientY - startY;
    dragItem.style.left = (origX + dx) + 'px';
    dragItem.style.top = (origY + dy) + 'px';
  });

  document.addEventListener('mouseup', function() {
    if (!dragItem) return;
    dragItem.classList.remove('dragging');
    dragItem = null;
  });
}

function resetMindsets() {
  var title = document.getElementById('mindsetsTitle');
  var content = document.getElementById('mindsetsContent');
  if (title) gsap.set(title, { opacity: 0, y: 20 });
  if (content) {
    gsap.set(content, { opacity: 1 });
    content.querySelectorAll(':scope > div > div').forEach(function(item) {
      gsap.set(item, { opacity: 0, y: 16 });
    });
  }
}

function animateMindsets() {
  var title = document.getElementById('mindsetsTitle');
  var content = document.getElementById('mindsetsContent');
  if (!title || !content) return;

  gsap.to(title, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });

  gsap.set(content, { opacity: 1 });
  var items = content.querySelectorAll(':scope > div > div');
  items.forEach(function(item, i) {
    gsap.to(item, { opacity: 1, y: 0, duration: 0.6, delay: 0.25 + i * 0.15, ease: 'power2.out' });
  });
}

function resetEnvDiagram() {
  gsap.set('#diagram-lines line', { opacity: 0 });
  gsap.set('#env-shapes circle', { opacity: 0 });
  gsap.set('#env-shapes polygon', { opacity: 0, scale: 1 });
  gsap.set('#env-labels text', { opacity: 0 });
  gsap.set('#env-legend', { opacity: 0 });
}

function animateEnvDiagram() {
  var overlay = document.getElementById('envInfoOverlay');
  if (overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; }
  var lines = document.querySelectorAll('#diagram-lines line');
  var shapes = document.querySelectorAll('#env-shapes circle, #env-shapes polygon');
  var labels = document.querySelectorAll('#env-labels text');

  gsap.set(lines, { opacity: 0 });
  gsap.set('#env-shapes circle', { opacity: 0 });
  gsap.set('#env-shapes polygon', { opacity: 0, scale: 1 });
  gsap.set(labels, { opacity: 0 });

  lines.forEach(function(line, i) {
    var target = parseFloat(line.getAttribute('opacity') || 0.25);
    gsap.to(line, { opacity: target, duration: 0.7, delay: 0.05 + i * 0.065, ease: 'power2.out' });
  });

  shapes.forEach(function(shape, i) {
    if (shape.tagName === 'circle') {
      var finalR = shape.getAttribute('r');
      gsap.fromTo(shape,
        { attr: { r: 0 }, opacity: 0 },
        { attr: { r: finalR }, opacity: 1, duration: 0.45, delay: 0.2 + i * 0.07, ease: 'back.out(1.7)' }
      );
    } else {
      var cx = parseFloat(shape.dataset.cx);
      var cy = parseFloat(shape.dataset.cy);
      gsap.fromTo(shape,
        { scale: 0, opacity: 0, svgOrigin: cx + ' ' + cy },
        { scale: 1, opacity: 1, duration: 0.45, delay: 0.2 + i * 0.07, ease: 'back.out(1.7)' }
      );
    }
  });

  labels.forEach(function(label, i) {
    gsap.fromTo(label,
      { opacity: 0, x: -4 },
      { opacity: 1, x: 0, duration: 0.5, delay: 0.4 + i * 0.045, ease: 'power2.out' }
    );
  });

  var legend = document.getElementById('env-legend');
  if (legend) {
    gsap.fromTo(legend, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.8, ease: 'power2.out' });
  }
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

