export class LiveWallpaper {
    constructor() {
        this.canvas = document.getElementById('wallpaper');

        // HDR Support Check
        this.isHDR = window.matchMedia('(color-gamut: p3)').matches;
        this.ctx = this.canvas.getContext('2d', {
            colorSpace: this.isHDR ? 'display-p3' : 'srgb',
            alpha: false
        }); // alpha: false for performance if opaque, but we need transparency? 
        // Wait, canvas is fixed position, likely needs transparency if overlaying. 
        // Correct, stick to defaults but add colorSpace.
        // Actually, re-initializing context might need care if not supported, but browsers ignore unknown options.
        // Let's be safe.

        this.ctx = this.canvas.getContext('2d', { colorSpace: this.isHDR ? 'display-p3' : 'srgb' });

        this.particles = [];
        this.particleCount = 100; // Adjustable
        this.connectionDistance = 150;
        this.mouse = { x: null, y: null, radius: 200 };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        // Populate particles
        this.createParticles();
        this.animate();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;

        this.ctx.scale(dpr, dpr);

        // Re-create particles on significant resize if needed, or just let them be
        if (this.particles.length === 0) this.createParticles();
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5, // Velocity X
                vy: (Math.random() - 0.5) * 0.5, // Velocity Y
                size: Math.random() * 2 + 1
            });
        }
    }

    drawLines(p1) {
        for (let p2 of this.particles) {
            let dx = p1.x - p2.x;
            let dy = p1.y - p2.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.connectionDistance) {
                let opacity = 1 - (distance / this.connectionDistance);

                // Cyan Color: Standard vs P3
                if (this.isHDR) {
                    // P3 Cyan: More vibrant
                    this.ctx.strokeStyle = `color(display-p3 0 1 1 / ${opacity * 0.2})`;
                } else {
                    this.ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.2})`;
                }

                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(p1.x, p1.y);
                this.ctx.lineTo(p2.x, p2.y);
                this.ctx.stroke();
            }
        }
    }

    update() {
        for (let p of this.particles) {
            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce off edges
            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;

            // Mouse Interaction
            if (this.mouse.x != null) {
                let dx = this.mouse.x - p.x;
                let dy = this.mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const directionX = forceDirectionX * force * 3; // Push strength
                    const directionY = forceDirectionY * force * 3;

                    p.x -= directionX;
                    p.y -= directionY;
                }
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

            // Purple Color: Standard vs P3
            if (this.isHDR) {
                // P3 Purple: Deeper, more saturated
                this.ctx.fillStyle = 'color(display-p3 0.7 0.1 1)';
            } else {
                this.ctx.fillStyle = '#bc13fe';
            }

            this.ctx.fill();

            // Connect
            this.drawLines(p);
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.update();
        requestAnimationFrame(() => this.animate());
    }
}
