document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const main    = document.getElementById('main');
  const hamb    = document.getElementById('hamburger');

  // Toggle sidebar when hamburger clicked
  hamb.onclick = () => {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
  };

  // Swipe left/right on main area to collapse/expand
  let touchStartX = 0;
  main.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  });
  main.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx < -50) {            // swipe left → collapse
      sidebar.classList.add('collapsed');
      main.classList.add('expanded');
    } else if (dx > 50) {      // swipe right → expand
      sidebar.classList.remove('collapsed');
      main.classList.remove('expanded');
    }
  });
});
