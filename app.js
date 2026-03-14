/* ========================================
   Raven UI — Application Logic
   ======================================== */

(function () {
  'use strict';

  // ── Initialize Lucide Icons ──
  lucide.createIcons();

  // ── State ──
  let currentPage = 'crypto';
  let benchmarkExpanded = false;

  // ── DOM References ──
  const sidebar = document.getElementById('sidebar');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const contentArea = document.getElementById('contentArea');
  const benchmarkToggle = document.getElementById('benchmarkToggle');
  const benchmarkChildren = document.getElementById('benchmarkChildren');
  const benchmarkArrow = document.getElementById('benchmarkArrow');

  // ── Hash Routing ──
  function getPageFromHash() {
    const hash = window.location.hash.replace('#', '') || 'crypto';
    const valid = ['crypto', 'polymarket', 'score', 'math-accuracy', 'points'];
    return valid.includes(hash) ? hash : 'crypto';
  }

  function navigateTo(page) {
    if (page === currentPage) return;

    // Fade out current
    const currentView = document.getElementById('page-' + currentPage);
    if (currentView) {
      gsap.to(currentView.querySelector('.page-content'), {
        opacity: 0,
        y: 12,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          currentView.classList.remove('active');
          showPage(page);
        }
      });
    } else {
      showPage(page);
    }
  }

  function showPage(page) {
    currentPage = page;

    // Update nav
    document.querySelectorAll('.nav-item, .nav-child-item').forEach(el => {
      el.classList.remove('active');
      if (el.dataset.page === page) el.classList.add('active');
    });

    // Expand benchmark if needed
    if (page === 'score' || page === 'math-accuracy') {
      benchmarkExpanded = true;
      benchmarkChildren.classList.add('expanded');
      benchmarkArrow.classList.add('rotated');
    }

    // Show page
    document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
    const newView = document.getElementById('page-' + page);
    if (newView) {
      newView.classList.add('active');

      // Animate in
      const content = newView.querySelector('.page-content');
      if (content) {
        gsap.fromTo(content, { opacity: 0, y: 16 }, {
          opacity: 1, y: 0, duration: 0.45, ease: 'power3.out'
        });

        // Stagger children
        if (content.classList.contains('stagger-in')) {
          const children = content.children;
          gsap.fromTo(children, { opacity: 0, y: 18 }, {
            opacity: 1, y: 0, duration: 0.45, ease: 'power3.out',
            stagger: 0.06, delay: 0.05
          });
        }
      }
    }

    // Init page-specific features
    if (page === 'crypto') initCryptoTabs();
    if (page === 'polymarket') initCarousel();
    if (page === 'score') initCountUp();
    if (page === 'math-accuracy') initMathTabs();

    // Close mobile sidebar
    closeMobileSidebar();

    // Scroll content to top
    contentArea.scrollTop = 0;
  }

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    navigateTo(getPageFromHash());
  });

  // ── Sidebar Nav ──
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', (e) => {
      // Already handled by hash change, just ensure hash is set
    });
  });

  // Benchmark toggle
  benchmarkToggle.addEventListener('click', () => {
    benchmarkExpanded = !benchmarkExpanded;
    benchmarkChildren.classList.toggle('expanded', benchmarkExpanded);
    benchmarkArrow.classList.toggle('rotated', benchmarkExpanded);
  });

  // ── Mobile Sidebar ──
  function openMobileSidebar() {
    sidebar.classList.add('open');
    mobileOverlay.classList.add('visible');
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    mobileOverlay.classList.remove('visible');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileSidebar);
  }
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileSidebar);
  }

  // ── Feature Tabs (Crypto Page) ──
  function initCryptoTabs() {
    const tabs = document.querySelectorAll('#cryptoTabs .feature-tab');
    const indicator = document.getElementById('cryptoTabIndicator');
    if (!tabs.length || !indicator) return;

    function updateIndicator(tab) {
      const rect = tab.getBoundingClientRect();
      const parentRect = tab.parentElement.getBoundingClientRect();
      indicator.style.left = (rect.left - parentRect.left) + 'px';
      indicator.style.width = rect.width + 'px';
    }

    // Set initial
    const activeTab = document.querySelector('#cryptoTabs .feature-tab.active');
    if (activeTab) {
      // Delay to ensure layout is ready
      requestAnimationFrame(() => updateIndicator(activeTab));
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updateIndicator(tab);
      });
    });
  }

  // ── Math Accuracy Tabs ──
  function initMathTabs() {
    // Platform tabs
    const platformTabs = document.querySelectorAll('#platformTabs .platform-tab');
    platformTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        platformTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      });
    });

    // Metric tabs with indicator
    const metricTabs = document.querySelectorAll('#metricTabs .metric-tab-btn');
    const metricIndicator = document.getElementById('metricTabIndicator');

    function updateMetricIndicator(tab) {
      const rect = tab.getBoundingClientRect();
      const parentRect = tab.parentElement.getBoundingClientRect();
      metricIndicator.style.left = (rect.left - parentRect.left) + 'px';
      metricIndicator.style.width = rect.width + 'px';
    }

    const activeMetricTab = document.querySelector('#metricTabs .metric-tab-btn.active');
    if (activeMetricTab) {
      requestAnimationFrame(() => updateMetricIndicator(activeMetricTab));
    }

    metricTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        metricTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updateMetricIndicator(tab);
      });
    });

    // Toggle
    const toggle = document.getElementById('temporalToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
      });
    }
  }

  // ── Polymarket Carousel ──
  function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    if (!track || !dotsContainer) return;

    const cards = track.querySelectorAll('.prediction-card');
    const cardWidth = 296; // 280 + 16 gap
    const visibleCards = Math.floor(track.clientWidth / cardWidth) || 3;
    const totalDots = Math.max(1, cards.length - visibleCards + 1);

    // Create dots
    dotsContainer.innerHTML = '';
    for (let i = 0; i < Math.min(totalDots, 7); i++) {
      const dot = document.createElement('div');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => {
        track.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
      });
      dotsContainer.appendChild(dot);
    }

    // Update dots on scroll
    track.addEventListener('scroll', () => {
      const scrollPos = track.scrollLeft;
      const activeIndex = Math.round(scrollPos / cardWidth);
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === Math.min(activeIndex, totalDots - 1));
      });
    });

    // Draggable scroll
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.style.cursor = 'grabbing';
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.style.cursor = 'grab';
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.style.cursor = 'grab';
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });
  }

  // ── Count-Up Animation ──
  function initCountUp() {
    const metricValues = document.querySelectorAll('#metricsGrid .metric-value[data-count]');

    metricValues.forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const rawCount = el.dataset.count;
      const isFloat = rawCount.includes('.');
      const decimals = isFloat ? rawCount.split('.')[1].length : 0;
      const obj = { val: 0 };

      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        delay: 0.3,
        onUpdate: function () {
          if (isFloat) {
            el.textContent = prefix + obj.val.toFixed(decimals) + suffix;
          } else {
            el.textContent = prefix + Math.round(obj.val) + suffix;
          }
        },
        onComplete: function () {
          // Ensure exact final value
          if (isFloat) {
            el.textContent = prefix + target.toFixed(decimals) + suffix;
          } else {
            el.textContent = prefix + target + suffix;
          }
        }
      });
    });
  }

  // ── Mouse-follow Glow on Cards ──
  document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.prediction-card, .metric-card');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  // ── Filter Bar Buttons (Polymarket) ──
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-bar-btn')) {
      const siblings = e.target.parentElement.querySelectorAll('.filter-bar-btn');
      siblings.forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
    }
  });

  // ── Initialize ──
  const initialPage = getPageFromHash();
  currentPage = ''; // Force first load
  showPage(initialPage);

  // Re-init indicators on resize
  window.addEventListener('resize', () => {
    if (currentPage === 'crypto') initCryptoTabs();
    if (currentPage === 'math-accuracy') initMathTabs();
  });

})();
