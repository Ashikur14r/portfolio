/* =========================================================
   SETTINGS
========================================================= */

const GITHUB_USERNAME = "Ashikur14r";
const PROJECT_LIMIT = 6;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

const FEATURED_PROJECT = {
    name: "CampusOS",
    context: "CPCCU AI Web App Hackathon",
    description:
        "A responsive student portal that brings campus clubs and events, academic resources, helpdesk support, and lost-and-found reports into one place. Students can search and filter content, explore campus listings, and try demo workflows in Guest Mode.",
    language: "TypeScript",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase"],
    repoUrl: "https://github.com/cpccu/Intellix",
    demoUrl: "https://intellix-psi.vercel.app",
    bannerUrl: ""
};

const PROJECT_DESCRIPTION_OVERRIDES = {
    "ashikur14r/portfolio":
        "Personal portfolio website showcasing my DevOps and cloud engineering journey, skills, certifications, and hands-on projects. Built with HTML, CSS, and JavaScript.",
    "ashikur14r/ashikur14r":
        "GitHub profile README introducing my DevOps and cloud engineering journey, technical skills, certifications, learning progress, and career goals.",
    "ashikur14r/dld-midterm-preparation-":
        "Interactive Digital Logic Design midterm study guide covering number systems, complements, logic gates, Boolean algebra, SOP/POS, K-maps, and adders, with worked examples, exam questions, and interactive calculators and simulations.",
    "ashikur14r/strict-sample-landing-page":
        "Responsive landing page built with HTML and CSS, featuring a clean hero section, feature highlights, image gallery, contact form, and footer.",
    "ashikur14r/guess-the-number-c":
        "Console-based number guessing game written in C, with random number generation, unlimited attempts, hints, and an attempt counter."
};

const GITHUB_API_URL =
    `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos` +
    `?type=owner&sort=updated&direction=desc&per_page=100`;

/*
 * Local fallback projects from your original portfolio.
 * Add each project's real URLs below when you have them.
 * Leave a URL blank to hide that link.
 */
const FALLBACK_PROJECTS = [
    FEATURED_PROJECT,
    {
        name: "TrustChain",
        description:
            "A digital transaction evidence platform designed to make second-hand electronics transactions more transparent and trustworthy.",
        language: "PHP",
        technologies: ["Laravel", "PHP", "MySQL", "Blade"],
        repoUrl: "",
        demoUrl: "",
        bannerUrl: ""
    },
    {
        name: "Birthday Surprise",
        description:
            "A small interactive website created as a personal birthday surprise project.",
        language: "JavaScript",
        technologies: ["HTML", "CSS", "JavaScript"],
        repoUrl: "",
        demoUrl: "",
        bannerUrl: ""
    }
];


/* =========================================================
   TYPING ANIMATION
========================================================= */

function startTypingAnimation() {
    const typingElement = document.getElementById("typing-text");

    if (!typingElement) return;

    const roles = [
        "Aspiring DevOps Engineer",
        "Cloud Engineering Learner",
        "SRE Learner",
        "Automation Enthusiast"
    ];

    let roleIndex = 0;
    let characterIndex = 0;
    let isDeleting = false;

    function typeNextCharacter() {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            characterIndex--;
        } else {
            characterIndex++;
        }

        typingElement.textContent = currentRole.slice(0, characterIndex);

        let delay = isDeleting ? 55 : 72;

        if (!isDeleting && characterIndex === currentRole.length) {
            isDeleting = true;
            delay = 1400;
        } else if (isDeleting && characterIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 350;
        }

        window.setTimeout(typeNextCharacter, delay);
    }

    typeNextCharacter();
}


/* =========================================================
   GITHUB PROJECTS: FETCH, RETRY, AND FALLBACK
========================================================= */

function wait(milliseconds) {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally {
        window.clearTimeout(timeoutId);
    }
}

