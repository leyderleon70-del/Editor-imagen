// Sistema Profesional de Control de Colores con Detección Precisa
class ColorControlSystem {
    constructor() {
        this.currentColor = 'all';
        this.values = {
            all: { hue: 0, saturation: 0, luminance: 0 },
            red: { hue: 0, saturation: 0, luminance: 0 },
            orange: { hue: 0, saturation: 0, luminance: 0 },
            yellow: { hue: 0, saturation: 0, luminance: 0 },
            green: { hue: 0, saturation: 0, luminance: 0 },
            aqua: { hue: 0, saturation: 0, luminance: 0 },
            blue: { hue: 0, saturation: 0, luminance: 0 },
            purple: { hue: 0, saturation: 0, luminance: 0 },
            magenta: { hue: 0, saturation: 0, luminance: 0 }
        };
        
        // Rangos de color profesionales con transiciones suaves
        this.colorRanges = {
            red: { center: 0, range: 30, falloff: 15 },
            orange: { center: 30, range: 30, falloff: 15 },
            yellow: { center: 60, range: 30, falloff: 15 },
            green: { center: 120, range: 60, falloff: 20 },
            aqua: { center: 180, range: 30, falloff: 15 },
            blue: { center: 240, range: 60, falloff: 20 },
            purple: { center: 270, range: 30, falloff: 15 },
            magenta: { center: 315, range: 30, falloff: 15 }
        };
        
        this.onUpdate = null;
    }
    
    init(container, updateCallback) {
        this.onUpdate = updateCallback;
        this.createColorTabs(container);
        this.createColorSliders(container);
        this.bindEvents();
    }
    
    createColorTabs(container) {
        const tabsContainer = container.querySelector('.color-tabs');
        if (!tabsContainer) return;
        
        const colors = ['all', 'red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'];
        const labels = ['Todo', 'Rojos', 'Naranjas', 'Amarillos', 'Verdes', 'Aguamarinas', 'Azules', 'Púrpuras', 'Magentas'];
        
        // Clear container safely
        while (tabsContainer.firstChild) {
            tabsContainer.removeChild(tabsContainer.firstChild);
        }
        
        colors.forEach((color, index) => {
            const tab = document.createElement('button');
            tab.className = `color-tab ${color === 'all' ? 'active' : ''}`;
            tab.dataset.color = this.sanitizeColorName(color);
            tab.textContent = labels[index];
            tabsContainer.appendChild(tab);
        });
    }
    
    createColorSliders(container) {
        const slidersContainer = container.querySelector('.color-sliders-container');
        if (!slidersContainer) {
            console.error('Color sliders container not found');
            return;
        }
        
        const sliders = [
            { id: 'hue', label: 'Matiz', min: -100, max: 100 },
            { id: 'saturation', label: 'Saturación', min: -100, max: 100 },
            { id: 'luminance', label: 'Luminancia', min: -100, max: 100 }
        ];
        
        // Clear container safely
        while (slidersContainer.firstChild) {
            slidersContainer.removeChild(slidersContainer.firstChild);
        }
        
        sliders.forEach(cfg => {
            const row = document.createElement('div');
            row.className = 'color-slider-row';
            
            const label = document.createElement('label');
            label.className = 'label';
            label.textContent = cfg.label;
            
            const input = document.createElement('input');
            input.type = 'range';
            input.id = `color-${cfg.id}`;
            input.min = cfg.min;
            input.max = cfg.max;
            input.step = '1';
            input.value = '0';
            
            const valueDiv = document.createElement('div');
            valueDiv.className = 'value';
            valueDiv.textContent = '0';
            
            const resetBtn = document.createElement('button');
            resetBtn.className = 'reset-btn';
            resetBtn.dataset.slider = cfg.id;
            resetBtn.textContent = '↺';
            
            row.appendChild(label);
            row.appendChild(input);
            row.appendChild(valueDiv);
            row.appendChild(resetBtn);
            
            slidersContainer.appendChild(row);
        });
        
        console.log('Color sliders created:', sliders.length);
    }
    
