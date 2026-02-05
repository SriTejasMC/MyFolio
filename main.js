import './style.css'
import { LiveWallpaper } from './wallpaper.js'
import { CustomCursor } from './cursor.js'

// Initialize core components once
const wallpaper = new LiveWallpaper();
const cursor = new CustomCursor();

document.addEventListener('DOMContentLoaded', () => {
    initScrollObserver();
    setupNavigation();
});

// Re-run this when content changes
function initScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.remove('hidden');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));
}

function setupNavigation() {
    // Intercept clicks on internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Check if it's an internal navigation
        if (href && (href.startsWith('/') || href.startsWith('.') || href.includes(window.location.hostname)) && !href.startsWith('#')) {
            e.preventDefault();
            navigateTo(href);
        }
    });

    // Handle Back/Forward buttons
    window.addEventListener('popstate', () => {
        navigateTo(window.location.pathname, false);
    });
}

async function navigateTo(url, pushState = true) {
    const main = document.querySelector('main');
    if (!main) return; // Safety check

    // 1. Exit Transition (Apply to BODY for full-screen blur)
    document.body.classList.add('page-transition-exit');

    try {
        // 2. Fetch new content (with cache-busting)
        const response = await fetch(`${url}?t=${Date.now()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const html = await response.text();

        // 3. Parse HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newMain = doc.querySelector('main');
        const newTitle = doc.querySelector('title');

        // Wait for exit animation to finish (at least partially)
        await new Promise(r => setTimeout(r, 150));

        // 4. Update DOM
        if (newMain) {
            main.innerHTML = newMain.innerHTML;

            // Re-initialize specific page scripts if needed?
            // Since we are replacing innerHTML, the modules like wallpaper persist (GOOD!)
            // But we need to re-attach scroll observers to new elements
            initScrollObserver();

            // Re-attach cursor hover effects to new buttons
            cursor.setupHoverEffects();
        }

        if (newTitle) {
            document.title = newTitle.innerText;
        }

        // 5. Update URL
        if (pushState) {
            history.pushState({}, '', url);
        }

        // 6. Enter Transition
        document.body.classList.remove('page-transition-exit');
        document.body.classList.add('page-transition-enter');

        // Force reflow
        void document.body.offsetWidth;

        document.body.classList.add('page-transition-enter-active');
        document.body.classList.remove('page-transition-enter');

        // Clean up classes after animation
        setTimeout(() => {
            document.body.classList.remove('page-transition-enter-active');
        }, 200);

    } catch (error) {
        console.error('Navigation failed:', error);
        // Fallback to standard navigation if something goes wrong
        window.location.href = url;
    }
}

// Initial Load Handling
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('preloader-hidden');
    }, 100);
});
