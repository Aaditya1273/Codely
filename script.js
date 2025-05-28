document.addEventListener('DOMContentLoaded', function() {
    // Blur Text Animation for the title
    const animateBlurText = (elementId, text, animateBy = 'words', direction = 'top', delay = 50) => {
        const container = document.getElementById(elementId);
        if (!container) return;
        
        // Clear any existing content
        container.innerHTML = '';
        
        // Split text into words or characters
        const elements = animateBy === 'words' ? text.split(' ') : text.split('');
        
        // Default animation settings
        const fromStyles = direction === 'top' ?
            { filter: 'blur(10px)', opacity: 0, transform: 'translateY(-50px)' } :
            { filter: 'blur(10px)', opacity: 0, transform: 'translateY(50px)' };
            
        const steps = [
            { filter: 'blur(5px)', opacity: 0.5, transform: `translateY(${direction === 'top' ? '5px' : '-5px'})` },
            { filter: 'blur(0px)', opacity: 1, transform: 'translateY(0)' }
        ];
        
        // Create and append spans for each element (word or character)
        elements.forEach((segment, index) => {
            const span = document.createElement('span');
            span.style.display = 'inline-block';
            span.style.willChange = 'transform, filter, opacity';
            span.style.filter = fromStyles.filter;
            span.style.opacity = fromStyles.opacity;
            span.style.transform = fromStyles.transform;
            span.style.transition = `filter 0.7s ease, opacity 0.7s ease, transform 0.7s ease`;
            span.style.transitionDelay = `${index * delay}ms`;
            
            // Handle spaces properly
            span.textContent = segment === ' ' ? '\u00A0' : segment;
            if (animateBy === 'words' && index < elements.length - 1) {
                span.textContent += '\u00A0'; // Add space after words except the last one
            }
            
            container.appendChild(span);
            
            // Trigger animation after a short delay to ensure initial styles are applied
            setTimeout(() => {
                // Animate through steps
                const animateSteps = (stepIndex) => {
                    if (stepIndex >= steps.length) return;
                    
                    const step = steps[stepIndex];
                    span.style.filter = step.filter;
                    span.style.opacity = step.opacity;
                    span.style.transform = step.transform;
                    
                    // Move to next step after transition completes
                    setTimeout(() => {
                        animateSteps(stepIndex + 1);
                    }, 350); // Duration for each step
                };
                
                // Start animation sequence
                animateSteps(0);
            }, 10);
        });
    };
    
    // Animate all titles when they come into view
    const animateTitles = () => {
        // Main title
        animateBlurText('animated-title', 'The Ultimate AI Code Editor', 'words', 'top', 100);
        
        // Other section titles with observer
        const sectionTitles = [
            { id: 'tab-title', text: 'Tab, tab, tab' },
            { id: 'natural-language-title', text: 'Edit in natural language' },
            { id: 'build-faster-title', text: 'Build software faster' }
        ];
        
        sectionTitles.forEach(({ id, text }) => {
            const titleElement = document.getElementById(id);
            if (!titleElement) return;
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateBlurText(id, text, 'words', 'top', 100);
                        observer.unobserve(titleElement);
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(titleElement);
        });
    };
    
    // Call the function to animate all titles
    animateTitles();
    
    // Handle feature card videos
    const handleFeatureVideos = () => {
        const featureVideos = document.querySelectorAll('.card-image video');
        
        featureVideos.forEach(video => {
            // Create intersection observer for each video
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    // Play video when it enters viewport
                    if (entry.isIntersecting) {
                        video.play();
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.5 }); // 50% of the video needs to be visible
            
            observer.observe(video);
            
            // Ensure video is muted and loops
            video.muted = true;
            video.loop = true;
        });
    };
    
    // Initialize video handling
    handleFeatureVideos();

    // Add sample code to the code window with animation
    const codeContent = document.querySelector('.code-content');
    if (codeContent) {
        const codeSample = `
<div class="code-line" style="--line-index: 0"><span class="keyword">function</span> <span class="function">processCode</span>(code, options) {</div>
<div class="code-line" style="--line-index: 1">  <span class="comment">// Helper function to read a length-prefixed string</span></div>
<div class="code-line highlight" style="--line-index: 2">  <span class="keyword">const</span> <span class="variable">len</span> = <span class="function">readInt</span>(buf, <span class="variable">offset</span>);</div>
<div class="code-line" style="--line-index: 3">  <span class="keyword">if</span> (len > <span class="variable">MAX_STRING_LENGTH</span>) {</div>
<div class="code-line" style="--line-index: 4">    <span class="keyword">throw</span> <span class="keyword">new</span> <span class="type">ProtocolError</span>(<span class="string">"Maximum string length exceeded"</span>);</div>
<div class="code-line" style="--line-index: 5">  }</div>
<div class="code-line" style="--line-index: 6">  </div>
<div class="code-line" style="--line-index: 7">  <span class="keyword">let</span> <span class="variable">sanitized_bytes</span> = <span class="function">encode</span>(<span class="variable">bytes</span>.<span class="function">filter</span>(b => b != 0));</div>
<div class="code-line" style="--line-index: 8">  </div>
<div class="code-line" style="--line-index: 9">  <span class="keyword">return</span> <span class="type">String</span>.<span class="function">from_utf8</span>(<span class="variable">sanitized_bytes</span>);</div>
<div class="code-line" style="--line-index: 10">}</div>
`;
        codeContent.innerHTML = codeSample;
        
        // Add typing animation to the highlighted line after a delay
        setTimeout(() => {
            const highlightedLine = document.querySelector('.code-line.highlight');
            if (highlightedLine) {
                const content = highlightedLine.innerHTML;
                highlightedLine.innerHTML = '';
                let i = 0;
                
                function typeWriter() {
                    if (i < content.length) {
                        highlightedLine.innerHTML += content.charAt(i);
                        i++;
                        setTimeout(typeWriter, 30);
                    }
                }
                
                typeWriter();
            }
        }, 2000);
    }

    // Add animation classes to elements as they come into view
    const animateOnScroll = function() {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (sectionTop < windowHeight * 0.85) {
                section.classList.add('animate-fade-in');
            }
        });
    };

    // Run once on load
    animateOnScroll();
    
    // Then on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Mobile menu toggle (placeholder for potential hamburger menu)
    const logo = document.querySelector('.logo');
    const navLinks = document.querySelector('.nav-links');
    
    if (logo && navLinks) {
        // This is just a placeholder for mobile menu toggle functionality
        // In a real implementation, you would have a hamburger icon
        logo.addEventListener('dblclick', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.3)';
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
});
