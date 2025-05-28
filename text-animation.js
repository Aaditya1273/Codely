// Premium Title Animation with multi-stage effects
document.addEventListener('DOMContentLoaded', function() {
  // Target the main title
  const titleElement = document.querySelector('#animated-title');
  if (!titleElement) return;
  
  // Get the original text and clear the element
  const originalText = titleElement.textContent;
  titleElement.innerHTML = '';
  
  // Convert to words
  const words = originalText.split(' ');

  // Create spans for each character within each word for more granular animation
  words.forEach((word, wordIndex) => {
    const wordContainer = document.createElement('span');
    wordContainer.className = 'word-container';
    wordContainer.style.display = 'inline-block';
    wordContainer.style.margin = '0 8px';
    wordContainer.style.position = 'relative';
    
    // Create spans for each character
    [...word].forEach((char, charIndex) => {
      const charSpan = document.createElement('span');
      charSpan.textContent = char;
      charSpan.style.display = 'inline-block';
      charSpan.style.opacity = '0';
      charSpan.style.transform = 'perspective(500px) translateZ(-50px) rotateX(10deg)';
      charSpan.style.filter = 'blur(8px)';
      charSpan.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      
      // Staggered delay - first by word, then by character
      const delay = wordIndex * 0.1 + charIndex * 0.04;
      charSpan.style.transitionDelay = `${delay}s`;
      
      wordContainer.appendChild(charSpan);
    });
    
    titleElement.appendChild(wordContainer);
    
    // Add a space unless it's the last word
    if (wordIndex < words.length - 1) {
      const space = document.createElement('span');
      space.innerHTML = '&nbsp;';
      space.style.display = 'inline-block';
      titleElement.appendChild(space);
    }
  });
  
  // Create a subtle glow effect behind the title
  const glowElement = document.createElement('div');
  glowElement.style.position = 'absolute';
  glowElement.style.top = '0';
  glowElement.style.left = '0';
  glowElement.style.width = '100%';
  glowElement.style.height = '100%';
  glowElement.style.filter = 'blur(40px)';
  glowElement.style.background = 'radial-gradient(circle at center, rgba(100, 100, 100, 0.2), transparent 60%)';
  glowElement.style.opacity = '0';
  glowElement.style.transition = 'opacity 1.5s ease-in-out';
  glowElement.style.pointerEvents = 'none';
  glowElement.style.zIndex = '-1';
  
  titleElement.style.position = 'relative';
  titleElement.insertBefore(glowElement, titleElement.firstChild);
  
  // Trigger the character animations after a small delay
  setTimeout(() => {
    const charSpans = titleElement.querySelectorAll('.word-container span');
    charSpans.forEach(span => {
      span.style.opacity = '1';
      span.style.transform = 'perspective(500px) translateZ(0) rotateX(0deg)';
      span.style.filter = 'blur(0)';
    });
    
    // Fade in the glow effect
    setTimeout(() => {
      glowElement.style.opacity = '1';
    }, 300);
    
    // Add a subtle continuous hover effect after animation completes
    setTimeout(() => {
      const wordContainers = titleElement.querySelectorAll('.word-container');
      wordContainers.forEach(container => {
        container.style.transition = 'transform 2s ease-in-out';
        container.style.willChange = 'transform';
      });
      
      // Subtle floating animation
      let isFloatingUp = true;
      setInterval(() => {
        wordContainers.forEach((container, index) => {
          const offset = isFloatingUp ? -3 : 3;
          const delay = index * 0.1;
          setTimeout(() => {
            container.style.transform = `translateY(${offset}px)`;
          }, delay * 1000);
        });
        isFloatingUp = !isFloatingUp;
      }, 2000);
      
    }, 1500);
  }, 200);
});

