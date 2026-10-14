// ================================================================
// RAVEN AI — APP.JS
// Three.js background, GSAP animations, hash routing, interactions
// ================================================================

// ----------------------------------------------------------------
// POLYMARKET DATA
// ----------------------------------------------------------------
// Example questions only, all with deadlines after 2026-10-14. Live odds live at raven-agent.com/polymarket.
// Re-check the deadlines whenever this list is touched: a question that has closed should be swapped out.
const POLYMARKET_URL = 'https://www.raven-agent.com/polymarket';
const polymarketQuestions = [
  "Which party will win the House in 2026?",
  "Which party will win the Senate in 2026?",
  "How many Fed rate cuts in 2026?",
  "What price will Bitcoin hit in 2026?",
  "What price will Ethereum hit in 2026?",
  "Democratic Presidential Nominee 2028",
  "Republican Presidential Nominee 2028",
  "Presidential Election Winner 2028",
  "Russia x Ukraine ceasefire by end of 2026?",
  "Will China invade Taiwan by end of 2026?",
  "Xi Jinping out before 2027?",
  "English Premier League: 2027 Champion"
];

// ----------------------------------------------------------------
// INIT
// ----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) lucide.createIcons();

  // Initialize routing
  initRouter();

  // Initialize tabs
  initTabs();

  // Initialize interactions
  initTiltEffect();
  initNavIndicator();
  initMobileMenu();
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
  const children = page.querySelectorAll('.page-header, .tabs-container, .glass-card, .input-area, .upgrade-banner, .points-empty-state');

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
// LIVE TICKER — CoinGecko, hidden if the fetch fails (no fallback prices)
// ----------------------------------------------------------------
const TICKER_URL = 'https://api.coingecko.com/api/v3/simple/price'
  + '?ids=bitcoin,ethereum,solana,avalanche-2,polkadot,chainlink,uniswap,arbitrum,optimism'
  + '&vs_currencies=usd&include_24hr_change=true';
const TICKER_REFRESH_MS = 60000;
const TICKER_TIMEOUT_MS = 10000;
const TICKER_TRACK_IDS = ['ticker-track', 'ticker-track-poly'];
const TICKER_COINS = [
  { id: 'bitcoin',      sym: 'BTC' },
  { id: 'ethereum',     sym: 'ETH' },
  { id: 'solana',       sym: 'SOL' },
  { id: 'avalanche-2',  sym: 'AVAX' },
  { id: 'polkadot',     sym: 'DOT' },
  { id: 'chainlink',    sym: 'LINK' },
  { id: 'uniswap',      sym: 'UNI' },
  { id: 'arbitrum',     sym: 'ARB' },
  { id: 'optimism',     sym: 'OP' },
];

function formatTickerPrice(usd) {
  if (usd >= 1000) return '$' + usd.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (usd >= 1)    return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function formatTickerChange(pct) {
  return (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%';
}

// Turns the CoinGecko response into render-ready rows. Coins without a
// usable USD price are skipped, so a partial response shows only real data.
function parseTickerRows(data) {
  if (!data || typeof data !== 'object') return [];
  const rows = [];
  TICKER_COINS.forEach(({ id, sym }) => {
    const entry = data[id];
    const usd = entry && Number(entry.usd);
    if (!Number.isFinite(usd) || usd <= 0) return;
    const change = Number(entry.usd_24h_change);
    rows.push({
      sym,
      price: formatTickerPrice(usd),
      change: Number.isFinite(change) ? formatTickerChange(change) : '',
      up: !Number.isFinite(change) || change >= 0,
    });
  });
  return rows;
}

function buildTickerItem(row) {
  const item = document.createElement('span');
  item.className = 'ticker-item';
  item.dataset.sym = row.sym;

  const sym = document.createElement('span');
  sym.className = 'ticker-sym';
  sym.textContent = row.sym;

  const price = document.createElement('span');
  price.className = 'ticker-price';
  price.textContent = row.price;

  item.append(sym, price);

  if (row.change) {
    const change = document.createElement('span');
    change.className = 'ticker-change ' + (row.up ? 'ticker-up' : 'ticker-dn');
    change.textContent = row.change;
    item.append(change);
  }
  return item;
}

function setTickerVisible(visible) {
  TICKER_TRACK_IDS.forEach(id => {
    const track = document.getElementById(id);
    const ticker = track && track.closest('.ticker');
    if (ticker) ticker.hidden = !visible;
  });
}

function renderTicker(rows) {
  TICKER_TRACK_IDS.forEach(id => {
    const track = document.getElementById(id);
    if (!track) return;

    const current = Array.from(track.querySelectorAll('.ticker-item:not([aria-hidden])'));
    const sameSet = current.length === rows.length
      && current.every((el, i) => el.dataset.sym === rows[i].sym && !!el.querySelector('.ticker-change') === !!rows[i].change);

    if (sameSet) {
      // Same coins as the last refresh: update text in place so the scroll animation does not restart.
      track.querySelectorAll('.ticker-item').forEach(el => {
        const row = rows.find(r => r.sym === el.dataset.sym);
        el.querySelector('.ticker-price').textContent = row.price;
        const change = el.querySelector('.ticker-change');
        if (change) {
          change.textContent = row.change;
          change.className = 'ticker-change ' + (row.up ? 'ticker-up' : 'ticker-dn');
        }
      });
      return;
    }

    // Duplicate the set for a seamless loop.
    const items = rows.map(buildTickerItem);
    const copy = items.map(el => {
      const clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    });
    track.replaceChildren(...items, ...copy);
  });
}

async function refreshTicker() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TICKER_TIMEOUT_MS);
  try {
    const res = await fetch(TICKER_URL, { signal: controller.signal, headers: { accept: 'application/json' } });
    if (!res.ok) throw new Error('CoinGecko responded ' + res.status);
    const rows = parseTickerRows(await res.json());
    if (rows.length === 0) throw new Error('CoinGecko returned no prices');
    renderTicker(rows);
    setTickerVisible(true);
  } catch (err) {
    // No fallback prices: if the live data is not there, the ticker is not either.
    console.warn('Live ticker unavailable, hiding it:', err);
    setTickerVisible(false);
  } finally {
    clearTimeout(timer);
  }
}

function initLiveTicker() {
  refreshTicker();
  setInterval(refreshTicker, TICKER_REFRESH_MS);
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
// POLYMARKET — example questions, each linking to the live odds
// ----------------------------------------------------------------
function buildPolymarketCards() {
  const grid = document.getElementById('polymarket-grid');
  if (!grid) return;

  grid.replaceChildren(...polymarketQuestions.map(question => {
    const card = document.createElement('div');
    card.className = 'glass-card prediction-card';
    card.dataset.tilt = '';

    const title = document.createElement('p');
    title.className = 'prediction-title';
    title.textContent = question;

    const link = document.createElement('a');
    link.className = 'ask-raven-small';
    link.href = POLYMARKET_URL;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    const icon = document.createElement('i');
    icon.dataset.lucide = 'sparkles';
    link.append(icon, document.createTextNode(' Ask Raven'));

    const footer = document.createElement('div');
    footer.className = 'prediction-footer';
    footer.append(link);

    const content = document.createElement('div');
    content.className = 'card-content';
    content.append(title, footer);

    const glow = document.createElement('div');
    glow.className = 'card-glow';
    const border = document.createElement('div');
    border.className = 'card-border-gradient';

    card.append(glow, border, content);
    return card;
  }));

  if (window.lucide) lucide.createIcons();
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
  initLiveTicker();
  buildPolymarketCards();

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