    bindEvents() {
        // Tabs
        document.querySelectorAll('.color-tab').forEach(tab => {
            if (!tab.parentElement) return;
            tab.addEventListener('click', () => {
                document.querySelectorAll('.color-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const colorName = this.sanitizeColorName(tab.dataset.color);
                if (this.values.hasOwnProperty(colorName)) {
                    this.currentColor = colorName;
                    this.updateSliders();
                }
            });
        });
        
        // Sliders
        document.querySelectorAll('.color-sliders-container input[type="range"]').forEach(slider => {
            if (!slider.parentElement) return;
            slider.addEventListener('input', () => {
                const property = this.sanitizeProperty(slider.id.replace('color-', ''));
                const value = this.clampValue(parseInt(slider.value), -100, 100);
                
                console.log(`Color slider changed: ${this.currentColor}.${property} = ${value}`);
                
                if (this.values[this.currentColor] && this.values[this.currentColor].hasOwnProperty(property)) {
                    this.values[this.currentColor][property] = value;
                }
                
                const valueDisplay = slider.parentElement.querySelector('.value');
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
                
                if (this.onUpdate) {
                    console.log('Triggering color update callback');
                    this.onUpdate();
                }
            });
        });
        
        // Reset buttons
        document.querySelectorAll('.color-sliders-container .reset-btn').forEach(btn => {
            if (!btn.parentElement) return;
            btn.addEventListener('click', () => {
                const property = this.sanitizeProperty(btn.dataset.slider);
                const slider = document.getElementById(`color-${property}`);
                
                if (this.values[this.currentColor] && this.values[this.currentColor].hasOwnProperty(property)) {
                    this.values[this.currentColor][property] = 0;
                }
                
                if (slider) {
                    slider.value = 0;
                }
                
                const valueDisplay = btn.parentElement.querySelector('.value');
                if (valueDisplay) {
                    valueDisplay.textContent = '0';
                }
                
                if (this.onUpdate) this.onUpdate();
            });
        });
    }
    
    updateSliders() {
        const currentValues = this.values[this.currentColor];
        
        ['hue', 'saturation', 'luminance'].forEach(property => {
            const slider = document.getElementById(`color-${property}`);
            const valueDisplay = slider.parentElement.querySelector('.value');
            
            slider.value = currentValues[property];
            valueDisplay.textContent = currentValues[property];
        });
    }
    
    // Función de peso profesional con transiciones suaves
    getColorWeight(hue, saturation, colorName) {
        if (colorName === 'all') return 1.0;
        
        const range = this.colorRanges[colorName];
        if (!range) return 0;
        
        // Normalizar matiz a 0-360
        let normalizedHue = hue;
        while (normalizedHue < 0) normalizedHue += 360;
        while (normalizedHue >= 360) normalizedHue -= 360;
        
        // Calcular distancia angular
        let distance = Math.abs(normalizedHue - range.center);
        if (distance > 180) distance = 360 - distance;
        
        // Peso basado en proximidad al centro del color
        let weight = 0;
        if (distance <= range.range / 2) {
            weight = 1.0;
        } else if (distance <= range.range / 2 + range.falloff) {
            const falloffDistance = distance - range.range / 2;
            weight = Math.cos((falloffDistance / range.falloff) * Math.PI / 2);
        }
        
        // Modular por saturación (colores más saturados son más específicos)
        const saturationFactor = Math.min(1.0, saturation / 0.3);
        return weight * saturationFactor;
    }
    
    // Conversión RGB a HSL profesional
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : (max + min !== 0 ? d / (max + min) : 0);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s, l];
    }
    
    // Conversión HSL a RGB profesional
    hslToRgb(h, s, l) {
        h /= 360;
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        return [r * 255, g * 255, b * 255];
    }
    
    // Procesamiento profesional por píxel
    processPixel(r, g, b) {
        const [h, s, l] = this.rgbToHsl(r, g, b);
        let newR = r, newG = g, newB = b;
        
        // Aplicar ajustes globales
        const allAdj = this.values.all;
        if (allAdj.hue !== 0 || allAdj.saturation !== 0 || allAdj.luminance !== 0) {
            let newH = h, newS = s, newL = l;
            
            if (allAdj.hue !== 0) {
                newH = (h + allAdj.hue * 3.6) % 360;
                if (newH < 0) newH += 360;
            }
            
            if (allAdj.saturation !== 0) {
                newS = Math.max(0, Math.min(1, s * (1 + allAdj.saturation / 100)));
            }
            
            if (allAdj.luminance !== 0) {
                newL = Math.max(0, Math.min(1, l * (1 + allAdj.luminance / 100)));
            }
            
            [newR, newG, newB] = this.hslToRgb(newH, newS, newL);
        }
        
        // Aplicar ajustes selectivos
        Object.keys(this.colorRanges).forEach(colorName => {
            const adj = this.values[colorName];
            if (adj.hue === 0 && adj.saturation === 0 && adj.luminance === 0) return;
            
            const weight = this.getColorWeight(h, s, colorName);
            if (weight <= 0.01) return;
            
            const [currentH, currentS, currentL] = this.rgbToHsl(newR, newG, newB);
            let adjustedH = currentH, adjustedS = currentS, adjustedL = currentL;
            
            if (adj.hue !== 0) {
                const hueShift = adj.hue * 3.6 * weight;
                adjustedH = (currentH + hueShift) % 360;
                if (adjustedH < 0) adjustedH += 360;
            }
            
            if (adj.saturation !== 0) {
                const satFactor = 1 + (adj.saturation / 100) * weight;
                adjustedS = Math.max(0, Math.min(1, currentS * satFactor));
            }
            
            if (adj.luminance !== 0) {
                const lumFactor = 1 + (adj.luminance / 100) * weight;
                adjustedL = Math.max(0, Math.min(1, currentL * lumFactor));
            }
            
            [newR, newG, newB] = this.hslToRgb(adjustedH, adjustedS, adjustedL);
        });
        
        return [
            Math.max(0, Math.min(255, Math.round(newR))),
            Math.max(0, Math.min(255, Math.round(newG))),
            Math.max(0, Math.min(255, Math.round(newB)))
        ];
    }
    
    reset() {
        Object.keys(this.values).forEach(color => {
            this.values[color] = { hue: 0, saturation: 0, luminance: 0 };
        });
        this.currentColor = 'all';
        this.updateSliders();
    }
    
    sanitizeColorName(color) {
        const allowedColors = ['all', 'red', 'orange', 'yellow', 'green', 'aqua', 'blue', 'purple', 'magenta'];
        return allowedColors.includes(color) ? color : 'all';
    }
    
    sanitizeProperty(property) {
        const allowedProperties = ['hue', 'saturation', 'luminance'];
        return allowedProperties.includes(property) ? property : 'hue';
    }
    
    clampValue(value, min, max) {
        return Math.max(min, Math.min(max, isNaN(value) ? 0 : value));
    }
    
    getValues() {
        return { ...this.values };
    }
    
    setValues(values) {
        if (values && typeof values === 'object') {
            this.values = { ...values };
            this.updateSliders();
        }
    }
}

// Exportar para uso global
window.ColorControlSystem = ColorControlSystem;