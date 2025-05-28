// Fluid Animation for Codely - Simplified Version
document.addEventListener('DOMContentLoaded', function() {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.id = 'fluid-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '-2';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '0.7';
  document.body.appendChild(canvas);

  // Get 2D context (more compatible than WebGL)
  const ctx = canvas.getContext('2d');
  
  // Resize canvas to match window size
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  // Initialize and handle resize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Configuration
  const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    DENSITY_DISSIPATION: 3.5,
    VELOCITY_DISSIPATION: 2,
    PRESSURE: 0.1,
    PRESSURE_ITERATIONS: 20,
    CURL: 3,
    SPLAT_RADIUS: 0.2,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLOR_UPDATE_SPEED: 10,
    BACK_COLOR: { r: 0.5, g: 0, b: 0 },
    TRANSPARENT: true,
    PAUSED: false
  };
  
  // Pointer handling
  function Pointer() {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = [0, 0, 0];
  }
  
  let pointers = [new Pointer()];
  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0;

  // WebGL context
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  
  // Resize canvas to match window size
  function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  
  // Initialize
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Color generation
  function generateColor() {
    const h = Math.random();
    const s = 1.0;
    const v = 1.0;
    let r, g, b;
    
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return { 
      r: r * 0.15, 
      g: g * 0.15, 
      b: b * 0.15 
    };
  }
  
  // Mouse event handlers
  window.addEventListener('mousedown', (e) => {
    const pointer = pointers[0];
    const posX = e.clientX * (window.devicePixelRatio || 1);
    const posY = e.clientY * (window.devicePixelRatio || 1);
    
    pointer.down = true;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateColor();
    
    // Create a splat at click position
    createSplat(pointer.texcoordX, pointer.texcoordY);
  });
  
  window.addEventListener('mousemove', (e) => {
    const pointer = pointers[0];
    const posX = e.clientX * (window.devicePixelRatio || 1);
    const posY = e.clientY * (window.devicePixelRatio || 1);
    
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    
    if (pointer.moved && pointer.down) {
      createSplat(pointer.texcoordX, pointer.texcoordY);
    }
  });
  
  window.addEventListener('mouseup', () => {
    pointers[0].down = false;
  });
  
  // Touch event handlers for mobile
  window.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      const posX = touches[i].clientX * (window.devicePixelRatio || 1);
      const posY = touches[i].clientY * (window.devicePixelRatio || 1);
      
      pointers[0].down = true;
      pointers[0].texcoordX = posX / canvas.width;
      pointers[0].texcoordY = 1.0 - posY / canvas.height;
      pointers[0].color = generateColor();
      
      createSplat(pointers[0].texcoordX, pointers[0].texcoordY);
    }
  }, false);
  
  window.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      const posX = touches[i].clientX * (window.devicePixelRatio || 1);
      const posY = touches[i].clientY * (window.devicePixelRatio || 1);
      
      pointers[0].texcoordX = posX / canvas.width;
      pointers[0].texcoordY = 1.0 - posY / canvas.height;
      
      createSplat(pointers[0].texcoordX, pointers[0].texcoordY);
    }
  }, false);
  
  window.addEventListener('touchend', (e) => {
    pointers[0].down = false;
  });
  
  // Helper functions
  function correctDeltaX(delta) {
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }
  
  function correctDeltaY(delta) {
    const aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }
  
  // Create a splat effect
  function createSplat(x, y) {
    const color = generateColor();
    
    // Draw gradient circle on canvas (simplified version)
    const ctx = canvas.getContext('2d');
    const radius = Math.min(canvas.width, canvas.height) * 0.1;
    
    const gradient = ctx.createRadialGradient(
      x * canvas.width, 
      y * canvas.height, 
      0, 
      x * canvas.width, 
      y * canvas.height, 
      radius
    );
    
    gradient.addColorStop(0, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 0.5)`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = 'lighter';
    ctx.beginPath();
    ctx.arc(x * canvas.width, y * canvas.height, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Fade out existing content
    setTimeout(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 100);
  }

  // Create initial splats
  function createRandomSplats() {
    for (let i = 0; i < 5; i++) {
      const x = Math.random();
      const y = Math.random();
      createSplat(x, y);
    }
  }
  
  // Start animation with random splats
  createRandomSplats();
});
