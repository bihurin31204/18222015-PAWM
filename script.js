document.addEventListener('DOMContentLoaded', () => {
    // Toggle Menu
    const menu = document.getElementById('menu');
    const navbar = document.querySelector('header .navbar');

    if (menu && navbar) {
        menu.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

    // Variabel global untuk menyimpan ID animasi
    let animationId;

    // Cek apakah di halaman topics
    const isTopicsPage = document.body.classList.contains('topics-page');

    if (isTopicsPage) {
        // Variabel untuk simulasi
        const cards = document.querySelectorAll('.card');
        const simulationContainer = document.getElementById('simulation-container');
        const simulationContent = document.getElementById('simulation-content');
        const topicSelection = document.getElementById('topic-selection');

        if (cards.length > 0 && simulationContainer && simulationContent && topicSelection) {
            // Event listener untuk kartu topik
            cards.forEach(card => {
                card.addEventListener('click', () => {
                    const topic = card.getAttribute('data-topic');
                    // Batalkan animasi yang sedang berjalan
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                    }
                    loadSimulation(topic);
                    topicSelection.classList.add('hidden');
                    simulationContainer.classList.remove('hidden');
                    simulationContainer.scrollIntoView({ behavior: 'smooth' });
                });
            });
        }

        function loadSimulation(topic) {
            // Batalkan animasi sebelumnya
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            // Muat simulasi berdasarkan topik
            switch (topic) {
                case 'projectile':
                    loadProjectileSimulation();
                    break;
                case 'pendulum':
                    loadPendulumSimulation();
                    break;
                case 'harmonic':
                    loadHarmonicSimulation();
                    break;
                case 'newton':
                    loadNewtonSimulation();
                    break;
                case 'thermodynamics':
                    loadThermodynamicsSimulation();
                    break;
                case 'optics':
                    loadOpticsSimulation();
                    break;
                case 'waves':
                    loadWavesSimulation();
                    break;
                default:
                    console.error('Topik tidak dikenali:', topic);
            }
        }

        // Fungsi Umum untuk Membuat Tombol Kontrol
        function createControlButtons() {
            return `
                <button id="start-btn" class="control-btn">Mulai Simulasi</button>
                <button id="pause-btn" class="control-btn" disabled>Jeda</button>
                <button id="reset-btn" class="control-btn">Reset</button>
            `;
        }

        // Simulasi Gerak Parabola
        function loadProjectileSimulation() {
            simulationContent.innerHTML = `
                <h2>Simulasi Gerak Parabola</h2>
                <div class="formula">
                    <h3>Persamaan Gerak Parabola:</h3>
                    <p>$$ y = x\\tan\\theta - \\frac{gx^2}{2v_0^2\\cos^2\\theta} $$</p>
                </div>
                <div class="controls">
                    <label for="angle">Sudut Peluncuran (°): <span id="angle-value">45</span>°</label>
                    <input type="range" id="angle" min="0" max="90" value="45">
                    <label for="velocity">Kecepatan Awal (m/s): <span id="velocity-value">20</span> m/s</label>
                    <input type="range" id="velocity" min="1" max="100" value="20">
                    ${createControlButtons()}
                </div>
                <canvas id="projectile-canvas" width="800" height="400"></canvas>
            `;
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }

            // Variabel untuk kontrol dan kanvas
            const angleSlider = document.getElementById('angle');
            const velocitySlider = document.getElementById('velocity');
            const angleValue = document.getElementById('angle-value');
            const velocityValue = document.getElementById('velocity-value');
            const startBtn = document.getElementById('start-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const resetBtn = document.getElementById('reset-btn');
            const canvas = document.getElementById('projectile-canvas');
            const ctx = canvas.getContext('2d');

            let isPaused = false;
            let trajectory = [];
            let lastTime = 0;

            // Update nilai tampilan saat slider berubah
            angleSlider.addEventListener('input', () => {
                angleValue.textContent = angleSlider.value;
            });

            velocitySlider.addEventListener('input', () => {
                velocityValue.textContent = velocitySlider.value;
            });

            startBtn.addEventListener('click', () => {
                // Batalkan animasi yang sedang berjalan
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                trajectory = [];
                isPaused = false;
                pauseBtn.textContent = 'Jeda';
                pauseBtn.disabled = false;
                simulateProjectile();
            });

            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Lanjut' : 'Jeda';
                if (!isPaused) {
                    lastTime = performance.now();
                    simulateProjectile();
                } else {
                    cancelAnimationFrame(animationId);
                }
            });

            resetBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                trajectory = [];
                pauseBtn.disabled = true;
                isPaused = false;
            });

            function simulateProjectile() {
                const angle = (Math.PI / 180) * angleSlider.value;
                const velocity = velocitySlider.value;
                const g = 9.8;
                const scale = 5;
                let time = 0;
                lastTime = performance.now();

                function draw(currentTime) {
                    if (isPaused) return;

                    const deltaTime = (currentTime - lastTime) / 1000;
                    lastTime = currentTime;
                    time += deltaTime;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const x = velocity * Math.cos(angle) * time;
                    const y = velocity * Math.sin(angle) * time - 0.5 * g * time * time;

                    trajectory.push({ x: x * scale, y: canvas.height - y * scale });

                    // Gambar lintasan
                    ctx.beginPath();
                    ctx.moveTo(trajectory[0].x, trajectory[0].y);
                    for (let i = 1; i < trajectory.length; i++) {
                        ctx.lineTo(trajectory[i].x, trajectory[i].y);
                    }
                    ctx.strokeStyle = 'blue';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Gambar proyektil
                    ctx.beginPath();
                    ctx.arc(x * scale, canvas.height - y * scale, 8, 0, 2 * Math.PI);
                    ctx.fillStyle = 'red';
                    ctx.fill();
                    ctx.strokeStyle = 'darkred';
                    ctx.stroke();

                    // Gambar tanah
                    ctx.fillStyle = 'green';
                    ctx.fillRect(0, canvas.height - 5, canvas.width, 5);

                    if (y >= 0) {
                        animationId = requestAnimationFrame(draw);
                    } else {
                        cancelAnimationFrame(animationId);
                        pauseBtn.disabled = true;
                    }
                }

                animationId = requestAnimationFrame(draw);
            }
        }

        // Simulasi Bandul Sederhana
        function loadPendulumSimulation() {
            simulationContent.innerHTML = `
                <h2>Simulasi Bandul Sederhana</h2>
                <div class="formula">
                    <h3>Periode Bandul Sederhana:</h3>
                    <p>$$ T = 2\\pi\\sqrt{\\frac{L}{g}} $$</p>
                </div>
                <div class="controls">
                    <label for="length">Panjang Tali (m): <span id="length-value">2</span> m</label>
                    <input type="range" id="length" min="0.5" max="5" step="0.1" value="2">
                    ${createControlButtons()}
                </div>
                <canvas id="pendulum-canvas" width="400" height="400"></canvas>
            `;
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }

            const lengthSlider = document.getElementById('length');
            const lengthValue = document.getElementById('length-value');
            const startBtn = document.getElementById('start-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const resetBtn = document.getElementById('reset-btn');
            const canvas = document.getElementById('pendulum-canvas');
            const ctx = canvas.getContext('2d');

            let isPaused = false;
            let lastTime = 0;

            lengthSlider.addEventListener('input', () => {
                lengthValue.textContent = lengthSlider.value;
            });

            startBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                isPaused = false;
                pauseBtn.textContent = 'Jeda';
                pauseBtn.disabled = false;
                simulatePendulum();
            });

            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Lanjut' : 'Jeda';
                if (!isPaused) {
                    lastTime = performance.now();
                    simulatePendulum();
                } else {
                    cancelAnimationFrame(animationId);
                }
            });

            resetBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                isPaused = false;
                pauseBtn.disabled = true;
            });

            function simulatePendulum() {
                const L = lengthSlider.value * 100; // Konversi ke piksel
                const g = 9.8;
                const angle0 = Math.PI / 4; // 45 derajat
                const omega = Math.sqrt(g / (L / 100));
                let time = 0;
                lastTime = performance.now();

                function draw(currentTime) {
                    if (isPaused) return;

                    const deltaTime = (currentTime - lastTime) / 1000;
                    lastTime = currentTime;
                    time += deltaTime;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const angle = angle0 * Math.cos(omega * time);
                    const x = canvas.width / 2 + L * Math.sin(angle);
                    const y = 50 + L * Math.cos(angle);

                    // Gambar tali
                    ctx.beginPath();
                    ctx.moveTo(canvas.width / 2, 50);
                    ctx.lineTo(x, y);
                    ctx.strokeStyle = '#555';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Gambar bobot
                    ctx.beginPath();
                    ctx.arc(x, y, 15, 0, 2 * Math.PI);
                    const gradient = ctx.createRadialGradient(x, y, 5, x, y, 15);
                    gradient.addColorStop(0, '#ffcc00');
                    gradient.addColorStop(1, '#cc6600');
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    ctx.strokeStyle = '#993300';
                    ctx.stroke();

                    // Gambar titik gantung
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, 50, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = '#000';
                    ctx.fill();

                    animationId = requestAnimationFrame(draw);
                }

                animationId = requestAnimationFrame(draw);
            }
        }

        // Simulasi Gerak Harmonik Sederhana
        function loadHarmonicSimulation() {
            simulationContent.innerHTML = `
                <h2>Simulasi Gerak Harmonik Sederhana</h2>
                <div class="formula">
                    <h3>Persamaan Gerak Harmonik:</h3>
                    <p>$$ x(t) = A\\cos(\\omega t + \\phi) $$</p>
                </div>
                <div class="controls">
                    <label for="amplitude">Amplitudo (m): <span id="amplitude-value">1</span> m</label>
                    <input type="range" id="amplitude" min="0.5" max="5" step="0.1" value="1">
                    <label for="frequency">Frekuensi (Hz): <span id="frequency-value">1</span> Hz</label>
                    <input type="range" id="frequency" min="0.5" max="5" step="0.1" value="1">
                    ${createControlButtons()}
                </div>
                <canvas id="harmonic-canvas" width="800" height="300"></canvas>
            `;
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }

            const amplitudeSlider = document.getElementById('amplitude');
            const frequencySlider = document.getElementById('frequency');
            const amplitudeValue = document.getElementById('amplitude-value');
            const frequencyValue = document.getElementById('frequency-value');
            const startBtn = document.getElementById('start-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const resetBtn = document.getElementById('reset-btn');
            const canvas = document.getElementById('harmonic-canvas');
            const ctx = canvas.getContext('2d');

            let isPaused = false;
            let path = [];
            let lastTime = 0;

            amplitudeSlider.addEventListener('input', () => {
                amplitudeValue.textContent = amplitudeSlider.value;
            });

            frequencySlider.addEventListener('input', () => {
                frequencyValue.textContent = frequencySlider.value;
            });

            startBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                path = [];
                isPaused = false;
                pauseBtn.textContent = 'Jeda';
                pauseBtn.disabled = false;
                simulateHarmonicMotion();
            });

            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Lanjut' : 'Jeda';
                if (!isPaused) {
                    lastTime = performance.now();
                    simulateHarmonicMotion();
                } else {
                    cancelAnimationFrame(animationId);
                }
            });

            resetBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                path = [];
                isPaused = false;
                pauseBtn.disabled = true;
            });

            function simulateHarmonicMotion() {
                const A = amplitudeSlider.value * 50; // Faktor skala
                const f = frequencySlider.value;
                const omega = 2 * Math.PI * f;
                let time = 0;
                lastTime = performance.now();

                function draw(currentTime) {
                    if (isPaused) return;

                    const deltaTime = (currentTime - lastTime) / 1000;
                    lastTime = currentTime;
                    time += deltaTime;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    const x = canvas.width / 2 + A * Math.cos(omega * time);
                    const y = canvas.height / 2;

                    path.push({ x: x, y: y });

                    // Batasi panjang lintasan
                    if (path.length > 1000) {
                        path.shift();
                    }

                    // Gambar lintasan
                    ctx.beginPath();
                    for (let i = 0; i < path.length; i++) {
                        ctx.lineTo(path[i].x, path[i].y);
                    }
                    ctx.strokeStyle = 'lightgray';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Gambar pegas
                    ctx.beginPath();
                    const springStart = canvas.width / 2 - 200;
                    const springEnd = x - 20;
                    const springY = y;
                    const coils = 20;
                    const coilWidth = (springEnd - springStart) / coils;
                    ctx.moveTo(springStart, springY);
                    for (let i = 0; i < coils; i++) {
                        const x1 = springStart + i * coilWidth;
                        const x2 = x1 + coilWidth / 2;
                        const y1 = springY + (i % 2 === 0 ? -10 : 10);
                        ctx.quadraticCurveTo(x1 + coilWidth / 4, y1, x2, springY);
                    }
                    ctx.strokeStyle = '#888';
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Gambar objek
                    ctx.beginPath();
                    ctx.rect(x - 20, y - 20, 40, 40);
                    const gradient = ctx.createLinearGradient(x - 20, y - 20, x + 20, y + 20);
                    gradient.addColorStop(0, '#66ccff');
                    gradient.addColorStop(1, '#006699');
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    ctx.strokeStyle = '#004466';
                    ctx.stroke();

                    animationId = requestAnimationFrame(draw);
                }

                animationId = requestAnimationFrame(draw);
            }
        }

        // Simulasi Hukum Newton
        function loadNewtonSimulation() {
            simulationContent.innerHTML = `
                <h2>Simulasi Hukum Newton</h2>
                <div class="formula">
                    <h3>Hukum II Newton:</h3>
                    <p>$$ F = m \\times a $$</p>
                </div>
                <div class="controls">
                    <label for="mass">Massa (kg): <span id="mass-value">1</span> kg</label>
                    <input type="range" id="mass" min="1" max="10" value="1">
                    <label for="force">Gaya (N): <span id="force-value">10</span> N</label>
                    <input type="range" id="force" min="1" max="100" value="10">
                    ${createControlButtons()}
                </div>
                <canvas id="newton-canvas" width="800" height="300"></canvas>
            `;
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }

            const massSlider = document.getElementById('mass');
            const forceSlider = document.getElementById('force');
            const massValue = document.getElementById('mass-value');
            const forceValue = document.getElementById('force-value');
            const startBtn = document.getElementById('start-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const resetBtn = document.getElementById('reset-btn');
            const canvas = document.getElementById('newton-canvas');
            const ctx = canvas.getContext('2d');

            let isPaused = false;
            let lastTime = 0;

            massSlider.addEventListener('input', () => {
                massValue.textContent = massSlider.value;
            });

            forceSlider.addEventListener('input', () => {
                forceValue.textContent = forceSlider.value;
            });

            startBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                isPaused = false;
                pauseBtn.textContent = 'Jeda';
                pauseBtn.disabled = false;
                simulateNewton();
            });

            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Lanjut' : 'Jeda';
                if (!isPaused) {
                    lastTime = performance.now();
                    simulateNewton();
                } else {
                    cancelAnimationFrame(animationId);
                }
            });

            resetBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                isPaused = false;
                pauseBtn.disabled = true;
            });

            function simulateNewton() {
                const m = parseFloat(massSlider.value);
                const F = parseFloat(forceSlider.value);
                const a = F / m;
                let x = 0;
                let v = 0;
                lastTime = performance.now();

                function draw(currentTime) {
                    if (isPaused) return;

                    const deltaTime = (currentTime - lastTime) / 1000;
                    lastTime = currentTime;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Gambar lantai
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height / 2 + 50);
                    ctx.lineTo(canvas.width, canvas.height / 2 + 50);
                    ctx.strokeStyle = 'gray';
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Gambar objek
                    ctx.fillStyle = '#FFA500';
                    ctx.fillRect(x, canvas.height / 2 - 50, 100, 100);
                    ctx.strokeStyle = '#CC8400';
                    ctx.strokeRect(x, canvas.height / 2 - 50, 100, 100);

                    // Gambar gaya
                    ctx.beginPath();
                    ctx.moveTo(x + 100, canvas.height / 2);
                    ctx.lineTo(x + 100 + F, canvas.height / 2);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 3;
                    ctx.stroke();

                    // Panah gaya
                    ctx.beginPath();
                    ctx.moveTo(x + 100 + F, canvas.height / 2);
                    ctx.lineTo(x + 100 + F - 10, canvas.height / 2 - 5);
                    ctx.lineTo(x + 100 + F - 10, canvas.height / 2 + 5);
                    ctx.closePath();
                    ctx.fillStyle = 'red';
                    ctx.fill();

                    v += a * deltaTime;
                    x += v * deltaTime * 50; // Skala posisi

                    if (x + 100 < canvas.width) {
                        animationId = requestAnimationFrame(draw);
                    } else {
                        cancelAnimationFrame(animationId);
                        pauseBtn.disabled = true;
                    }
                }

                animationId = requestAnimationFrame(draw);
            }
        }

        // Simulasi Hukum Termodinamika
        function loadThermodynamicsSimulation() {
            simulationContent.innerHTML = `
                <h2>Simulasi Hukum Termodinamika</h2>
                <div class="formula">
                    <h3>Persamaan Gas Ideal:</h3>
                    <p>$$ PV = nRT $$</p>
                </div>
                <div class="controls">
                    <label for="temperature">Temperatur (K): <span id="temperature-value">300</span> K</label>
                    <input type="range" id="temperature" min="100" max="500" value="300">
                    ${createControlButtons()}
                </div>
                <canvas id="thermo-canvas" width="600" height="400"></canvas>
            `;
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }

            const temperatureSlider = document.getElementById('temperature');
            const temperatureValue = document.getElementById('temperature-value');
            const startBtn = document.getElementById('start-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const resetBtn = document.getElementById('reset-btn');
            const canvas = document.getElementById('thermo-canvas');
            const ctx = canvas.getContext('2d');

            let particles = [];
            const particleCount = 100;
            let isPaused = false;
            let lastTime = 0;

            temperatureSlider.addEventListener('input', () => {
                temperatureValue.textContent = temperatureSlider.value;
            });

            startBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                particles = [];
                isPaused = false;
                pauseBtn.textContent = 'Jeda';
                pauseBtn.disabled = false;
                for (let i = 0; i < particleCount; i++) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        vx: (Math.random() - 0.5) * temperatureSlider.value / 50,
                        vy: (Math.random() - 0.5) * temperatureSlider.value / 50,
                        color: getRandomColor()
                    });
                }
                simulateThermodynamics();
            });

            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Lanjut' : 'Jeda';
                if (!isPaused) {
                    lastTime = performance.now();
                    simulateThermodynamics();
                } else {
                    cancelAnimationFrame(animationId);
                }
            });

            resetBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles = [];
                isPaused = false;
                pauseBtn.disabled = true;
            });

            function getRandomColor() {
                const colors = ['red', 'green', 'blue', 'orange', 'purple'];
                return colors[Math.floor(Math.random() * colors.length)];
            }

            function simulateThermodynamics() {
                lastTime = performance.now();

                function draw(currentTime) {
                    if (isPaused) return;

                    const deltaTime = (currentTime - lastTime) / 1000;
                    lastTime = currentTime;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Gambar wadah
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, canvas.width, canvas.height);

                    particles.forEach(p => {
                        p.x += p.vx * deltaTime * 60;
                        p.y += p.vy * deltaTime * 60;

                        if (p.x <= 5 || p.x >= canvas.width - 5) p.vx *= -1;
                        if (p.y <= 5 || p.y >= canvas.height - 5) p.vy *= -1;

                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
                        ctx.fillStyle = p.color;
                        ctx.fill();
                    });

                    animationId = requestAnimationFrame(draw);
                }

                animationId = requestAnimationFrame(draw);
            }
        }

        // Simulasi Optika Geometris
        function loadOpticsSimulation() {
            simulationContent.innerHTML = `
                <h2>Simulasi Optika Geometris</h2>
                <div class="formula">
                    <h3>Persamaan Lensa Tipis:</h3>
                    <p>$$ \\frac{1}{f} = \\frac{1}{o} + \\frac{1}{i} $$</p>
                </div>
                <div class="controls">
                    <label for="object-distance">Jarak Benda (cm): <span id="object-distance-value">20</span> cm</label>
                    <input type="range" id="object-distance" min="10" max="100" value="20">
                    <label for="focal-length">Jarak Fokus (cm): <span id="focal-length-value">15</span> cm</label>
                    <input type="range" id="focal-length" min="5" max="50" value="15">
                    <button id="start-btn">Tampilkan Simulasi</button>
                </div>
                <canvas id="optics-canvas" width="800" height="400"></canvas>
            `;
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }

            const objectDistanceSlider = document.getElementById('object-distance');
            const focalLengthSlider = document.getElementById('focal-length');
            const objectDistanceValue = document.getElementById('object-distance-value');
            const focalLengthValue = document.getElementById('focal-length-value');
            const startBtn = document.getElementById('start-btn');
            const canvas = document.getElementById('optics-canvas');
            const ctx = canvas.getContext('2d');

            objectDistanceSlider.addEventListener('input', () => {
                objectDistanceValue.textContent = objectDistanceSlider.value;
            });

            focalLengthSlider.addEventListener('input', () => {
                focalLengthValue.textContent = focalLengthSlider.value;
            });

            startBtn.addEventListener('click', () => {
                simulateOptics();
            });

            function simulateOptics() {
                const o = parseFloat(objectDistanceSlider.value);
                const f = parseFloat(focalLengthSlider.value);
                const i = (f * o) / (o - f);

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Skala gambar
                const scale = 5;

                // Gambar sumbu optik
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2);
                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.strokeStyle = 'gray';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Gambar lensa
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, canvas.height / 2 - 100);
                ctx.quadraticCurveTo(canvas.width / 2 + 20, canvas.height / 2, canvas.width / 2, canvas.height / 2 + 100);
                ctx.moveTo(canvas.width / 2, canvas.height / 2 - 100);
                ctx.quadraticCurveTo(canvas.width / 2 - 20, canvas.height / 2, canvas.width / 2, canvas.height / 2 + 100);
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Gambar benda
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2 - o * scale, canvas.height / 2);
                ctx.lineTo(canvas.width / 2 - o * scale, canvas.height / 2 - 80);
                ctx.strokeStyle = 'blue';
                ctx.lineWidth = 3;
                ctx.stroke();

                // Gambar bayangan
                let isRealImage = true;
                if (i > 0) {
                    ctx.beginPath();
                    ctx.moveTo(canvas.width / 2 + i * scale, canvas.height / 2);
                    ctx.lineTo(canvas.width / 2 + i * scale, canvas.height / 2 - (i / o) * 80);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 3;
                    ctx.stroke();
                } else {
                    isRealImage = false;
                    ctx.beginPath();
                    ctx.moveTo(canvas.width / 2 + i * scale, canvas.height / 2);
                    ctx.lineTo(canvas.width / 2 + i * scale, canvas.height / 2 - (i / o) * 80);
                    ctx.strokeStyle = 'red';
                    ctx.lineWidth = 3;
                    ctx.setLineDash([5, 5]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }

                // Gambar sinar-sinar utama
                drawRays(o, f, i, scale, isRealImage);
            }

            function drawRays(o, f, i, scale, isRealImage) {
                const xObject = canvas.width / 2 - o * scale;
                const yObjectTop = canvas.height / 2 - 80;
                const xLens = canvas.width / 2;
                const xImage = canvas.width / 2 + i * scale;
                const yImageTop = canvas.height / 2 - (i / o) * 80;

                // Sinar sejajar sumbu utama
                ctx.beginPath();
                ctx.moveTo(xObject, yObjectTop);
                ctx.lineTo(xLens, yObjectTop);
                ctx.strokeStyle = 'orange';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Dari lensa melalui titik fokus
                ctx.beginPath();
                ctx.moveTo(xLens, yObjectTop);
                if (isRealImage) {
                    ctx.lineTo(xImage, canvas.height / 2);
                } else {
                    ctx.lineTo(xLens + f * scale, canvas.height / 2);
                    ctx.setLineDash([5, 5]);
                    ctx.lineTo(xImage, yImageTop);
                    ctx.setLineDash([]);
                }
                ctx.strokeStyle = 'orange';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Sinar melalui pusat optik
                ctx.beginPath();
                ctx.moveTo(xObject, yObjectTop);
                ctx.lineTo(xImage, yImageTop);
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }

        // Simulasi Gelombang dan Bunyi
        function loadWavesSimulation() {
            simulationContent.innerHTML = `
                <h2>Simulasi Gelombang dan Bunyi</h2>
                <div class="formula">
                    <h3>Persamaan Gelombang:</h3>
                    <p>$$ y(x, t) = A \\sin(kx - \\omega t) $$</p>
                </div>
                <div class="controls">
                    <label for="wave-amplitude">Amplitudo (m): <span id="wave-amplitude-value">1</span> m</label>
                    <input type="range" id="wave-amplitude" min="0.5" max="5" step="0.1" value="1">
                    <label for="wave-frequency">Frekuensi (Hz): <span id="wave-frequency-value">1</span> Hz</label>
                    <input type="range" id="wave-frequency" min="0.5" max="5" step="0.1" value="1">
                    ${createControlButtons()}
                </div>
                <canvas id="waves-canvas" width="800" height="400"></canvas>
            `;
            if (typeof MathJax !== 'undefined') {
                MathJax.typeset();
            }

            const amplitudeSlider = document.getElementById('wave-amplitude');
            const frequencySlider = document.getElementById('wave-frequency');
            const amplitudeValue = document.getElementById('wave-amplitude-value');
            const frequencyValue = document.getElementById('wave-frequency-value');
            const startBtn = document.getElementById('start-btn');
            const pauseBtn = document.getElementById('pause-btn');
            const resetBtn = document.getElementById('reset-btn');
            const canvas = document.getElementById('waves-canvas');
            const ctx = canvas.getContext('2d');

            let isPaused = false;
            let lastTime = 0;

            amplitudeSlider.addEventListener('input', () => {
                amplitudeValue.textContent = amplitudeSlider.value;
            });

            frequencySlider.addEventListener('input', () => {
                frequencyValue.textContent = frequencySlider.value;
            });

            startBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                isPaused = false;
                pauseBtn.textContent = 'Jeda';
                pauseBtn.disabled = false;
                simulateWaves();
            });

            pauseBtn.addEventListener('click', () => {
                isPaused = !isPaused;
                pauseBtn.textContent = isPaused ? 'Lanjut' : 'Jeda';
                if (!isPaused) {
                    lastTime = performance.now();
                    simulateWaves();
                } else {
                    cancelAnimationFrame(animationId);
                }
            });

            resetBtn.addEventListener('click', () => {
                if (animationId) {
                    cancelAnimationFrame(animationId);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                isPaused = false;
                pauseBtn.disabled = true;
            });

            function simulateWaves() {
                const A = amplitudeSlider.value * 50;
                const f = frequencySlider.value;
                const omega = 2 * Math.PI * f;
                const k = 2 * Math.PI / 100; // Panjang gelombang disesuaikan
                let time = 0;
                lastTime = performance.now();

                function draw(currentTime) {
                    if (isPaused) return;

                    const deltaTime = (currentTime - lastTime) / 1000;
                    lastTime = currentTime;
                    time += deltaTime;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Gambar sumbu x
                    ctx.beginPath();
                    ctx.moveTo(0, canvas.height / 2);
                    ctx.lineTo(canvas.width, canvas.height / 2);
                    ctx.strokeStyle = 'gray';
                    ctx.stroke();

                    ctx.beginPath();
                    for (let x = 0; x < canvas.width; x++) {
                        const y = canvas.height / 2 + A * Math.sin(k * x - omega * time);
                        if (x === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
                    gradient.addColorStop(0, '#00f');
                    gradient.addColorStop(1, '#f00');
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    animationId = requestAnimationFrame(draw);
                }

                animationId = requestAnimationFrame(draw);
            }
        }
    }
});
