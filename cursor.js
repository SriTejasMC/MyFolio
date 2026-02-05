export class CustomCursor {
    constructor() {
        this.cursor = document.createElement('div');
        this.cursor.className = 'custom-cursor';

        this.follower = document.createElement('div');
        this.follower.className = 'cursor-follower';

        document.body.appendChild(this.cursor);
        document.body.appendChild(this.follower);

        this.posX = 0;
        this.posY = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
    }

    init() {
        console.log("Custom Cursor Initialized");
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Immediate update for the dot
            this.cursor.style.left = `${this.mouseX}px`;
            this.cursor.style.top = `${this.mouseY}px`;
        });

        const loop = () => {
            // Smooth follow for the ring
            this.posX += (this.mouseX - this.posX) / 9;
            this.posY += (this.mouseY - this.posY) / 9;

            this.follower.style.left = `${this.posX}px`;
            this.follower.style.top = `${this.posY}px`;

            requestAnimationFrame(loop);
        };
        loop();

        this.setupHoverEffects();
    }

    setupHoverEffects() {
        // Remove old listeners first (if any)
        const links = document.querySelectorAll('a, button, input, textarea, .project-card, .skill-card, .cta-button, .skill-tag');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.cursor.classList.add('active');
                this.follower.classList.add('active');
            });
            link.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('active');
                this.follower.classList.remove('active');
            });
        });
    }
}