async function fetchGitHubProjects() {
    const container = document.getElementById("projects-container");

    if (!container) {
        console.warn('Could not find the element with id="projects-container".');
        return;
    }

    container.setAttribute("aria-live", "polite");

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const response = await fetchWithTimeout(GITHUB_API_URL, {
                headers: {
                    Accept: "application/vnd.github+json"
                }
            });

            if (!response.ok) {
                const error = new Error(
                    `GitHub API returned status ${response.status}.`
                );

                // Retry rate limits and server errors. Other HTTP errors
                // are unlikely to be fixed by another immediate request.
                error.retryable =
                    response.status === 429 || response.status >= 500;

                throw error;
            }

            const repositories = await response.json();

            if (!Array.isArray(repositories)) {
                throw new Error("GitHub returned an unexpected response.");
            }

            // Keep CampusOS visible even though its repository belongs to
            // the CPCCU organization rather than this portfolio's owner.
            const projects = repositories
                .filter(repository => repository && !repository.fork)
                .slice(0, PROJECT_LIMIT);

            if (projects.length === 0) {
                showFallbackProjects(
                    container,
                    "No public repositories were returned. Showing the projects configured on this page."
                );
                return;
            }

            const otherProjects = projects.filter(
                project => project.full_name?.toLowerCase() !== "cpccu/intellix"
            );

            renderProjects(container, [
                FEATURED_PROJECT,
                ...otherProjects.slice(0, PROJECT_LIMIT - 1)
            ]);
            return;

        } catch (error) {
            console.warn(`GitHub project request ${attempt} failed:`, error);

            const shouldRetry =
                error.retryable !== false && attempt < MAX_ATTEMPTS;

            if (!shouldRetry) {
                break;
            }

            const nextAttempt = attempt + 1;

            showLoadingMessage(
                container,
                `Couldn't load GitHub projects. Retrying (${nextAttempt} of ${MAX_ATTEMPTS})…`
            );

            // Wait 1.5 seconds after the first failure, then 3 seconds.
            await wait(RETRY_DELAY_MS * attempt);
        }
    }

    showFallbackProjects(
        container,
        "GitHub projects couldn't be loaded right now. Showing the projects configured on this page instead."
    );
}


/* =========================================================
   PROJECT CARD RENDERING
========================================================= */

function renderProjects(container, projects) {
    const cards = projects.map(createProjectCard);
    container.replaceChildren(...cards);
}

function showFallbackProjects(container, message) {
    if (!FALLBACK_PROJECTS.length) {
        showLoadingMessage(container, message);
        return;
    }

    renderProjects(container, FALLBACK_PROJECTS);

    const notice = document.createElement("p");
    notice.className = "project-fallback-notice";
    notice.textContent = message;
    notice.style.gridColumn = "1 / -1";
    notice.style.textAlign = "center";
    notice.style.color = "var(--text-light)";
    notice.style.fontSize = "0.9rem";

    container.appendChild(notice);
}

function showLoadingMessage(container, message) {
    const wrapper = document.createElement("div");
    wrapper.className = "loading-message";
    wrapper.style.gridColumn = "1 / -1";
    wrapper.setAttribute("role", "status");

    const icon = document.createElement("i");
    icon.className = "fas fa-spinner fa-spin";
    icon.setAttribute("aria-hidden", "true");

    const text = document.createElement("p");
    text.textContent = message;

    wrapper.append(icon, text);
    container.replaceChildren(wrapper);
}

function createProjectCard(project) {
    const card = document.createElement("article");
    card.className = "project-card";

    const banner = createProjectBanner(project);
    const content = document.createElement("div");
    content.className = "project-content";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = project.name || "Untitled project";

    if (project.context) {
        const context = document.createElement("div");
        context.className = "project-context";

        const badge = document.createElement("span");
        badge.className = "project-context-badge";
        badge.textContent = "Hackathon Project";

        const event = document.createElement("span");
        event.className = "project-context-event";
        event.textContent = project.context;

        context.append(badge, event);
        content.appendChild(context);
    }

    const description = document.createElement("p");
    description.className = "project-description";
    const repositoryName = project.full_name?.toLowerCase();
    description.textContent = PROJECT_DESCRIPTION_OVERRIDES[repositoryName]
        || project.description
        || "No description has been added yet.";

    content.append(title, description);

    const technologies = getProjectTechnologies(project);

    if (technologies.length > 0) {
        const technologyList = document.createElement("div");
        technologyList.className = "project-languages";

        technologies.forEach(technology => {
            const tag = document.createElement("span");
            tag.className = "language-tag";
            tag.textContent = technology;
            technologyList.appendChild(tag);
        });

        content.appendChild(technologyList);
    }

    const footer = createProjectFooter(project);

    if (footer) {
        content.appendChild(footer);
    }

    card.append(banner, content);
    return card;
}

