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
  // Playground (Simulated)
  // ============================================
  function initPlayground() {
    const editor = document.getElementById('playground-editor');
    const output = document.getElementById('playground-output');
    const runBtn = document.getElementById('playground-run');
    const clearBtn = document.getElementById('playground-clear');
    const copyOutputBtn = document.getElementById('playground-copy-output');
    const lineCount = document.getElementById('playground-line-count');
    const exampleBtns = document.querySelectorAll('.example-btn');

    if (!editor || !output || !runBtn || !clearBtn) return;

    // Example code snippets demonstrating Vthon v0.2.0 features
    const examples = {
      'variables': `# Variables and constants (Vthon v0.2.0)
let name = "Vthon"
const VERSION = "0.2.0"
let count = 42
let enabled = true
let nothing = null
let items = [1, 2, 3, 4, 5]
let user = {"name": "Ada", "role": "developer"}

# Reassignment (variables only)
count = 100
items.append(6)

print("Language: " + name)
print("Version: " + VERSION)
print("Count: " + str(count))
print("Enabled: " + str(enabled))
print("Items: " + str(items))
print("User: " + str(user))`,

      'list-comprehension': `# List comprehensions (Vthon v0.2.0)
let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# Basic comprehension
let squares = [x * x for x in numbers]
print("Squares: " + str(squares))

# With condition
let even_squares = [x * x for x in numbers if x % 2 == 0]
print("Even squares: " + str(even_squares))

# Nested comprehension
let matrix = [[1, 2], [3, 4], [5, 6]]
let flat = [x for row in matrix for x in row]
print("Flattened: " + str(flat))

# String comprehension
let words = ["hello", "world", "vthon"]
let upper = [w.upper() for w in words]
print("Uppercase: " + str(upper))`,

      'decorators': `# Decorators (Vthon v0.2.0)
fn timer(fn):
    fn inner(*args, **kwargs):
        import time
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        end = time.perf_counter()
        print("Function " + fn.__name__ + " took " + str((end - start) * 1000) + " ms")
        return result
    return inner

@timer
fn slow_add(a, b):
    import time
    time.sleep(0.1)  # Simulate work
    return a + b

@timer
fn fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

print("Result: " + str(slow_add(10, 20)))
print("Fib(10): " + str(fib(10)))`,

      'with-statement': `# With statements / Context managers (Vthon v0.2.0)
class Timer:
    fn __enter__():
        import time
        self.start = time.perf_counter()
        print("Timer started")
        return self
    
    fn __exit__(exc_type, exc_val, exc_tb):
        import time
        self.end = time.perf_counter()
        print("Timer ended. Duration: " + str((self.end - self.start) * 1000) + " ms")

# Using the context manager
with Timer() as t:
    import time
    time.sleep(0.05)
    print("Inside context")

# File-like context manager (simulated)
class Resource:
    fn __enter__():
        print("Resource acquired")
        return self
    
    fn __exit__(exc_type, exc_val, exc_tb):
        print("Resource released")
    
    fn do_work():
        print("Doing work...")

with Resource() as r:
    r.do_work()`,

      'type-annotations': `# Type annotations (Vthon v0.2.0)
# Function with type hints
fn add(a: int, b: int) -> int:
    return a + b

fn greet(name: str) -> str:
    return "Hello, " + name

fn process(items: list) -> dict:
    return {"count": len(items), "items": items}

# Variable type annotations
let x: int = 42
let name: str = "Vthon"
let flags: list = [true, false, true]
let data: dict = {"key": "value"}

# Class with type hints
class Point:
    fn __init__(x: float, y: float):
        self.x = x
        self.y = y
    
    fn distance(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5

let p1 = Point(0, 0)
let p2 = Point(3, 4)
print("Distance: " + str(p1.distance(p2)))`,

      'ternary': `# Ternary expressions (Vthon v0.2.0)
let x = 10
let y = 20

# Basic ternary
let max_val = x if x > y else y
print("Max: " + str(max_val))

# Nested ternary
let sign = "positive" if x > 0 else ("negative" if x < 0 else "zero")
print("Sign of x: " + sign)

# Ternary in function call
fn describe(n: int) -> str:
    return "even" if n % 2 == 0 else "odd"

print("10 is " + describe(10))
print("7 is " + describe(7))

# Ternary with walrus (if supported)
let values = [1, 5, 10, 15]
let first_big = (v for v in values if v > 8)  # Generator expression
print("First > 8: " + str(next(first_big, "none")))`,

      'walrus': `# Walrus operator := (Vthon v0.2.0)
# Assignment expressions (walrus operator)
let data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# In list comprehension
let squares = [y for x in data if (y := x * x) > 20]
print("Squares > 20: " + str(squares))

# In while loop
let n = 0
while (n := n + 1) <= 5:
    print("Iteration: " + str(n))

# In conditional
let text = "hello world"
if (idx := text.find("world")) != -1:
    print("Found 'world' at index " + str(idx))

# In function call
fn process(value: int):
    print("Processing: " + str(value))

# Walrus in function argument (if supported)
let numbers = [10, 20, 30]
for x in numbers:
    if (doubled := x * 2) > 25:
        print(str(x) + " doubled is " + str(doubled))`,

      'match-case': `# Match/Case pattern matching (Vthon v0.2.0)
fn describe(value):
    match value:
        case 0:
            return "zero"
        case 1:
            return "one"
        case int() as n if n > 1:
            return "integer: " + str(n)
        case str() as s:
            return "string: " + s
        case [x, y]:
            return "pair: " + str(x) + ", " + str(y)
        case [x, *rest]:
            return "list starting with " + str(x) + " (" + str(len(rest)) + " more)"
        case {"type": "error", "message": msg}:
            return "Error: " + msg
        case {"type": "ok", "data": data}:
            return "OK: " + str(data)
        case _:
            return "unknown: " + str(type(value))

# Test cases
print(describe(0))
print(describe(1))
print(describe(42))
print(describe("hello"))
print(describe([1, 2]))
print(describe([1, 2, 3, 4]))
print(describe({"type": "error", "message": "not found"}))
print(describe({"type": "ok", "data": [1, 2, 3]}))
print(describe(3.14))`
    };

    let currentExample = 'variables';

    function updateLineCount() {
      const lines = editor.value.split('\n').length;
      lineCount.textContent = lines + (lines === 1 ? ' line' : ' lines');
    }

    function loadExample(name) {
      if (examples[name]) {
        editor.value = examples[name];
        currentExample = name;
        updateLineCount();
        
        // Update active button
        exampleBtns.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.example === name);
        });
      }
    }

    function simulateRun() {
      const code = editor.value.trim();
      
      if (!code) {
        output.textContent = '# No code to run\n# Select an example or write your own Vthon code';
        return;
      }

      // Show running state
      runBtn.disabled = true;
      runBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path></svg> Running...';
      
      // Simulate async execution
      setTimeout(() => {
        // Check which example matches the current code (roughly)
        let matchedExample = currentExample;
        for (const [name, exampleCode] of Object.entries(examples)) {
          if (code.includes(exampleCode.split('\n')[1].trim().substring(0, 30))) {
            matchedExample = name;
            break;
          }
        }

        // Generate simulated output based on the example
        const simulatedOutputs = {
          'variables': `Language: Vthon
Version: 0.2.0
Count: 100
Enabled: True
Items: [1, 2, 3, 4, 5, 6]
User: {'name': 'Ada', 'role': 'developer'}`,

          'list-comprehension': `Squares: [1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
Even squares: [4, 16, 36, 64, 100]
Flattened: [1, 2, 3, 4, 5, 6]
Uppercase: ['HELLO', 'WORLD', 'VTHON']`,

          'decorators': `Function slow_add took 100.23 ms
Result: 30
Function fib took 152.45 ms
Fib(10): 55`,

          'with-statement': `Timer started
Inside context
Timer ended. Duration: 50.12 ms
Resource acquired
Doing work...
Resource released`,

          'type-annotations': `Distance: 5.0`,

          'ternary': `Max: 20
Sign of x: positive
10 is even
7 is odd
First > 8: 10`,

          'walrus': `Squares > 20: [25, 36, 49, 64, 81, 100]
Iteration: 1
Iteration: 2
Iteration: 3
Iteration: 4
Iteration: 5
Found 'world' at index 6
10 doubled is 20
15 doubled is 30`,

          'match-case': `zero
one
integer: 42
string: hello
pair: 1, 2
list starting with 1 (3 more)
Error: not found
OK: [1, 2, 3]
unknown: <class 'float'>`
        };

        const simulatedOutput = simulatedOutputs[matchedExample] || '# Output simulation not available for this code\n# This is a demo playground - install Vthon locally for real execution';
        
        output.textContent = simulatedOutput;
        
        // Reset button
        runBtn.disabled = false;
        runBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> Run';
      }, 500);
    }

    function clearEditor() {
      editor.value = '';
      output.textContent = '# Output will appear here...';
      updateLineCount();
      exampleBtns.forEach(btn => btn.classList.remove('active'));
    }

    function copyOutput() {
      const text = output.textContent;
      if (!text || text.startsWith('# ')) return;
      
      navigator.clipboard.writeText(text).then(() => {
        copyOutputBtn.textContent = 'Copied!';
        setTimeout(() => { copyOutputBtn.textContent = 'Copy'; }, 1500);
      }).catch(() => {
        copyOutputBtn.textContent = 'Failed';
        setTimeout(() => { copyOutputBtn.textContent = 'Copy'; }, 1500);
      });
    }

    // Event listeners
    runBtn.addEventListener('click', simulateRun);
    clearBtn.addEventListener('click', clearEditor);
    copyOutputBtn.addEventListener('click', copyOutput);
    
    editor.addEventListener('input', updateLineCount);
    
    // Handle Tab key in textarea
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        updateLineCount();
      }
    });

    exampleBtns.forEach(btn => {
      btn.addEventListener('click', () => loadExample(btn.dataset.example));
    });

    // Load initial example
    loadExample('variables');
    
    // Add spin animation for loading state
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
    document.head.appendChild(style);
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
    initPlayground();

    // Re-set active link on hash change
    window.addEventListener('hashchange', setActiveNavLink);
  }

  init();
})();