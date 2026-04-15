// Initialize saved theme preference
window.addEventListener('load', () => {
  // Load saved theme preference
  api.initializeTheme();
});

// Example interactivity: clicking a card highlights it
document.querySelectorAll('.about-card').forEach(card => {
  card.addEventListener('click', () => {
    alert(`You clicked on: ${card.querySelector('h2').textContent}`);
  });
});