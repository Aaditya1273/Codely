// Optimized Fluid Animation
document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'fluid-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;';
  document.body.prepend(canvas);
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  const config = {
    particleCount: 15,
    particleColor: '#CCCCCC',
    particleSize: 2,
    particleSpeed: 0.8,
    lineColor: 'rgba(204, 204, 204, 0.15)',
    lineWidth: 0.5,
    lineLength: 120,
    fadeSpeed: 0.01
  };
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
  }
  
  function createParticles() {
    particles = Array.from({length: config.particleCount}, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: config.particleSize,
      speedX: (Math.random() - 0.5) * config.particleSpeed,
      speedY: (Math.random() - 0.5) * config.particleSpeed,
      alpha: 0.5
    }));
  }
  
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;
      
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      
      p.alpha += (Math.random() - 0.5) * config.fadeSpeed;
      p.alpha = Math.max(0.1, Math.min(0.9, p.alpha));
      
      ctx.fillStyle = `rgba(127, 106, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < config.lineLength) {
          const opacity = (1 - distance / config.lineLength) * 0.2;
          ctx.strokeStyle = `rgba(127, 106, 255, ${opacity})`;
          ctx.lineWidth = config.lineWidth;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    });
  }
  
  const mouseParticle = { x: 0, y: 0, active: false };
  
  function animate() {
    drawParticles();
    requestAnimationFrame(animate);
  }
  
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('mousemove', e => {
    mouseParticle.x = e.clientX;
    mouseParticle.y = e.clientY;
    mouseParticle.active = true;
  });
  
  setInterval(() => {
    particles.forEach(p => {
      p.speedX = (Math.random() - 0.5) * config.particleSpeed;
      p.speedY = (Math.random() - 0.5) * config.particleSpeed;
    });
  }, 3000);
  
  createParticles();
  animate();
  
  // Mouse event handlers
  document.addEventListener('mouseout', () => {
    mouseParticle.active = false;
  });
  
  // Add some energy to the particles when clicking
  document.addEventListener('click', (e) => {
    particles.forEach(particle => {
      const dx = particle.x - e.clientX;
      const dy = particle.y - e.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const angle = Math.atan2(dy, dx);
        const force = (100 - distance) / 10;
        particle.speedX += Math.cos(angle) * force * 0.2;
        particle.speedY += Math.sin(angle) * force * 0.2;
      }
    });
  });
  // Initialize
  resizeCanvas();
  createParticles();
  drawParticles();
  addRandomMovement();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
  });
});
