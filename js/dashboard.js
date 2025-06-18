document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const hamb    = document.getElementById('hamburger');

  // Toggle sidebar on hamburger tap
  hamb.onclick = () => sidebar.classList.toggle('open');

  // Swipe on the entire window
  let startX = 0;
  let startTime = 0;

  window.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].clientX;
    startTime = Date.now();
  }, {passive:true});

  window.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dt = Date.now() - startTime;
    // only if quick enough (<500ms) and far enough (>50px)
    if (dt < 500) {
      if (dx < -50) {
        // left swipe → close
        sidebar.classList.remove('open');
      } else if (dx > 50) {
        // right swipe → open
        sidebar.classList.add('open');
      }
    }
  }, {passive:true});
});
