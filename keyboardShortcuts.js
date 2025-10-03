// Sistema de atajos de teclado profesional
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.modifierKeys = new Set();
        this.isEnabled = true;
        this.setupShortcuts();
        this.bindEvents();
    }

    setupShortcuts() {
        // Atajos básicos de edición
        this.register('ctrl+z', () => this.undo(), 'Deshacer');
        this.register('ctrl+y', () => this.redo(), 'Rehacer');
        this.register('ctrl+shift+z', () => this.redo(), 'Rehacer');
        
        // Navegación de imagen
        this.register('space', () => this.toggleBeforeAfter(), 'Comparar antes/después');
        this.register('ctrl+0', () => this.fitToScreen(), 'Ajustar a pantalla');
        this.register('ctrl+1', () => this.zoomActualSize(), 'Tamaño real (100%)');
        this.register('ctrl+plus', () => this.zoomIn(), 'Acercar');
        this.register('ctrl+minus', () => this.zoomOut(), 'Alejar');
        
        // Herramientas rápidas
        this.register('r', () => this.resetAdjustments(), 'Resetear ajustes');
        this.register('h', () => this.toggleHistogram(), 'Mostrar/ocultar histograma');
        this.register('l', () => this.toggleLayers(), 'Panel de capas');
        this.register('ctrl+l', () => this.addAdjustmentLayer(), 'Nueva capa de ajuste');
        
        // Ajustes rápidos
        this.register('e', () => this.quickAdjust('exposure', 10), 'Aumentar exposición');
        this.register('shift+e', () => this.quickAdjust('exposure', -10), 'Reducir exposición');
        this.register('c', () => this.quickAdjust('contrast', 10), 'Aumentar contraste');
        this.register('shift+c', () => this.quickAdjust('contrast', -10), 'Reducir contraste');
        this.register('s', () => this.quickAdjust('saturation', 10), 'Aumentar saturación');
        this.register('shift+s', () => this.quickAdjust('saturation', -10), 'Reducir saturación');
        
        // Presets rápidos
        this.register('1', () => this.applyPreset('dramatic'), 'Preset dramático');
        this.register('2', () => this.applyPreset('golden'), 'Preset golden hour');
        this.register('3', () => this.applyPreset('cinematic'), 'Preset cinematográfico');
        this.register('4', () => this.applyPreset('soft'), 'Preset suave');
        this.register('5', () => this.applyPreset('vintage'), 'Preset vintage');
        
        // Exportación
        this.register('ctrl+s', () => this.savePreset(), 'Guardar preset');
        this.register('ctrl+e', () => this.exportImage(), 'Exportar imagen');
        this.register('ctrl+shift+e', () => this.exportXMP(), 'Exportar XMP');
        
        // Navegación de galería
        this.register('arrowleft', () => this.previousImage(), 'Imagen anterior');
        this.register('arrowright', () => this.nextImage(), 'Imagen siguiente');
        
        // Pantalla completa
        this.register('f', () => this.toggleFullscreen(), 'Pantalla completa');
        this.register('escape', () => this.exitFullscreen(), 'Salir pantalla completa');
        
        // Ayuda
        this.register('ctrl+/', () => this.showShortcuts(), 'Mostrar atajos');
        this.register('?', () => this.showShortcuts(), 'Mostrar atajos');
    }

    register(combination, callback, description) {
        const normalized = this.normalizeShortcut(combination);
        this.shortcuts.set(normalized, { callback, description, combination });
    }

    normalizeShortcut(combination) {
        return combination.toLowerCase()
            .replace(/\s+/g, '')
            .split('+')
            .sort((a, b) => {
                const order = ['ctrl', 'alt', 'shift', 'meta'];
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return a.localeCompare(b);
            })
            .join('+');
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;
            
            // Ignorar si está escribiendo en un input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
                return;
            }

            const combination = this.getKeyCombination(e);
            const shortcut = this.shortcuts.get(combination);
            
            if (shortcut) {
                e.preventDefault();
                e.stopPropagation();
                shortcut.callback();
                this.showShortcutFeedback(shortcut.description);
            }
        });

        document.addEventListener('keyup', (e) => {
            this.modifierKeys.delete(e.key.toLowerCase());
        });
    }

    getKeyCombination(e) {
        const keys = [];
        
        if (e.ctrlKey) keys.push('ctrl');
        if (e.altKey) keys.push('alt');
        if (e.shiftKey) keys.push('shift');
        if (e.metaKey) keys.push('meta');
        
        const key = e.key.toLowerCase();
        if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
            keys.push(key === ' ' ? 'space' : key);
        }
        
        return keys.join('+');
    }

    showShortcutFeedback(description) {
        const feedback = document.getElementById('shortcutFeedback') || this.createFeedbackElement();
        feedback.textContent = description;
        feedback.classList.add('show');
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 1500);
    }

    createFeedbackElement() {
        const feedback = document.createElement('div');
        feedback.id = 'shortcutFeedback';
        feedback.className = 'shortcut-feedback';
        document.body.appendChild(feedback);
        return feedback;
    }

    showShortcuts() {
        const modal = document.getElementById('shortcutsModal') || this.createShortcutsModal();
        modal.classList.add('show');
    }

    createShortcutsModal() {
        const modal = document.createElement('div');
        modal.id = 'shortcutsModal';
        modal.className = 'shortcuts-modal';
        
        const content = document.createElement('div');
        content.className = 'shortcuts-content';
        
        const header = document.createElement('div');
        header.className = 'shortcuts-header';
        header.innerHTML = `
            <h3>Atajos de Teclado</h3>
            <button class="close-shortcuts">×</button>
        `;
        
        const body = document.createElement('div');
        body.className = 'shortcuts-body';
        
        // Agrupar atajos por categoría
        const categories = {
            'Edición': ['ctrl+z', 'ctrl+y', 'r'],
            'Navegación': ['space', 'ctrl+0', 'ctrl+1', 'arrowleft', 'arrowright'],
            'Ajustes': ['e', 'shift+e', 'c', 'shift+c', 's', 'shift+s'],
            'Presets': ['1', '2', '3', '4', '5'],
            'Herramientas': ['h', 'l', 'ctrl+l', 'f'],
            'Exportación': ['ctrl+s', 'ctrl+e', 'ctrl+shift+e']
        };
        
        Object.entries(categories).forEach(([category, shortcuts]) => {
            const section = document.createElement('div');
            section.className = 'shortcut-section';
            
            const title = document.createElement('h4');
            title.textContent = category;
            section.appendChild(title);
            
            shortcuts.forEach(shortcut => {
                const item = this.shortcuts.get(shortcut);
                if (item) {
                    const row = document.createElement('div');
                    row.className = 'shortcut-row';
                    row.innerHTML = `
                        <span class="shortcut-key">${this.formatShortcut(item.combination)}</span>
                        <span class="shortcut-desc">${item.description}</span>
                    `;
                    section.appendChild(row);
                }
            });
            
            body.appendChild(section);
        });
        
        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Event listeners
        header.querySelector('.close-shortcuts').addEventListener('click', () => {
            modal.classList.remove('show');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
        
        return modal;
    }

    formatShortcut(combination) {
        return combination
            .split('+')
            .map(key => {
                const keyMap = {
                    'ctrl': 'Ctrl',
                    'alt': 'Alt',
                    'shift': 'Shift',
                    'meta': 'Cmd',
                    'space': 'Space',
                    'arrowleft': '←',
                    'arrowright': '→',
                    'arrowup': '↑',
                    'arrowdown': '↓'
                };
                return keyMap[key] || key.toUpperCase();
            })
            .join(' + ');
    }

    // Implementaciones de las funciones de atajo
    undo() {
        if (window.historyManager) {
            window.historyManager.undo();
        }
    }

    redo() {
        if (window.historyManager) {
            window.historyManager.redo();
        }
    }

    toggleBeforeAfter() {
        if (window.appState) {
            window.appState.showingOriginal = !window.appState.showingOriginal;
            if (window.drawPreview) window.drawPreview();
        }
    }

    fitToScreen() {
        if (window.fitImageToCanvas) window.fitImageToCanvas();
    }

    zoomActualSize() {
        if (window.setZoom) window.setZoom(1);
    }

    zoomIn() {
        if (window.adjustZoom) window.adjustZoom(0.1);
    }

    zoomOut() {
        if (window.adjustZoom) window.adjustZoom(-0.1);
    }

    resetAdjustments() {
        if (window.resetAllAdjustments) window.resetAllAdjustments();
    }

    toggleHistogram() {
        const histogram = document.getElementById('histogramPanel');
        if (histogram) {
            histogram.style.display = histogram.style.display === 'none' ? 'block' : 'none';
        }
    }

    toggleLayers() {
        const layers = document.getElementById('layerPanel');
        if (layers) {
            layers.style.display = layers.style.display === 'none' ? 'block' : 'none';
        }
    }

    addAdjustmentLayer() {
        if (window.layerSystem) {
            window.layerSystem.addAdjustmentLayer('curves', 'Curvas');
        }
    }

    quickAdjust(property, amount) {
        const slider = document.getElementById(property);
        if (slider) {
            const currentValue = parseFloat(slider.value);
            const newValue = Math.max(slider.min, Math.min(slider.max, currentValue + amount));
            slider.value = newValue;
            slider.dispatchEvent(new Event('input'));
        }
    }

    applyPreset(presetName) {
        const allowedPresets = ['dramatic', 'golden', 'cinematic', 'soft', 'vintage'];
        if (allowedPresets.includes(presetName) && window.applyPresetByName) {
            window.applyPresetByName(presetName);
        }
    }

    savePreset() {
        const saveBtn = document.querySelector('[onclick*="savePreset"]');
        if (saveBtn) saveBtn.click();
    }

    exportImage() {
        const exportBtn = document.querySelector('[onclick*="exportImage"]');
        if (exportBtn) exportBtn.click();
    }

    exportXMP() {
        const xmpBtn = document.querySelector('[onclick*="downloadXMP"]');
        if (xmpBtn) xmpBtn.click();
    }

    previousImage() {
        if (window.previousImage) window.previousImage();
    }

    nextImage() {
        if (window.nextImage) window.nextImage();
    }

    toggleFullscreen() {
        if (window.toggleFullscreen) window.toggleFullscreen();
    }

    exitFullscreen() {
        const overlay = document.querySelector('.fullscreen-overlay.show');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}

// Inicializar sistema de atajos
window.keyboardShortcuts = new KeyboardShortcuts();