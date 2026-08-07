/**
 * Vthon Website JavaScript
 * Handles theme switching, mobile navigation, smooth scroll, and other interactions
 */

(function() {
  'use strict';

  // ============================================
  // Theme Management
  // ============================================
  const THEME_KEY = 'vthon-theme';
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeToggleIcon(theme);
  }

  function updateThemeToggleIcon(theme) {
    if (!themeToggle) return;
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }

  function initTheme() {
    const theme = getPreferredTheme();
    applyTheme(theme);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // ============================================
  // Mobile Navigation
  // ============================================
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  function toggleMobileNav() {
    if (!navToggle || !navMenu) return;
    const isOpen = navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  }

  function closeMobileNav() {
    if (navMenu && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      }
    }
  }

  function initMobileNav() {
    if (navToggle) {
      navToggle.addEventListener('click', toggleMobileNav);
    }

    navLinks.forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileNav();
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (navMenu && navMenu.classList.contains('open') &&
          !navMenu.contains(e.target) &&
          !navToggle.contains(e.target)) {
        closeMobileNav();
      }
    });
  }

  // ============================================
  // Active Navigation Link
  // ============================================
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPage = href.split('/').pop();
      if (linkPage === currentPage ||
          (currentPage === 'index.html' && linkPage === 'index.html') ||
          (currentPage === '' && linkPage === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ============================================
  // Scroll to Top Button
  // ============================================
  const scrollTopBtn = document.getElementById('scroll-top');

  function toggleScrollTop() {
    if (!scrollTopBtn) return;
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function initScrollTop() {
    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', scrollToTop);
    }
    window.addEventListener('scroll', toggleScrollTop, { passive: true });
  }

  // ============================================
  // Code Block Copy Buttons
  // ============================================
  function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('.code-block');

    codeBlocks.forEach(block => {
      const pre = block.querySelector('pre');
      if (!pre) return;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'code-block-copy';
      copyBtn.textContent = 'Copy';
      copyBtn.setAttribute('aria-label', 'Copy code to clipboard');

      const header = block.querySelector('.code-block-header');
      if (header) {
        header.appendChild(copyBtn);
      } else {
        // Create header if it doesn't exist
        const newHeader = document.createElement('div');
        newHeader.className = 'code-block-header';
        newHeader.innerHTML = '<span>vthon</span>';
        newHeader.appendChild(copyBtn);
        block.insertBefore(newHeader, pre);
      }

      copyBtn.addEventListener('click', async () => {
        const code = pre.querySelector('code') || pre;
        const text = code.textContent;

        try {
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = 'Copied!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          copyBtn.textContent = 'Failed';
          setTimeout(() => {
            copyBtn.textContent = 'Copy';
          }, 2000);
        }
      });
    });
  }

  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  // ============================================
  // Scroll Animations (Intersection Observer)
  // ============================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-fade-in-up');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      animatedElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      });
    }
  }

  // ============================================
  // Table of Contents (for documentation pages)
  // ============================================
  function initTableOfContents() {
    const tocContainer = document.getElementById('table-of-contents');
    const content = document.querySelector('.doc-content, main article');

    if (!tocContainer || !content) return;

    const headings = content.querySelectorAll('h2, h3');
    if (headings.length < 3) return; // Only show TOC if enough headings

    const tocList = document.createElement('ul');
    tocList.className = 'toc-list';

    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }

      const li = document.createElement('li');
      li.className = heading.tagName.toLowerCase();

      const a = document.createElement('a');
      a.href = '#' + heading.id;
      a.textContent = heading.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth' });
        history.pushState(null, '', '#' + heading.id);
      });

      li.appendChild(a);
      tocList.appendChild(li);
    });

    tocContainer.appendChild(tocList);
  }

  // ============================================
  // Initialize All
  // ============================================
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    initTheme();
    initMobileNav();
    initScrollTop();
    initCodeCopy();
    initSmoothScroll();
    initScrollAnimations();
    initTableOfContents();
    setActiveNavLink();

    // Re-set active link on hash change
    window.addEventListener('hashchange', setActiveNavLink);
  }

  init();
})();