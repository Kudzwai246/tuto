document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const hamb    = document.getElementById('hamburger');

  // Hamburger toggles sidebar
  hamb.onclick = () => sidebar.classList.toggle('open');

  // Swipe support on the entire document
  let startX = 0;
  document.body.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].clientX;
  });
  document.body.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -50) {
      // swipe left → hide
      sidebar.classList.remove('open');
    } else if (dx > 50) {
      // swipe right → show
      sidebar.classList.add('open');
    }
  });
});
