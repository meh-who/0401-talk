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
   What is E — Three.js Node Diagram
   ========================================== */
var _env = null;

function buildEnvDesignDiagram() {
  if (typeof THREE === 'undefined') return;
  var page = document.getElementById('whatIsEPage');
  if (!page) return;

  // Canvas
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
  page.appendChild(canvas);

  // HTML label overlay
  var labelCont = document.createElement('div');
  labelCont.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
  page.appendChild(labelCont);

  var W = window.innerWidth, H = window.innerHeight;
  var FH = 10;
  var FW = FH * (W / H);

  var scene = new THREE.Scene();
  var camera = new THREE.OrthographicCamera(-FW/2, FW/2, FH/2, -FH/2, 0.1, 100);
  camera.position.z = 10;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H, false);

  // Node positions: world coords (y: -5 to 5, x proportional to aspect)
  var nodes = [
    { id:'env',      label:'Environment Design',             x:-4.5,  y: 0.1,  r:0.16, type:'center'                 },
    { id:'set',      label:'Set design',                     x:-1.8,  y: 2.5,  r:0.09, type:'primary'                },
    { id:'xr',       label:'XR design',                      x:-0.9,  y: 1.15, r:0.09, type:'primary'                },
    { id:'interior', label:'Interior Design',                x: 0.0,  y:-0.35, r:0.09, type:'primary'                },
    { id:'exp',      label:'Experiential Branding Design',   x:-1.4,  y:-2.1,  r:0.09, type:'primary'                },
    { id:'set_ta',   label:'technical artist',               x: 1.0,  y: 3.5,  r:0.055,type:'secondary',parent:'set' },
    { id:'set_3d',   label:'3D artist',                      x: 1.3,  y: 2.2,  r:0.055,type:'secondary',parent:'set' },
    { id:'xr_ta',    label:'technical artist',               x: 2.0,  y: 2.0,  r:0.055,type:'secondary',parent:'xr'  },
    { id:'xr_pd',    label:'product design',                 x: 2.3,  y: 1.0,  r:0.055,type:'secondary',parent:'xr'  },
    { id:'xr_pdp',   label:'product design prototyper',      x: 1.9,  y:-0.1,  r:0.055,type:'secondary',parent:'xr'  },
    { id:'exp_eg',   label:'Environmental graphic designer', x: 1.6,  y:-1.45, r:0.055,type:'secondary',parent:'exp' },
    { id:'exp_ad',   label:'art director',                   x: 2.0,  y:-2.4,  r:0.055,type:'secondary',parent:'exp' },
    { id:'exp_ct',   label:'creative technologist',          x: 1.6,  y:-3.4,  r:0.055,type:'secondary',parent:'exp' },
  ];

  var edges = [
    {from:'env',to:'set'},{from:'env',to:'xr'},{from:'env',to:'interior'},{from:'env',to:'exp'},
    {from:'set',to:'set_ta'},{from:'set',to:'set_3d'},
    {from:'xr', to:'xr_ta'},{from:'xr', to:'xr_pd'},{from:'xr',to:'xr_pdp'},
    {from:'exp',to:'exp_eg'},{from:'exp',to:'exp_ad'},{from:'exp',to:'exp_ct'},
  ];

  var nodeMap = {};
  nodes.forEach(function(n) { nodeMap[n.id] = n; n.connected = []; });
  edges.forEach(function(e) { nodeMap[e.from].connected.push(e.to); nodeMap[e.to].connected.push(e.from); });

  // Meshes
  nodes.forEach(function(n) {
    var geo = new THREE.CircleGeometry(n.r, 40);
    var mat = new THREE.MeshBasicMaterial({ color: n.type === 'secondary' ? 0x999999 : 0x1a1a1a, transparent: true, opacity: 0 });
    var mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(n.x, n.y, 0);
    scene.add(mesh);
    n.mesh = mesh;
    n.baseY = n.y;
    n.phase = Math.random() * Math.PI * 2;
  });

  // Edges
  edges.forEach(function(e) {
    var fn = nodeMap[e.from], tn = nodeMap[e.to];
    var geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(fn.x, fn.y, -0.1), new THREE.Vector3(tn.x, tn.y, -0.1)
    ]);
    var mat = new THREE.LineBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0 });
    scene.add(new THREE.Line(geo, mat));
    e.mesh = scene.children[scene.children.length - 1];
    e.baseOpacity = (e.from === 'env') ? 0.2 : 0.13;
  });

  // HTML labels
  nodes.forEach(function(n) {
    var div = document.createElement('div');
    div.className = 'env-label ' + n.type;
    div.textContent = n.label;
    div.style.opacity = '0';
    labelCont.appendChild(div);
    n.labelEl = div;
  });

  // Mouse hover
  var mouse = { x: -999, y: -999 };
  var hoveredId = null;

  page.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  });
  page.addEventListener('mouseleave', function() { mouse.x = -999; mouse.y = -999; });

  function findHovered() {
    var wx = mouse.x * camera.right, wy = mouse.y * camera.top;
    var best = null, bestD = Infinity;
    nodes.forEach(function(n) {
      var dx = wx - n.mesh.position.x, dy = wy - n.mesh.position.y;
      var d = Math.sqrt(dx*dx + dy*dy);
      if (d < Math.max(n.r * 5, 0.22) && d < bestD) { best = n; bestD = d; }
    });
    return best ? best.id : null;
  }

  function applyHover(newId) {
    if (newId === hoveredId) return;
    hoveredId = newId;
    if (newId) {
      var h = nodeMap[newId], conn = {};
      conn[newId] = true;
      h.connected.forEach(function(id) { conn[id] = true; });
      nodes.forEach(function(n) {
        var active = !!conn[n.id];
        gsap.to(n.mesh.material, { opacity: active ? 1 : 0.08, duration: 0.2 });
        n.labelEl.style.opacity = active ? '1' : '0.07';
        n.labelEl.style.fontWeight = (n.id === newId) ? '600' : '';
        n.labelEl.style.color     = (n.id === newId) ? '#000' : '';
      });
      edges.forEach(function(e) {
        gsap.to(e.mesh.material, { opacity: (!!conn[e.from] && !!conn[e.to]) ? e.baseOpacity * 4 : 0.02, duration: 0.2 });
      });
    } else {
      nodes.forEach(function(n) {
        gsap.to(n.mesh.material, { opacity: 1, duration: 0.3 });
        n.labelEl.style.opacity = '1';
        n.labelEl.style.fontWeight = '';
        n.labelEl.style.color = '';
      });
      edges.forEach(function(e) { gsap.to(e.mesh.material, { opacity: e.baseOpacity, duration: 0.3 }); });
    }
  }

  function updateLabels() {
    nodes.forEach(function(n) {
      var pos = n.mesh.position.clone().project(camera);
      n.labelEl.style.left = ((pos.x * 0.5 + 0.5) * W + n.r * W / FW + 7) + 'px';
      n.labelEl.style.top  = ((-pos.y * 0.5 + 0.5) * H) + 'px';
    });
  }

  var clock = 0, rafId = null, active = false;

  function tick() {
    if (!active) return;
    rafId = requestAnimationFrame(tick);
    clock += 0.012;
    nodes.forEach(function(n) { n.mesh.position.y = n.baseY + Math.sin(clock + n.phase) * 0.032; });
    edges.forEach(function(e) {
      var fn = nodeMap[e.from], tn = nodeMap[e.to];
      var arr = e.mesh.geometry.attributes.position.array;
      arr[0] = fn.mesh.position.x; arr[1] = fn.mesh.position.y;
      arr[3] = tn.mesh.position.x; arr[4] = tn.mesh.position.y;
      e.mesh.geometry.attributes.position.needsUpdate = true;
    });
    applyHover(findHovered());
    updateLabels();
    renderer.render(scene, camera);
  }

  window.addEventListener('resize', function() {
    W = window.innerWidth; H = window.innerHeight; FW = FH * (W / H);
    camera.left = -FW/2; camera.right = FW/2; camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  });

  function playEntrance() {
    nodes.forEach(function(n) { gsap.set(n.mesh.material, { opacity: 0 }); n.labelEl.style.opacity = '0'; });
    edges.forEach(function(e) { gsap.set(e.mesh.material, { opacity: 0 }); });
    hoveredId = null;
    edges.forEach(function(e, i) {
      gsap.to(e.mesh.material, { opacity: e.baseOpacity, duration: 0.9, delay: 0.05 + i * 0.07, ease: 'power2.out' });
    });
    nodes.forEach(function(n, i) {
      gsap.to(n.mesh.material, { opacity: 1, duration: 0.55, delay: 0.15 + i * 0.08, ease: 'power2.out' });
      (function(el, d) { setTimeout(function() { el.style.opacity = '1'; }, d * 1000); })(n.labelEl, 0.3 + i * 0.08);
    });
  }

  _env = {
    start: function() { active = true; playEntrance(); tick(); },
    stop:  function() {
      active = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      nodes.forEach(function(n) { n.labelEl.style.opacity = '0'; });
    }
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

