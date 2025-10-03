// Minimal zoom system to fix JavaScript errors
(function() {
    'use strict';
    
    let currentZoom = 1;
    const MIN_ZOOM = 0.2;
    const MAX_ZOOM = 5;
    
    function initZoom() {
        const canvas = document.getElementById('canvas');
        const container = document.querySelector('.canvas-container');
        
        if (!canvas || !container) return;
        
        // Mouse wheel zoom
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, currentZoom * delta));
            
            if (newZoom !== currentZoom) {
                currentZoom = newZoom;
                canvas.style.transform = `scale(${currentZoom})`;
                
                if (currentZoom > 1) {
                    container.classList.add('zoomed');
                    canvas.style.cursor = 'grab';
                } else {
                    container.classList.remove('zoomed');
                    canvas.style.cursor = 'default';
                }
            }
        });
        
        // Global zoom system
        window.zoomSystem = {
            currentZoom: () => currentZoom,
            fitToScreen: () => {
                currentZoom = 1;
                canvas.style.transform = 'scale(1)';
                container.classList.remove('zoomed');
                canvas.style.cursor = 'default';
            },
            actualSize: () => {
                currentZoom = 1;
                canvas.style.transform = 'scale(1)';
                container.classList.remove('zoomed');
                canvas.style.cursor = 'default';
            },
            zoomIn: () => {
                const newZoom = Math.min(currentZoom * 1.2, MAX_ZOOM);
                if (newZoom !== currentZoom) {
                    currentZoom = newZoom;
                    canvas.style.transform = `scale(${currentZoom})`;
                    if (currentZoom > 1) {
                        container.classList.add('zoomed');
                        canvas.style.cursor = 'grab';
                    }
                }
            },
            zoomOut: () => {
                const newZoom = Math.max(currentZoom / 1.2, MIN_ZOOM);
                if (newZoom !== currentZoom) {
                    currentZoom = newZoom;
                    canvas.style.transform = `scale(${currentZoom})`;
                    if (currentZoom <= 1) {
                        container.classList.remove('zoomed');
                        canvas.style.cursor = 'default';
                    }
                }
            }
        };
        
        // Compatibility
        window.zoomManager = window.zoomSystem;
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initZoom);
    } else {
        initZoom();
    }
})();