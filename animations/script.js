// Main script for the Impossible Box application

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Variables for Three.js
    let scene, camera, renderer, impossibleBox;
    let rotationSpeed = 0.005;
    let isRotating = false;
    
    // Variables for Tone.js
    let synth, zoomSynth;
    let lastZoomLevel = 5; // Default zoom level
    let lastRotationAngle = 0;
    
    // Variables for touch controls
    let hammer;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let zoomLevel = 5;
    let minZoom = 2;
    let maxZoom = 10;
    
    // Initialize the application
    init();
    animate();
    
    // Initialize the application
    function init() {
        // Initialize Three.js
        initThree();
        
        // Initialize Tone.js
        initTone();
        
        // Initialize touch controls
        initTouchControls();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').style.opacity = 0;
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 500);
        }, 1000);
    }
    
    // Initialize Three.js
    function initThree() {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x121212);
        
        // Create camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = zoomLevel;
        
        // Create renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('canvas-container').appendChild(renderer.domElement);
        
        // Create impossible box
        createImpossibleBox();
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
    }
    
    // Create the impossible box
    function createImpossibleBox() {
        // Group to hold all parts of the impossible box
        impossibleBox = new THREE.Group();
        
        // Material for the box edges
        const edgeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        
        // Create the impossible box structure
        // This is a simplified version of an impossible box (Penrose cube)
        
        // Create the front face edges
        createBoxEdge(-1, -1, 1, 2, 0, 0, edgeMaterial); // bottom edge
        createBoxEdge(-1, 1, 1, 2, 0, 0, edgeMaterial);  // top edge
        createBoxEdge(-1, -1, 1, 0, 2, 0, edgeMaterial); // left edge
        createBoxEdge(1, -1, 1, 0, 2, 0, edgeMaterial);  // right edge
        
        // Create the back face edges with the impossible connections
        createBoxEdge(-1, -1, -1, 2, 0, 0, edgeMaterial); // bottom edge
        createBoxEdge(-1, 1, -1, 2, 0, 0, edgeMaterial);  // top edge
        createBoxEdge(-1, -1, -1, 0, 2, 0, edgeMaterial); // left edge
        createBoxEdge(1, -1, -1, 0, 2, 0, edgeMaterial);  // right edge
        
        // Create the connecting edges with the impossible perspective
        createBoxEdge(-1, -1, 1, 0, 0, -1.5, edgeMaterial); // bottom-left
        createBoxEdge(1, -1, 1, 0, 0, -1.5, edgeMaterial);  // bottom-right
        createBoxEdge(-1, 1, 1, 0, 0, -1.5, edgeMaterial);  // top-left
        createBoxEdge(1, 1, 1, 0, 0, -1.5, edgeMaterial);   // top-right
        
        // Add some additional edges to create the impossible effect
        createBoxEdge(-1, -1, -0.5, 0, 0, 1.5, edgeMaterial); // additional edge
        createBoxEdge(1, -1, -0.5, 0, 0, 1.5, edgeMaterial);  // additional edge
        
        // Add the impossible box to the scene
        scene.add(impossibleBox);
    }
    
    // Helper function to create a box edge
    function createBoxEdge(x, y, z, width, height, depth, material) {
        const geometry = new THREE.BoxGeometry(
            width || 0.1, 
            height || 0.1, 
            depth || 0.1
        );
        const edge = new THREE.Mesh(geometry, material);
        edge.position.set(x, y, z);
        impossibleBox.add(edge);
        return edge;
    }
    
    // Initialize Tone.js
    function initTone() {
        // Create a synth for rotation sound
        synth = new Tone.Synth({
            oscillator: {
                type: 'sine'
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.5,
                release: 0.1
            }
        }).toDestination();
        synth.volume.value = -20; // Lower volume
        
        // Create a synth for zoom sound
        zoomSynth = new Tone.Synth({
            oscillator: {
                type: 'triangle'
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.3,
                release: 0.1
            }
        }).toDestination();
        zoomSynth.volume.value = -20; // Lower volume
    }
    
    // Initialize touch controls using Hammer.js
    function initTouchControls() {
        const element = renderer.domElement;
        hammer = new Hammer(element);
        
        // Enable pinch and rotate recognizers
        hammer.get('pinch').set({ enable: true });
        hammer.get('rotate').set({ enable: true });
        hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        
        // Handle pan for rotation
        hammer.on('panstart', () => {
            isRotating = true;
        });
        
        hammer.on('pan', (event) => {
            if (isRotating) {
                targetRotationY += event.velocityX * 0.3;
                targetRotationX += event.velocityY * 0.3;
                
                // Play rotation sound
                playRotationSound();
                
                // Trigger haptic feedback
                if (navigator.vibrate) {
                    navigator.vibrate(10);
                }
            }
        });
        
        hammer.on('panend', () => {
            isRotating = false;
        });
        
        // Handle pinch for zoom
        hammer.on('pinch', (event) => {
            // Calculate new zoom level
            const zoomChange = (1 - event.scale) * 0.5;
            zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + zoomChange));
            
            // Update camera position
            camera.position.z = zoomLevel;
            
            // Play zoom sound
            playZoomSound();
            
            // Trigger haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(15);
            }
        });
        
        // Handle double tap to reset
        hammer.on('doubletap', () => {
            resetView();
        });
    }
    
    // Play sound based on rotation
    function playRotationSound() {
        // Calculate rotation difference
        const rotationDiff = Math.abs(targetRotationX - currentRotationX) + 
                            Math.abs(targetRotationY - currentRotationY);
        
        // Only play sound if rotation is significant
        if (rotationDiff > 0.01) {
            // Map rotation to frequency
            const frequency = 220 + rotationDiff * 100;
            
            // Play sound
            if (Tone.context.state === 'running') {
                synth.triggerAttackRelease(frequency, '0.05');
            } else {
                // Start audio context on first user interaction
                Tone.start();
            }
        }
    }
    
    // Play sound based on zoom level
    function playZoomSound() {
        // Only play sound if zoom level changed significantly
        if (Math.abs(zoomLevel - lastZoomLevel) > 0.1) {
            // Map zoom level to frequency (higher zoom = higher pitch)
            const frequency = 440 + (maxZoom - zoomLevel) * 50;
            
            // Play sound
            if (Tone.context.state === 'running') {
                zoomSynth.triggerAttackRelease(frequency, '0.1');
            } else {
                // Start audio context on first user interaction
                Tone.start();
            }
            
            // Update last zoom level
            lastZoomLevel = zoomLevel;
        }
    }
    
    // Reset view to default
    function resetView() {
        targetRotationX = 0;
        targetRotationY = 0;
        zoomLevel = 5;
        camera.position.z = zoomLevel;
        
        // Trigger haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([30, 30, 30]);
        }
    }
    
    // Handle window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Smooth rotation
        currentRotationX += (targetRotationX - currentRotationX) * 0.1;
        currentRotationY += (targetRotationY - currentRotationY) * 0.1;
        
        // Apply rotation to the impossible box
        impossibleBox.rotation.x = currentRotationX;
        impossibleBox.rotation.y = currentRotationY;
        
        // Auto-rotation when not being manipulated
        if (!isRotating) {
            impossibleBox.rotation.y += rotationSpeed;
            targetRotationY += rotationSpeed;
        }
        
        // Render the scene
        renderer.render(scene, camera);
    }
});
