// ================================================================
// RAVEN AI — APP.JS
// Three.js background, GSAP animations, hash routing, interactions
// ================================================================

// ----------------------------------------------------------------
// POLYMARKET DATA
// ----------------------------------------------------------------
const polymarketData = [
  { title: "Russia x Ukraine ceasefire by March 31, 2026?", yes: 2, no: 98, volume: "$25m", freq: "Daily" },
  { title: "English Premier League Winner", yes: 0, no: 100, volume: "$341m", freq: "Weekly" },
  { title: "Democratic Presidential Nominee 2028", yes: 1, no: 99, volume: "$823m", freq: "Daily" },
  { title: "Russia x Ukraine ceasefire by end of 2026?", yes: 38, no: 63, volume: "$12m", freq: "Weekly" },
  { title: "GTA VI released before June 2026?", yes: 3, no: 97, volume: "$11m", freq: "Monthly" },
  { title: "Will China invade Taiwan by end of 2026?", yes: 10, no: 90, volume: "$11m", freq: "Monthly" },
  { title: "The Masters - Winner", yes: 5, no: 95, volume: "$42m", freq: "Weekly" },
  { title: "Xi Jinping out before 2027?", yes: 9, no: 91, volume: "$7m", freq: "Monthly" },
  { title: "Republican Presidential Nominee 2028", yes: 2, no: 98, volume: "$409m", freq: "Daily" },
  { title: "2026 FIFA World Cup Winner", yes: 15, no: 85, volume: "$298m", freq: "Weekly" },
  { title: "Presidential Election Winner 2028", yes: 1, no: 99, volume: "$402m", freq: "Daily" },
  { title: "Next Prime Minister of Hungary", yes: 36, no: 65, volume: "$31m", freq: "Monthly" }
];

// CHART DATA
const chartData = {
  pdds: {
    title: "PDDS Score by Asset",
    labels: ["BTC", "ETH", "SOL", "AVAX", "MATIC", "DOT"],
    current: [94, 91, 87, 83, 79, 76],
    previous: [89, 86, 81, 78, 73, 70]
  },
  directional: {
    title: "Directional Accuracy by Asset",
    labels: ["BTC", "ETH", "SOL", "AVAX", "MATIC", "DOT"],
    current: [95, 92, 89, 85, 82, 78],
    previous: [90, 87, 83, 79, 76, 72]
  },
  price: {
    title: "Price Accuracy by Asset",
    labels: ["BTC", "ETH", "SOL", "AVAX", "MATIC", "DOT"],
    current: [99, 96, 93, 90, 87, 84],
    previous: [94, 91, 88, 85, 82, 79]
  }
};

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) lucide.createIcons();

  // Build dynamic content
  buildChartBars('pdds');

  // Initialize routing
  initRouter();

  // Initialize tabs
  initTabs();
  initMetricTabs();
  initModelFilters();

  // Initialize interactions
  initTiltEffect();
  initNavIndicator();
  initMobileMenu();
  initCountUpObserver();
  initMetricBars();
  initRings();
  initMouseSpotlight();

  // Initialize GSAP
  gsap.registerPlugin(ScrollTrigger);

  // Initialize Three.js background
  initThreeBackground();
});

// ----------------------------------------------------------------
// HASH ROUTER
// ----------------------------------------------------------------
function initRouter() {
  const handleRoute = () => {
    const hash = window.location.hash.slice(1) || 'crypto';
    switchPage(hash);
  };

  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function switchPage(pageId) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });
  document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === pageId);
  });

  const targetPage = document.getElementById(`page-${pageId}`);
  if (!targetPage) return;

  const currentPage = document.querySelector('.page.active');

  // If clicking same page, just run content animations
  if (currentPage === targetPage) {
    animatePageContent(pageId);
    updateNavIndicator();
    return;
  }

  // Animate out current page if different
  if (currentPage) {
    gsap.to(currentPage, {
      opacity: 0,
      y: -15,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        currentPage.classList.remove('active');
        currentPage.style.opacity = '';
        currentPage.style.transform = '';
        showPage(pageId);
      }
    });
  } else {
    showPage(pageId);
  }

  updateNavIndicator();
}

