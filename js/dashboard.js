document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const hamb = document.getElementById('hamburger');
  hamb.onclick = () => sidebar.classList.toggle('open');
});
