/**
 * Visual Effects & Celebrations
 */

const CONFETTI_COLORS = ['#FF6B6B', '#FFA94D', '#FFD93D', '#6BCB77', '#4D96FF', '#9D84B7'];

/**
 * Triggers full-screen celebration banner and falling confetti particles
 */
export function createCongratulationsEffect() {
    const container = document.createElement('div');
    container.className = 'congratulations-container';
    
    const text = document.createElement('div');
    text.className = 'congratulations-text';
    text.textContent = '🎉 Excellent! 🎉';
    container.appendChild(text);
    
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        confetti.style.animationDelay = (Math.random() * 0.5) + 's';
        confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
        container.appendChild(confetti);
    }
    
    document.body.appendChild(container);
    
    setTimeout(() => {
        container.remove();
    }, 5500);
}