function showPage(pageId) {
  const page = document.getElementById(`page-${pageId}`);
  if (!page) return;

  // Immediately make visible, then animate children
  page.classList.add('active');
  page.style.opacity = '1';
  page.style.transform = 'none';

  // Animate the whole page container in
  gsap.fromTo(page, {
    opacity: 0,
    y: 20
  }, {
    opacity: 1,
    y: 0,
    duration: 0.4,
    ease: "power3.out",
    clearProps: 'transform'
  });

  animatePageContent(pageId);
}

function animatePageContent(pageId) {
  const page = document.getElementById(`page-${pageId}`);
  if (!page) return;

  // Stagger children animation
  const children = page.querySelectorAll('.page-header, .tabs-container, .glass-card, .model-filters, .metric-tabs-container, .live-results, .input-area, .upgrade-banner, .points-empty-state');

  gsap.fromTo(children, {
    opacity: 0,
    y: 25,
    scale: 0.98
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.5,
    stagger: 0.04,
    ease: "power3.out",
    delay: 0.1
  });

  // Animate bars if on relevant pages
  if (pageId === 'score') {
    setTimeout(() => {
      animateMetricBars();
      animateCountUps(page);
      animateRings(page);
    }, 300);
  }

  if (pageId === 'math-accuracy') {
    setTimeout(() => {
      animateChartBars();
      animateCountUps(page);
      animateRings(page);
    }, 300);
  }

  if (pageId === 'polymarket') {
    setTimeout(() => animatePredictionBars(), 300);
  }

  // Reinit lucide for any new elements
  if (window.lucide) lucide.createIcons();
}

// ----------------------------------------------------------------
// TABS
// ----------------------------------------------------------------
function initTabs() {
  const tabsContainer = document.querySelector('#page-crypto .tabs');
  if (!tabsContainer) return;

  const tabs = tabsContainer.querySelectorAll('.tab');
  const indicator = tabsContainer.querySelector('.tab-indicator');

  function updateIndicator(activeTab) {
    const rect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    gsap.to(indicator, {
      left: rect.left - containerRect.left,
      width: rect.width,
      duration: 0.4,
      ease: "back.out(1.4)"
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      if (tab.classList.contains('disabled')) return;
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      updateIndicator(tab);
    });
  });

  // Initial position
  const activeTab = tabsContainer.querySelector('.tab.active');
  if (activeTab) {
    requestAnimationFrame(() => updateIndicator(activeTab));
  }
}

function initMetricTabs() {
  const tabsContainer = document.querySelector('.metric-tabs');
  if (!tabsContainer) return;

  const tabs = tabsContainer.querySelectorAll('.tab');
  const indicator = tabsContainer.querySelector('.metric-tab-indicator');

  function updateIndicator(activeTab) {
    const rect = activeTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    gsap.to(indicator, {
      left: rect.left - containerRect.left,
      width: rect.width,
      duration: 0.4,
      ease: "back.out(1.4)"
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const metricKey = tab.dataset.metricTab;
      buildChartBars(metricKey);
      setTimeout(animateChartBars, 50);
      document.getElementById('chart-title').textContent = chartData[metricKey].title;
      updateIndicator(tab);
    });
  });

  const activeTab = tabsContainer.querySelector('.tab.active');
  if (activeTab) {
    requestAnimationFrame(() => updateIndicator(activeTab));
  }
}

function initModelFilters() {
  const btns = document.querySelectorAll('.model-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Re-animate chart
      gsap.to('.chart-bar', {
        height: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setTimeout(animateChartBars, 100);
        }
      });
    });
  });
}

