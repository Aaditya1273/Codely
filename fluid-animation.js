// Optimized Fluid Animation
document.addEventListener('DOMContentLoaded', function() {
  // Create canvas and add to document
  const canvas = document.createElement('canvas');
  canvas.id = 'fluid-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
  document.body.prepend(canvas);
  
  // Get drawing context
  const ctx = canvas.getContext('2d');
  
  // Animation configuration
  const config = {
    particleCount: 25,
    particleColor: '#CCCCCC',
    particleSize: 2,
    particleSpeed: 0.8,
    lineColor: 'rgba(204, 204, 204, 0.15)',
    lineWidth: 0.5,
    lineLength: 150,
    fadeSpeed: 0.01
  };
  
  // Particle storage
  let particles = [];

  // Resize canvas to match window
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Create initial particles
  function createParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * config.particleSpeed,
        vy: (Math.random() - 0.5) * config.particleSpeed,
        size: config.particleSize,
        alpha: Math.random() * 0.8 + 0.1
      });
    }
  }

  // Update particle positions and properties
  function updateParticles() {
    particles.forEach(p => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce off edges
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      
      // Fade in and out
      p.alpha += Math.random() * config.fadeSpeed * (Math.random() > 0.5 ? 1 : -1);
      p.alpha = Math.max(0.1, Math.min(0.9, p.alpha));
    });
  }

  // Draw particles and connecting lines
  function drawParticles() {
    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connecting lines between particles
    ctx.lineWidth = config.lineWidth;
    ctx.strokeStyle = config.lineColor;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < config.lineLength) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.globalAlpha = (1 - distance / config.lineLength) * Math.min(p1.alpha, p2.alpha);
          ctx.stroke();
        }
      }
    }
    
    // Draw particles
    ctx.fillStyle = config.particleColor;
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    
    // Reset global alpha
    ctx.globalAlpha = 1;
  }

  // Animation loop
  function animate() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animate);
  }

  // Initialize
  resizeCanvas();
  createParticles();
  animate();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });
});