function createProjectBanner(project) {
    const banner = document.createElement("div");
    banner.className = "project-banner";
    banner.style.background = getBannerGradient(project.language);

    const bannerUrl = getSafeHttpUrl(project.bannerUrl);

    if (bannerUrl) {
        const image = document.createElement("img");
        image.src = bannerUrl;
        image.alt = `${project.name || "Project"} banner`;
        image.loading = "lazy";

        image.addEventListener("error", () => {
            image.remove();
            addBannerIcon(banner);
        }, { once: true });

        banner.appendChild(image);
    } else {
        addBannerIcon(banner);
    }

    return banner;
}

function addBannerIcon(banner) {
    const icon = document.createElement("i");
    icon.className = "fas fa-code-branch";
    icon.setAttribute("aria-hidden", "true");
    banner.appendChild(icon);
}

function getProjectTechnologies(project) {
    if (Array.isArray(project.technologies) && project.technologies.length > 0) {
        return project.technologies;
    }

    return project.language ? [project.language] : [];
}

function createProjectFooter(project) {
    const footer = document.createElement("div");
    footer.className = "project-footer";

    const stats = document.createElement("div");
    stats.className = "project-stats";

    if (Number.isFinite(project.stargazers_count)) {
        stats.appendChild(
            createProjectStat("fas fa-star", project.stargazers_count, "Stars")
        );
    }

    if (Number.isFinite(project.forks_count)) {
        stats.appendChild(
            createProjectStat(
                "fas fa-code-branch",
                project.forks_count,
                "Forks"
            )
        );
    }

    const links = document.createElement("div");
    links.className = "project-links";

    const repositoryUrl = getSafeHttpUrl(project.html_url || project.repoUrl);
    const demoUrl = getSafeHttpUrl(project.homepage || project.demoUrl);

    if (repositoryUrl) {
        links.appendChild(
            createProjectLink(
                repositoryUrl,
                "fab fa-github",
                `View ${project.name || "project"} on GitHub`
            )
        );
    }

    if (demoUrl) {
        links.appendChild(
            createProjectLink(
                demoUrl,
                "fas fa-external-link-alt",
                `Open ${project.name || "project"} demo`
            )
        );
    }

    if (stats.childElementCount === 0 && links.childElementCount === 0) {
        return null;
    }

    if (stats.childElementCount > 0) {
        footer.appendChild(stats);
    }

    if (links.childElementCount > 0) {
        footer.appendChild(links);
    }

    return footer;
}

function createProjectStat(iconClass, value, label) {
    const stat = document.createElement("span");
    stat.className = "project-stat";
    stat.setAttribute("aria-label", `${value} ${label}`);

    const icon = document.createElement("i");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.textContent = String(value);

    stat.append(icon, text);
    return stat;
}

function createProjectLink(url, iconClass, label) {
    const link = document.createElement("a");
    link.className = "project-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.title = label;
    link.setAttribute("aria-label", label);

    const icon = document.createElement("i");
    icon.className = iconClass;
    icon.setAttribute("aria-hidden", "true");

    link.appendChild(icon);
    return link;
}

function getSafeHttpUrl(value) {
    if (typeof value !== "string" || !value.trim()) {
        return "";
    }

    try {
        const url = new URL(value);

        if (url.protocol === "https:" || url.protocol === "http:") {
            return url.href;
        }
    } catch {
        // Ignore invalid URLs.
    }

    return "";
}

function getBannerGradient(language) {
    const gradients = {
        javascript: "linear-gradient(135deg, #b7791f, #d69e2e)",
        typescript: "linear-gradient(135deg, #235a97, #3178c6)",
        python: "linear-gradient(135deg, #306998, #3776ab)",
        php: "linear-gradient(135deg, #4b5ba0, #777bb4)",
        html: "linear-gradient(135deg, #c2410c, #e34c26)",
        css: "linear-gradient(135deg, #4338ca, #2965f1)",
        java: "linear-gradient(135deg, #007396, #c75b12)",
        "c++": "linear-gradient(135deg, #004482, #00599c)",
        shell: "linear-gradient(135deg, #347a24, #4eaa25)"
    };

    const key = typeof language === "string" ? language.toLowerCase() : "";

    return gradients[key] || "linear-gradient(135deg, #0066cc, #058b9f)";
}


/* =========================================================
   INITIALIZE
========================================================= */

function initializePortfolio() {
    startTypingAnimation();
    fetchGitHubProjects();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePortfolio);
} else {
    initializePortfolio();
}
