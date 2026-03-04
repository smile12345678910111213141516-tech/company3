document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Set Active Nav Link --- */
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        // Remove active class from all
        link.classList.remove('active');
        // Check if the link's href matches the current URL 
        // (Fallback to index if currentPath is root '/')
        if (currentPath.endsWith(link.getAttribute('href')) || (currentPath === '/' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });

    /* --- 2. Mobile Menu Toggle --- */
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-links');

    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('show');
        });
    }

    /* --- 3. Contact Form Handler (Only runs on contact page) --- */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            contactForm.style.display = 'none';
            document.getElementById('form-success').style.display = 'block';
        });
    }

    /* --- 4. 3D Parametric Vortex Background Generator --- */
    function generateVortexBackground() {
        const svg = document.getElementById('vortex-bg');
        if (!svg) return; // Fail gracefully if background div is missing

        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Ensure SVG is large enough to cover corners when rotating
        const renderSize = Math.ceil(Math.sqrt(w * w + h * h) * 1.1); 
        
        svg.setAttribute('width', renderSize);
        svg.setAttribute('height', renderSize);
        svg.setAttribute('viewBox', `0 0 ${renderSize} ${renderSize}`);
        
        svg.innerHTML = ''; 

        const cx = renderSize / 2;
        const cy = renderSize / 2;
        
        // Grid geometry parameters
        const U_STEPS = 70; // Segments around
        const V_STEPS = 65; // Depth rings
        const R_MIN = 20;
        const R_MAX = renderSize / 2; 
        const TWIST = 4.5; 
        
        // Generate Gradients
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const numGrads = 36;
        for(let i = 0; i < numGrads; i++) {
            const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            grad.id = `vortexGrad${i}`;
            const angle = (i / numGrads) * Math.PI * 2;
            
            grad.setAttribute('x1', 50 - Math.cos(angle) * 50 + '%');
            grad.setAttribute('y1', 50 - Math.sin(angle) * 50 + '%');
            grad.setAttribute('x2', 50 + Math.cos(angle) * 50 + '%');
            grad.setAttribute('y2', 50 + Math.sin(angle) * 50 + '%');
            
            const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            s1.setAttribute('offset', '0%');
            s1.setAttribute('stop-color', '#dddddd'); // Highlight
            
            const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            s2.setAttribute('offset', '40%');
            s2.setAttribute('stop-color', '#444444'); // Mid tone
            
            const s3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
            s3.setAttribute('offset', '100%');
            s3.setAttribute('stop-color', '#050505'); // Shadow
            
            grad.appendChild(s1);
            grad.appendChild(s2);
            grad.appendChild(s3);
            defs.appendChild(grad);
        }
        svg.appendChild(defs);

        // Generate points
        const points = [];
        for (let j = 0; j <= V_STEPS; j++) {
            const t = j / V_STEPS;
            const r = R_MIN * Math.pow(R_MAX / R_MIN, Math.pow(t, 1.2));
            const rowOffset = (j % 2 === 0) ? 0 : (Math.PI * 2 / U_STEPS) / 2;
            
            const rowPoints = [];
            for (let i = 0; i < U_STEPS; i++) {
                let u = (i / U_STEPS) * Math.PI * 2 + rowOffset;
                u -= TWIST * t;
                
                const x = cx + r * Math.cos(u);
                const y = cy + r * Math.sin(u);
                rowPoints.push({x, y});
            }
            points.push(rowPoints);
        }
        
        // Draw quads
        for (let j = 0; j < V_STEPS; j++) {
            for (let i = 0; i < U_STEPS; i++) {
                const p1 = points[j][i];             
                const p2 = points[j][(i + 1) % U_STEPS]; 
                const p3 = points[j + 1][(i + 1) % U_STEPS]; 
                const p4 = points[j + 1][i];
                
                const midX_inner = (p1.x + p2.x) / 2;
                const midY_inner = (p1.y + p2.y) / 2;
                const midX_outer = (p3.x + p4.x) / 2;
                const midY_outer = (p3.y + p4.y) / 2;
                
                let angle = Math.atan2(midY_outer - midY_inner, midX_outer - midX_inner);
                if(angle < 0) angle += Math.PI * 2;
                
                const gradIndex = Math.floor((angle / (Math.PI * 2)) * numGrads) % numGrads;
                
                const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                poly.setAttribute('points', `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y} ${p4.x},${p4.y}`);
                poly.setAttribute('fill', `url(#vortexGrad${gradIndex})`);
                poly.setAttribute('stroke', '#000000');
                poly.setAttribute('stroke-width', '1.5');
                poly.setAttribute('stroke-linejoin', 'round');
                
                svg.appendChild(poly);
            }
        }
    }

    // Run Generator & Add Resize Listener
    generateVortexBackground();
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(generateVortexBackground, 200);
    });

});