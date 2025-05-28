// Aurora Animation Effect
document.addEventListener('DOMContentLoaded', function() {
  // Create and append canvas to the hero section
  const hero = document.querySelector('.hero');
  const canvas = document.createElement('canvas');
  canvas.id = 'aurora-canvas';
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
  hero.style.position = 'relative';
  hero.style.overflow = 'hidden';
  hero.prepend(canvas);

  // WebGL setup
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    console.warn('WebGL not supported. Aurora effect disabled.');
    return;
  }

  // Vertex shader
  const vertShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader
  const fragShaderSource = `
    precision highp float;
    
    uniform float u_time;
    uniform float u_amplitude;
    uniform vec3 u_colorStops[3];
    uniform vec2 u_resolution;
    uniform float u_blend;
    
    // Simplex noise functions
    vec3 permute(vec3 x) {
      return mod(((x*34.0)+1.0)*x, 289.0);
    }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                  -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    // Color interpolation
    vec3 lerpColor(vec3 color1, vec3 color2, float factor) {
      return mix(color1, color2, factor);
    }
    
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      
      // Color gradient based on x position
      float gradientPos = uv.x;
      vec3 color;
      
      if (gradientPos < 0.5) {
        color = lerpColor(u_colorStops[0], u_colorStops[1], gradientPos * 2.0);
      } else {
        color = lerpColor(u_colorStops[1], u_colorStops[2], (gradientPos - 0.5) * 2.0);
      }
      
      // Create aurora wave effect
      float height = snoise(vec2(uv.x * 2.0 + u_time * 0.1, u_time * 0.25)) * 0.5 * u_amplitude;
      height = exp(height);
      height = (uv.y * 2.0 - height + 0.2);
      float intensity = 0.6 * height;
      
      // Control the transition area
      float midPoint = 0.20;
      float auroraAlpha = smoothstep(midPoint - u_blend * 0.5, midPoint + u_blend * 0.5, intensity);
      
      vec3 auroraColor = intensity * color;
      
      // Output color with transparency
      gl_FragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
    }
  `;

  // Compile shaders
  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
  const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);

  // Create program
  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    return;
  }

  // Set up vertices for a full-screen quad (two triangles)
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = [
    -1, -1,  // bottom left
     1, -1,  // bottom right
    -1,  1,  // top left
     1,  1,  // top right
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Set up attributes and uniforms
  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
  const amplitudeUniformLocation = gl.getUniformLocation(program, 'u_amplitude');
  const colorStopsUniformLocation = gl.getUniformLocation(program, 'u_colorStops');
  const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
  const blendUniformLocation = gl.getUniformLocation(program, 'u_blend');

  // Configure animation parameters
  const config = {
    colorStops: [
      [0.0, 0.847, 1.0],  // #00D8FF - Light blue
      [0.486, 1.0, 0.404], // #7CFF67 - Light green
      [0.0, 0.847, 1.0]    // #00D8FF - Light blue again
    ],
    amplitude: 1.0,
    blend: 0.5
  };

  // Handle resize
  function resizeCanvas() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }
  
  // Animation loop
  let startTime = performance.now();
  function render() {
    // Update time
    const currentTime = performance.now();
    const elapsedTime = (currentTime - startTime) / 1000; // convert to seconds
    
    // Resize canvas if needed
    resizeCanvas();
    
    // Set up WebGL state
    gl.useProgram(program);
    
    // Enable the position attribute
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    gl.uniform1f(timeUniformLocation, elapsedTime);
    gl.uniform1f(amplitudeUniformLocation, config.amplitude);
    gl.uniform3fv(colorStopsUniformLocation, new Float32Array(config.colorStops.flat()));
    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform1f(blendUniformLocation, config.blend);
    
    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    
    // Draw the triangles
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Request next frame
    requestAnimationFrame(render);
  }

  // Start the animation
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  render();
});
