/* ===================================================
   TYPING ANIMATION
=================================================== */

const roles = [
    'Software Engineer',
    'DevOps Engineer',
    'Cloud Architect',
    'SRE in Progress'
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typingSpeed = 100;
const deletingSpeed = 50;
const delayBetweenRoles = 2000;

function typeRoles() {
    const typingElement = document.getElementById('typing-text');
    
    // Make sure element exists
    if (!typingElement) {
        console.error('Typing element not found');
        return;
    }

    const currentRole = roles[roleIndex];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    typingElement.textContent = currentRole.substring(0, charIndex);

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(typeRoles, delayBetweenRoles);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeRoles, 500);
    } else {
        setTimeout(typeRoles, isDeleting ? deletingSpeed : typingSpeed);
    }
}

// Start typing animation when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', typeRoles);
} else {
    typeRoles();
}

/* ===================================================
   FETCH GITHUB PROJECTS
=================================================== */

const GITHUB_USERNAME = 'Ashikur14r';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`;

async function fetchGitHubProjects() {
    const projectsContainer = document.getElementById('projects-container');

    if (!projectsContainer) {
        console.error('Projects container not found');
        return;
    }

    try {
        const response = await fetch(GITHUB_API_URL);
        
        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();

        if (!Array.isArray(projects) || projects.length === 0) {
            projectsContainer.innerHTML = `
                <div class="loading-message" style="grid-column: 1 / -1;">
                    <p>No projects found yet. Check back soon!</p>
                </div>
            `;
            return;
        }

        projectsContainer.innerHTML = '';

        projects.forEach(project => {
            const projectCard = createProjectCard(project);
            projectsContainer.appendChild(projectCard);
        });

    } catch (error) {
        console.error('Error fetching projects:', error);
        projectsContainer.innerHTML = `
            <div class="loading-message" style="grid-column: 1 / -1;">
                <p>Unable to load projects at the moment. Please try again later.</p>
            </div>
        `;
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Create banner with language-based colors
    const bannerColor = getBannerColor(project.language);
    const bannerHTML = `
        <div class="project-banner" style="background: ${bannerColor}">
            <i class="fas fa-${getIconForLanguage(project.language)}"></i>
        </div>
    `;

    // Create language tags
    const languagesHTML = project.language ? `
        <div class="project-languages">
            <span class="language-tag">${project.language}</span>
        </div>
    ` : '';

    // Create project footer with stats and links
    const projectFooterHTML = `
        <div class="project-footer">
            <div class="project-stats">
                <div class="project-stat">
                    <i class="fas fa-star"></i>
                    <span>${project.stargazers_count}</span>
                </div>
                <div class="project-stat">
                    <i class="fas fa-code-branch"></i>
                    <span>${project.forks_count}</span>
                </div>
            </div>
            <div class="project-links">
                <a href="${project.html_url}" target="_blank" class="project-link" title="View on GitHub">
                    <i class="fab fa-github"></i>
                </a>
                ${project.homepage ? `
                    <a href="${project.homepage}" target="_blank" class="project-link" title="Live Demo">
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                ` : ''}
            </div>
        </div>
    `;

    // Combine all HTML
    card.innerHTML = `
        ${bannerHTML}
        <div class="project-content">
            <div class="project-title">${escapeHtml(project.name)}</div>
            <div class="project-description">
                ${project.description ? escapeHtml(project.description) : 'No description available'}
            </div>
            ${languagesHTML}
            ${projectFooterHTML}
        </div>
    `;

    return card;
}

function getBannerColor(language) {
    const colors = {
        'JavaScript': 'linear-gradient(135deg, #f7df1e, #f1e05a)',
        'TypeScript': 'linear-gradient(135deg, #3178c6, #2d79c7)',
        'Python': 'linear-gradient(135deg, #3776ab, #306998)',
        'PHP': 'linear-gradient(135deg, #777bb4, #4b5ba0)',
        'HTML': 'linear-gradient(135deg, #e34c26, #f16529)',
        'CSS': 'linear-gradient(135deg, #563d7c, #2965f1)',
        'Java': 'linear-gradient(135deg, #007396, #f89820)',
        'C++': 'linear-gradient(135deg, #00599c, #004482)',
        'Go': 'linear-gradient(135deg, #00add8, #006a9e)',
        'Rust': 'linear-gradient(135deg, #ce422b, #a84a2a)',
        'Ruby': 'linear-gradient(135deg, #cc342d, #701516)',
        'Shell': 'linear-gradient(135deg, #4eaa25, #5a9a3c)',
    };

    return colors[language] || 'linear-gradient(135deg, #0066cc, #058b9f)';
}

function getIconForLanguage(language) {
    const icons = {
        'JavaScript': 'js',
        'TypeScript': 'js',
        'Python': 'python',
        'PHP': 'php',
        'HTML': 'html5',
        'CSS': 'css3',
        'Java': 'java',
        'C++': 'c',
        'Go': 'golang',
        'Rust': 'rust',
        'Ruby': 'gem',
        'Shell': 'terminal',
    };

    return icons[language] || 'code';
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/* ===================================================
   SMOOTH SCROLL ACTIVE NAVBAR LINK
=================================================== */

function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar a');

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ===================================================
   ADD ACTIVE NAV STYLE
=================================================== */

function addActiveNavStyle() {
    const style = document.createElement('style');
    style.textContent = `
        .navbar a.active {
            color: var(--primary-color) !important;
        }

        .navbar a.active::after {
            width: 100% !important;
        }
    `;
    document.head.appendChild(style);
}

/* ===================================================
   SMOOTH SCROLLING FOR NAVIGATION LINKS
=================================================== */

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* ===================================================
   ANIMATE ELEMENTS ON SCROLL
=================================================== */

function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll(
        '.skill-card, .cert-card, .project-card, .info-box'
    );

    elements.forEach(element => {
        observer.observe(element);
    });
}

/* ===================================================
   ADD SCROLL ANIMATION STYLES
=================================================== */

function addScrollAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(40px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .skill-card,
        .cert-card,
        .project-card,
        .info-box {
            opacity: 0;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .fa-spinner {
            animation: spin 2s linear infinite !important;
        }
    `;
    document.head.appendChild(style);
}

/* ===================================================
   SCROLL TO TOP BUTTON
=================================================== */

function setupScrollToTop() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 999;
        transition: all 0.3s ease;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
    `;

    document.body.appendChild(scrollTopBtn);

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    scrollTopBtn.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-5px)';
    });

    scrollTopBtn.addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
    });
}

/* ===================================================
   INITIALIZE ALL FUNCTIONS
=================================================== */

function initializePortfolio() {
    console.log('🚀 Initializing portfolio...');
    
    addActiveNavStyle();
    highlightActiveNavLink();
    setupSmoothScroll();
    addScrollAnimationStyles();
    observeElements();
    setupScrollToTop();
    fetchGitHubProjects();
    
    console.log('✅ Portfolio initialized successfully!');
}

// Check if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    initializePortfolio();
}

/* ===================================================
   LOG MESSAGE
=================================================== */

console.log('%cWelcome to Ashikur Rahman\'s Portfolio! 👋', 'color: #0066cc; font-size: 16px; font-weight: bold;');
console.log('%cFeel free to check out my GitHub and LinkedIn!', 'color: #058b9f; font-size: 14px;');