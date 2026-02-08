document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger-menu';
  hamburger.setAttribute('aria-label', 'Toggle menu');
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';

  const sidebar = document.createElement('div');
  sidebar.className = 'mobile-sidebar';
  
  const desktopNav = document.querySelector('.nav-center');
  if (desktopNav) {
    const mobileNav = desktopNav.cloneNode(true);
    mobileNav.className = '';
    sidebar.appendChild(mobileNav);
  }

  const topNav = document.querySelector('.top-nav-bar');
  if (topNav) {
    topNav.insertBefore(hamburger, topNav.firstChild);
  }
  
  document.body.appendChild(sidebar);
  document.body.appendChild(overlay);

  function toggleMenu() {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  const sidebarLinks = sidebar.querySelectorAll('a');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', toggleMenu);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      toggleMenu();
    }
  });
});