// ----------------------------------------------------------------
// NAV INDICATOR
// ----------------------------------------------------------------
function initNavIndicator() {
  updateNavIndicator();
}

function updateNavIndicator() {
  const indicator = document.getElementById('nav-indicator');
  const activeItem = document.querySelector('.nav-item.active');
  if (!indicator || !activeItem) return;

  const nav = document.querySelector('.sidebar-nav');
  const navRect = nav.getBoundingClientRect();
  const itemRect = activeItem.getBoundingClientRect();

  gsap.to(indicator, {
    top: itemRect.top - navRect.top,
    height: itemRect.height,
    duration: 0.4,
    ease: "back.out(1.7)"
  });
}

// ----------------------------------------------------------------
// MOBILE MENU
// ----------------------------------------------------------------
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.getElementById('sidebar');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Close sidebar on nav click (mobile)
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
      }
    });
  });
}

// ----------------------------------------------------------------
// POLYMARKET CARDS
// ----------------------------------------------------------------
function buildPolymarketCards() {
  const grid = document.getElementById('polymarket-grid');
  if (!grid) return;

  grid.innerHTML = polymarketData.map((item, i) => `
    <div class="glass-card prediction-card" data-tilt>
      <div class="card-glow"></div>
      <div class="card-border-gradient"></div>
      <div class="card-content">
        <p class="prediction-title">${item.title}</p>
        <div class="prediction-bars">
          <div class="pred-bar-row">
            <span class="pred-label yes">Yes</span>
            <div class="pred-bar-track"><div class="pred-bar-fill yes" data-width="${item.yes}"></div></div>
            <span class="pred-percent yes">${item.yes}%</span>
          </div>
          <div class="pred-bar-row">
            <span class="pred-label no">No</span>
            <div class="pred-bar-track"><div class="pred-bar-fill no" data-width="${item.no}"></div></div>
            <span class="pred-percent no">${item.no}%</span>
          </div>
        </div>
        <div class="prediction-footer">
          <span class="pred-volume">${item.volume} <span>Vol.</span></span>
          <button class="ask-raven-small">
            <i data-lucide="sparkles"></i>
            Ask Raven
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function animatePredictionBars() {
  document.querySelectorAll('#page-polymarket .pred-bar-fill').forEach(bar => {
    const width = bar.dataset.width;
    gsap.fromTo(bar, { width: '0%' }, {
      width: width + '%',
      duration: 0.8,
      ease: "back.out(1.2)",
      delay: 0.1
    });
  });
}

// ----------------------------------------------------------------
// CHART BARS
// ----------------------------------------------------------------
function buildChartBars(metricKey) {
  const area = document.getElementById('chart-area');
  if (!area) return;
  const data = chartData[metricKey];

  area.innerHTML = data.labels.map((label, i) => `
    <div class="chart-bar-group">
      <div class="chart-bars">
        <div class="chart-bar current" style="height: 0%" data-height="${data.current[i]}">
          <span class="chart-bar-value">${data.current[i]}%</span>
        </div>
        <div class="chart-bar previous" style="height: 0%" data-height="${data.previous[i]}">
          <span class="chart-bar-value">${data.previous[i]}%</span>
        </div>
      </div>
      <span class="chart-bar-label">${label}</span>
    </div>
  `).join('');
}

function animateChartBars() {
  document.querySelectorAll('#chart-area .chart-bar').forEach((bar, i) => {
    const height = bar.dataset.height;
    gsap.fromTo(bar, { height: '0%' }, {
      height: height + '%',
      duration: 0.7,
      ease: "back.out(1.3)",
      delay: i * 0.06
    });
  });
}

// ----------------------------------------------------------------
// 3D TILT EFFECT
// ----------------------------------------------------------------
function initTiltEffect() {
  document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: "power2.out" });
        return;
      }

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = (y - centerY) / centerY * -3;
      const tiltY = (x - centerX) / centerX * 3;

      gsap.to(card, {
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 1000,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
}

// ----------------------------------------------------------------
// COUNT-UP ANIMATIONS
// ----------------------------------------------------------------
function initCountUpObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCountUps(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('.page').forEach(page => {
    observer.observe(page);
  });
}

function animateCountUps(container) {
  const elements = container.querySelectorAll('.count-up');
  elements.forEach(el => {
    const target = parseFloat(el.dataset.value);
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals) || (target % 1 !== 0 ? 1 : 0);
    const startVal = { val: 0 };

    gsap.to(startVal, {
      val: target,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = startVal.val.toFixed(decimals) + suffix;
      }
    });
  });
}

// ----------------------------------------------------------------
// METRIC BARS
// ----------------------------------------------------------------
function initMetricBars() {
  // Will be animated on page enter
}

function animateMetricBars() {
  document.querySelectorAll('.metric-bar-fill').forEach((bar, i) => {
    const width = bar.dataset.width;
    gsap.fromTo(bar, { width: '0%' }, {
      width: width + '%',
      duration: 1,
      ease: "back.out(1.2)",
      delay: i * 0.1
    });
  });
}

// ----------------------------------------------------------------
// RINGS
// ----------------------------------------------------------------
function initRings() {
  // Will animate on page enter
}

function animateRings(container) {
  const rings = container.querySelectorAll('.summary-ring');
  rings.forEach((ring, i) => {
    const percent = parseInt(ring.dataset.percent);
    const circle = ring.querySelector('.ring-fill');
    if (!circle) return;

    const circumference = 2 * Math.PI * 52; // r = 52
    const offset = circumference - (percent / 100) * circumference;

    gsap.fromTo(circle, {
      strokeDashoffset: circumference
    }, {
      strokeDashoffset: offset,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.2 + i * 0.15
    });
  });
}

// ----------------------------------------------------------------
// MOUSE SPOTLIGHT
// ----------------------------------------------------------------
function initMouseSpotlight() {
  const spotlight = document.getElementById('mouse-spotlight');
  if (!spotlight) return;

  document.addEventListener('mousemove', (e) => {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
  });
}

// ----------------------------------------------------------------
// THREE.JS ANIMATED BACKGROUND
// ----------------------------------------------------------------
async function initThreeBackground() {
  try {
    const THREE = await import('three');

    const canvas = document.getElementById('bg-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // GRADIENT MESH — large background plane with animated gradient
    const gradientGeo = new THREE.PlaneGeometry(20, 20, 64, 64);
    const gradientMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uColor1: { value: new THREE.Color('#0B0F18') },
        uColor2: { value: new THREE.Color('#0a1628') },
        uColor3: { value: new THREE.Color('#110a20') }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vDisplacement;
        uniform float uTime;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float displacement = sin(pos.x * 1.5 + uTime * 0.3) * cos(pos.y * 1.2 + uTime * 0.25) * 0.15;
          pos.z += displacement;
          vDisplacement = displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        varying float vDisplacement;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform float uTime;
        uniform vec2 uMouse;
        void main() {
          float mixFactor = vUv.x * 0.5 + vUv.y * 0.5 + sin(uTime * 0.15) * 0.15;
          vec3 color = mix(uColor1, uColor2, mixFactor);
          color = mix(color, uColor3, sin(vUv.x * 3.14 + uTime * 0.2) * 0.3 + 0.3);
          // Mouse influence
          float mouseDist = distance(vUv, uMouse);
          color += vec3(0.0, 0.03, 0.05) * smoothstep(0.5, 0.0, mouseDist);
          // Displacement highlight
          color += vec3(0.0, 0.015, 0.02) * (vDisplacement + 0.15);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false
    });

    const gradientMesh = new THREE.Mesh(gradientGeo, gradientMat);
    gradientMesh.position.z = -3;
    scene.add(gradientMesh);

    // FLOATING ORBS — subtle, blurred background elements
    const orbGroup = new THREE.Group();
    const orbColors = [
      new THREE.Color('#00E5FF').multiplyScalar(0.06),
      new THREE.Color('#8B5CF6').multiplyScalar(0.05),
      new THREE.Color('#00FFA3').multiplyScalar(0.04)
    ];

    for (let i = 0; i < 3; i++) {
      const geo = new THREE.SphereGeometry(0.8 + i * 0.3, 32, 32);
      const mat = new THREE.MeshBasicMaterial({
        color: orbColors[i],
        transparent: true,
        opacity: 0.18
      });
      const orb = new THREE.Mesh(geo, mat);
      orb.position.set(
        (i - 1) * 4,
        Math.sin(i * 2) * 2,
        -3 - i * 0.5
      );
      orb.userData = {
        baseX: orb.position.x,
        baseY: orb.position.y,
        speed: 0.15 + i * 0.08,
        amplitude: 1.2 + i * 0.4
      };
      orbGroup.add(orb);
    }
    scene.add(orbGroup);

    // PARTICLE CONSTELLATION
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
      velocities.push({
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.002
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: new THREE.Color('#00E5FF'),
      size: 0.02,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // CONSTELLATION LINES
    const linesMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#00E5FF'),
      transparent: true,
      opacity: 0.04
    });

    const linesGroup = new THREE.Group();
    scene.add(linesGroup);

    // Mouse tracking
    let mouseX = 0.5, mouseY = 0.5;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / window.innerWidth;
      mouseY = 1.0 - (e.clientY / window.innerHeight);
    });

    // Resize
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    // Animate
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Update gradient
      gradientMat.uniforms.uTime.value = elapsed;
      gradientMat.uniforms.uMouse.value.set(mouseX, mouseY);

      // Animate orbs
      orbGroup.children.forEach((orb) => {
        const d = orb.userData;
        orb.position.x = d.baseX + Math.sin(elapsed * d.speed) * d.amplitude;
        orb.position.y = d.baseY + Math.cos(elapsed * d.speed * 0.7) * d.amplitude * 0.6;
      });

      // Animate particles
      const posArray = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i].x;
        posArray[i * 3 + 1] += velocities[i].y;
        posArray[i * 3 + 2] += velocities[i].z;

        // Wrap around
        if (Math.abs(posArray[i * 3]) > 7) velocities[i].x *= -1;
        if (Math.abs(posArray[i * 3 + 1]) > 5) velocities[i].y *= -1;
        if (Math.abs(posArray[i * 3 + 2]) > 3) velocities[i].z *= -1;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Update constellation lines (connect nearby particles)
      linesGroup.clear();
      const connectionDist = 2.0;
      const linePositions = [];

      for (let i = 0; i < particleCount; i++) {
        for (let j = i + 1; j < particleCount; j++) {
          const dx = posArray[i * 3] - posArray[j * 3];
          const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
          const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < connectionDist) {
            linePositions.push(
              posArray[i * 3], posArray[i * 3 + 1], posArray[i * 3 + 2],
              posArray[j * 3], posArray[j * 3 + 1], posArray[j * 3 + 2]
            );
          }
        }
      }

      if (linePositions.length > 0) {
        const linesGeo = new THREE.BufferGeometry();
        linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lines = new THREE.LineSegments(linesGeo, linesMat);
        linesGroup.add(lines);
      }

      // Subtle camera sway
      camera.position.x = (mouseX - 0.5) * 0.3;
      camera.position.y = (mouseY - 0.5) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    animate();

  } catch (err) {
    console.warn('Three.js background failed to initialize:', err);
  }
}

// ----------------------------------------------------------------
// BORDER GRADIENT ROTATION (CSS @property animation)
// ----------------------------------------------------------------
(function initBorderGradientAnimation() {
  // Use CSS animation for rotating border gradient
  const style = document.createElement('style');
  style.textContent = `
    .glass-card:hover .card-border-gradient::after {
      animation: border-rotate 3s linear infinite;
    }
    @keyframes border-rotate {
      to { --border-angle: 360deg; }
    }
  `;
  document.head.appendChild(style);
})();

// ================================================================
// V4 ENHANCEMENTS
// ================================================================

// ----------------------------------------------------------------
// LIVE TICKER
// ----------------------------------------------------------------
const tickerItems = [
  { sym: 'BTC', price: '$94,312', change: '+2.4%', up: true },
  { sym: 'ETH', price: '$3,218',  change: '+1.8%', up: true },
  { sym: 'SOL', price: '$182.4',  change: '-0.6%', up: false },
  { sym: 'AVAX', price: '$41.7',  change: '+3.1%', up: true },
  { sym: 'MATIC', price: '$0.87', change: '-1.2%', up: false },
  { sym: 'DOT',  price: '$9.34',  change: '+0.9%', up: true },
  { sym: 'LINK', price: '$18.6',  change: '+2.2%', up: true },
  { sym: 'UNI',  price: '$11.2',  change: '-0.4%', up: false },
  { sym: 'ARB',  price: '$1.34',  change: '+4.7%', up: true },
  { sym: 'OP',   price: '$2.91',  change: '+1.3%', up: true },
  { sym: 'Raven Accuracy', price: '98.6%', change: 'Live', up: true },
];

function buildTicker(id) {
  const track = document.getElementById(id);
  if (!track) return;
  const html = tickerItems.map(t => `
    <span class="ticker-item">
      <span class="ticker-sym">${t.sym}</span>
      <span>${t.price}</span>
      <span class="${t.up ? 'ticker-up' : 'ticker-dn'}">${t.change}</span>
    </span>
  `).join('');
  // Duplicate for seamless loop
  track.innerHTML = html + html;
}

// ----------------------------------------------------------------
// HERO 3D CRYSTAL ORB — Three.js
// ----------------------------------------------------------------
async function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  try {
    const THREE = await import('three');

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();

    const W = canvas.parentElement.offsetWidth;
    const H = canvas.parentElement.offsetHeight || 520;
    renderer.setSize(W, H);

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(3.5, 0.5, 5);
    camera.lookAt(0, 0, 0);

    // --- Crystal / Icosahedron orb ---
    const orbGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const orbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0a1628'),
      emissive: new THREE.Color('#00E5FF'),
      emissiveIntensity: 0.08,
      metalness: 0.9,
      roughness: 0.1,
      wireframe: false,
      transparent: true,
      opacity: 0.85,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);

    // Wireframe overlay
    const wireGeo = new THREE.IcosahedronGeometry(1.62, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00E5FF'),
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wire);

    // Inner core glow sphere
    const coreGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#8B5CF6'),
      transparent: true,
      opacity: 0.15,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(2.2, 0.012, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00E5FF'),
      transparent: true,
      opacity: 0.25,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.4;
    scene.add(ring);

    // Particle halo around orb
    const haloCount = 120;
    const haloGeo = new THREE.BufferGeometry();
    const haloPos = new Float32Array(haloCount * 3);
    for (let i = 0; i < haloCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.0 + Math.random() * 1.2;
      haloPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      haloPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      haloPos[i * 3 + 2] = r * Math.cos(phi);
    }
    haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos, 3));
    const haloMat = new THREE.PointsMaterial({
      color: new THREE.Color('#a78bfa'),
      size: 0.025,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    const halo = new THREE.Points(haloGeo, haloMat);
    scene.add(halo);

    // Lighting
    const amb = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(amb);
    const pt1 = new THREE.PointLight(0x00E5FF, 3, 10);
    pt1.position.set(3, 2, 3);
    scene.add(pt1);
    const pt2 = new THREE.PointLight(0x8B5CF6, 2, 10);
    pt2.position.set(-3, -2, 2);
    scene.add(pt2);
    const pt3 = new THREE.PointLight(0x00FFA3, 1.5, 8);
    pt3.position.set(0, 3, -2);
    scene.add(pt3);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
      const nW = canvas.parentElement.offsetWidth;
      const nH = canvas.parentElement.offsetHeight || 520;
      renderer.setSize(nW, nH);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    });

    const clock = new THREE.Clock();
    function animateHero() {
      if (!document.getElementById('page-crypto').classList.contains('active')) {
        requestAnimationFrame(animateHero);
        renderer.render(scene, camera);
        return;
      }
      const t = clock.getElapsedTime();

      orb.rotation.y = t * 0.18;
      orb.rotation.x = t * 0.08 + mouseY * 0.15;
      wire.rotation.y = t * 0.18;
      wire.rotation.x = t * 0.08 + mouseY * 0.15;
      core.rotation.y = -t * 0.3;
      ring.rotation.z = t * 0.22;
      halo.rotation.y = t * 0.05;

      // Breathe
      const breathe = 1 + Math.sin(t * 0.9) * 0.04;
      orb.scale.setScalar(breathe);
      wire.scale.setScalar(breathe);
      core.scale.setScalar(breathe * 0.95);

      // Light pulse
      pt1.intensity = 3 + Math.sin(t * 1.4) * 0.8;
      pt2.intensity = 2 + Math.cos(t * 1.1) * 0.5;

      // Mouse-reactive camera nudge
      camera.position.x = 3.5 + mouseX * 0.4;
      camera.position.y = 0.5 + mouseY * 0.3;
      camera.lookAt(0, 0, 0);

      requestAnimationFrame(animateHero);
      renderer.render(scene, camera);
    }
    animateHero();

  } catch (err) {
    console.warn('Hero canvas init failed:', err);
  }
}

// ----------------------------------------------------------------
// POINTS PAGE — Spinning energy sphere
// ----------------------------------------------------------------
async function initPointsCanvas() {
  const canvas = document.getElementById('points-canvas');
  if (!canvas) return;

  try {
    const THREE = await import('three');

    const size = canvas.parentElement.offsetWidth || 280;
    canvas.width  = size;
    canvas.height = size;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 50);
    camera.position.z = 5;

    const geo = new THREE.IcosahedronGeometry(1.4, 2);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0B0F18'),
      emissive: new THREE.Color('#FF6B35'),
      emissiveIntensity: 0.12,
      metalness: 0.8, roughness: 0.15,
      transparent: true, opacity: 0.7,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    const wGeo = new THREE.IcosahedronGeometry(1.42, 2);
    const wMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd700'), wireframe: true, transparent: true, opacity: 0.1 });
    scene.add(new THREE.Mesh(wGeo, wMat));

    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const pl = new THREE.PointLight(0xFF6B35, 4, 10); pl.position.set(3, 2, 3); scene.add(pl);
    const pl2 = new THREE.PointLight(0xffd700, 2, 8); pl2.position.set(-2, -2, 2); scene.add(pl2);

    const clock = new THREE.Clock();
    function animatePoints() {
      const t = clock.getElapsedTime();
      mesh.rotation.y = t * 0.4;
      mesh.rotation.x = t * 0.15;
      pl.intensity = 4 + Math.sin(t * 2) * 1;
      requestAnimationFrame(animatePoints);
      renderer.render(scene, camera);
    }
    animatePoints();
  } catch (err) {
    console.warn('Points canvas init failed:', err);
  }
}

// ----------------------------------------------------------------
// SCROLL REVEAL
// ----------------------------------------------------------------
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observe(page) {
    page.querySelectorAll('[data-reveal], [data-reveal-children]').forEach(el => {
      observer.observe(el);
    });
  }

  document.querySelectorAll('.page').forEach(observe);

  // Re-observe on page switch
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      requestAnimationFrame(() => {
        const page = document.querySelector('.page.active');
        if (page) observe(page);
      });
    });
  });
}

// ----------------------------------------------------------------
// POLYMARKET — add sparkline mini-chart to each card
// ----------------------------------------------------------------
function drawSparkline(canvas, data, color) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H * 0.8 - H * 0.1
  }));

  // Fill
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, color + '40');
  grad.addColorStop(1, color + '00');
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

const sparklineData = {
  rising:  [40,44,42,48,51,49,55,60,58,65,70,68,75],
  falling: [80,76,74,70,68,65,60,58,52,48,45,42,38],
  flat:    [50,52,48,51,49,53,50,48,52,50,51,49,50],
};

function buildPolymarketCardsV4() {
  const grid = document.getElementById('polymarket-grid');
  if (!grid) return;

  grid.innerHTML = polymarketData.map((item, i) => {
    const trend = item.yes > 50 ? 'rising' : item.yes < 30 ? 'falling' : 'flat';
    const lineColor = trend === 'rising' ? '#00FFA3' : trend === 'falling' ? '#FF6B35' : '#94A3B8';
    const canvasId = `spark-${i}`;
    return `
      <div class="glass-card prediction-card" data-tilt>
        <div class="card-glow"></div>
        <div class="card-border-gradient"></div>
        <div class="card-content">
          <p class="prediction-title">${item.title}</p>
          <div class="prediction-bars">
            <div class="pred-bar-row">
              <span class="pred-label yes">Yes</span>
              <div class="pred-bar-track"><div class="pred-bar-fill yes" data-width="${item.yes}"></div></div>
              <span class="pred-percent yes">${item.yes}%</span>
            </div>
            <div class="pred-bar-row">
              <span class="pred-label no">No</span>
              <div class="pred-bar-track"><div class="pred-bar-fill no" data-width="${item.no}"></div></div>
              <span class="pred-percent no">${item.no}%</span>
            </div>
          </div>
          <canvas class="sparkline-canvas" id="${canvasId}" width="200" height="44" data-trend="${trend}" data-color="${lineColor}" style="width:100%;height:44px;display:block;margin-top:2px"></canvas>
          <div class="prediction-footer">
            <div class="pred-meta-row">
              <span class="pred-volume">${item.volume} <span>Vol.</span></span>
              <span class="pred-freq-badge">${item.freq}</span>
            </div>
            <button class="ask-raven-small">
              <i data-lucide="sparkles"></i>
              Ask Raven
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();

  // Draw sparklines
  requestAnimationFrame(() => {
    document.querySelectorAll('.sparkline-canvas').forEach(c => {
      const trend = c.dataset.trend;
      const color = c.dataset.color;
      // add small noise
      const base = [...sparklineData[trend]];
      const noisy = base.map(v => v + (Math.random() - 0.5) * 6);
      drawSparkline(c, noisy, color);
    });
  });
}

// ----------------------------------------------------------------
// PILL click interactions
// ----------------------------------------------------------------
function initPills() {
  document.querySelectorAll('.filter-pills').forEach(container => {
    container.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
    });
  });
}

// ----------------------------------------------------------------
// QUESTION CARD click — populate input
// ----------------------------------------------------------------
function initQuestionCards() {
  document.querySelectorAll('.question-card').forEach(card => {
    card.addEventListener('click', () => {
      const q = card.querySelector('.card-question')?.textContent?.trim();
      const input = document.getElementById('crypto-input');
      if (q && input) {
        input.value = q;
        input.focus();
        document.getElementById('ask')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });
}

// ----------------------------------------------------------------
// REGISTER ALL V4 INITS on DOMContentLoaded
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  buildTicker('ticker-track');
  buildTicker('ticker-track-poly');

  // Replace old polymarket builder with V4 version
  buildPolymarketCardsV4();

  initHeroCanvas();
  initScrollReveal();
  initPills();
  initQuestionCards();

  // Points canvas fires when points page is activated
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.page === 'points') {
        setTimeout(initPointsCanvas, 400);
      }
    });
  });
}, { once: true });
