// Sistema de Control de Colores Simplificado y Funcional
class ColorControlSystemFixed {
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
        this.setupEventListeners();
        this.updateSliderColors();
        console.log('ColorControlSystemFixed initialized');
    }
    
    setupEventListeners() {
        // Tabs de colores
        document.querySelectorAll('.color-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.color-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentColor = tab.dataset.color;
                this.updateSliders();
                this.updateSliderColors();
                console.log('Color tab changed to:', this.currentColor);
            });
        });
        
        // Sliders de control ultra-optimizados
        let updateTimeout = null;
        let isProcessing = false;
        
        document.querySelectorAll('#colorSlidersContainer input[type="range"]').forEach(slider => {
            slider.addEventListener('input', () => {
                const property = slider.id.replace('color-', '');
                const value = parseInt(slider.value);
                
                this.values[this.currentColor][property] = value;
                
                // Actualizar display inmediatamente
                const valueDisplay = slider.parentElement.querySelector('.value');
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
                
                // Debounce agresivo del procesamiento
                if (updateTimeout) clearTimeout(updateTimeout);
                
                // Solo procesar si no está ya procesando
                if (!isProcessing) {
                    updateTimeout = setTimeout(() => {
                        isProcessing = true;
                        if (this.onUpdate) {
                            requestAnimationFrame(() => {
                                this.onUpdate();
                                isProcessing = false;
                            });
                        } else {
                            isProcessing = false;
                        }
                    }, 100); // Aumentado a 100ms
                }
            });
        });
        
        // Botones de reset
        document.querySelectorAll('#colorSlidersContainer .reset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const property = btn.dataset.slider;
                const slider = document.getElementById(`color-${property}`);
                
                if (slider) {
                    this.values[this.currentColor][property] = 0;
                    slider.value = 0;
                    
                    const valueDisplay = btn.parentElement.querySelector('.value');
                    if (valueDisplay) {
                        valueDisplay.textContent = '0';
                    }
                    
                    if (this.onUpdate) {
                        this.onUpdate();
                    }
                }
            });
        });
    }
    
    updateSliders() {
        const currentValues = this.values[this.currentColor];
        
        ['hue', 'saturation', 'luminance'].forEach(property => {
            const slider = document.getElementById(`color-${property}`);
            const valueDisplay = slider?.parentElement?.querySelector('.value');
            
            if (slider && valueDisplay) {
                slider.value = currentValues[property];
                valueDisplay.textContent = currentValues[property];
            }
        });
    }
    
    updateSliderColors() {
        const colorGradients = {
            all: {
                hue: 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                saturation: 'linear-gradient(90deg, #808080, #ff0000)',
                luminance: 'linear-gradient(90deg, #000000, #ffffff)'
            },
            red: {
                hue: 'linear-gradient(90deg, #cc0066, #ff0000, #ff3300)', // -30° a +30° desde rojo
                saturation: 'linear-gradient(90deg, #808080, #ff0000)',
                luminance: 'linear-gradient(90deg, #330000, #ff9999)'
            },
            orange: {
                hue: 'linear-gradient(90deg, #ff0000, #ff6600, #ffff00)', // Rojo a amarillo
                saturation: 'linear-gradient(90deg, #808080, #ff6600)',
                luminance: 'linear-gradient(90deg, #331a00, #ffcc99)'
            },
            yellow: {
                hue: 'linear-gradient(90deg, #ff6600, #ffff00, #66ff00)', // Naranja a verde
                saturation: 'linear-gradient(90deg, #808080, #ffff00)',
                luminance: 'linear-gradient(90deg, #333300, #ffff99)'
            },
            green: {
                hue: 'linear-gradient(90deg, #ffff00, #00ff00, #00ffff)', // Amarillo a cian
                saturation: 'linear-gradient(90deg, #808080, #00ff00)',
                luminance: 'linear-gradient(90deg, #003300, #99ff99)'
            },
            aqua: {
                hue: 'linear-gradient(90deg, #00ff00, #00ffff, #0000ff)', // Verde a azul
                saturation: 'linear-gradient(90deg, #808080, #00ffff)',
                luminance: 'linear-gradient(90deg, #003333, #99ffff)'
            },
            blue: {
                hue: 'linear-gradient(90deg, #00ffff, #0000ff, #6600ff)', // Cian a púrpura
                saturation: 'linear-gradient(90deg, #808080, #0000ff)',
                luminance: 'linear-gradient(90deg, #000033, #9999ff)'
            },
            purple: {
                hue: 'linear-gradient(90deg, #0000ff, #6600ff, #ff00ff)', // Azul a magenta
                saturation: 'linear-gradient(90deg, #808080, #6600ff)',
                luminance: 'linear-gradient(90deg, #1a0033, #cc99ff)'
            },
            magenta: {
                hue: 'linear-gradient(90deg, #6600ff, #ff00ff, #ff0000)', // Púrpura a rojo
                saturation: 'linear-gradient(90deg, #808080, #ff00ff)',
                luminance: 'linear-gradient(90deg, #330033, #ff99ff)'
            }
        };
        
        const gradients = colorGradients[this.currentColor] || colorGradients.all;
        
        ['hue', 'saturation', 'luminance'].forEach(property => {
            const slider = document.getElementById(`color-${property}`);
            if (slider) {
                slider.style.background = gradients[property];
            }
        });
    }
    
    // Conversión RGB a HSL
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [h * 360, s, l];
    }
    
    // Conversión HSL a RGB
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
    
    // Calcular peso del color
    getColorWeight(hue, saturation, colorName) {
        if (colorName === 'all') return 1.0;
        
        const range = this.colorRanges[colorName];
        if (!range) return 0;
        
        // Normalizar matiz
        let normalizedHue = hue;
        while (normalizedHue < 0) normalizedHue += 360;
        while (normalizedHue >= 360) normalizedHue -= 360;
        
        // Calcular distancia angular
        let distance = Math.abs(normalizedHue - range.center);
        if (distance > 180) distance = 360 - distance;
        
        // Peso basado en proximidad
        let weight = 0;
        if (distance <= range.range / 2) {
            weight = 1.0;
        } else if (distance <= range.range / 2 + range.falloff) {
            const falloffDistance = distance - range.range / 2;
            weight = Math.cos((falloffDistance / range.falloff) * Math.PI / 2);
        }
        
        // Modular por saturación
        const saturationFactor = Math.min(1.0, saturation / 0.3);
        return weight * saturationFactor;
    }
    
    // Verificar si hay cambios activos
    hasActiveChanges() {
        return Object.values(this.values).some(color => 
            color.hue !== 0 || color.saturation !== 0 || color.luminance !== 0
        );
    }
    
    // Procesar píxel optimizado
    processPixel(r, g, b) {
        // Early exit si no hay cambios
        if (!this.hasActiveChanges()) return [r, g, b];
        
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
        
        // Aplicar ajustes selectivos solo si es necesario
        for (const colorName of Object.keys(this.colorRanges)) {
            const adj = this.values[colorName];
            if (adj.hue === 0 && adj.saturation === 0 && adj.luminance === 0) continue;
            
            const weight = this.getColorWeight(h, s, colorName);
            if (weight <= 0.01) continue;
            
            const [currentH, currentS, currentL] = this.rgbToHsl(newR, newG, newB);
            let adjustedH = currentH, adjustedS = currentS, adjustedL = currentL;
            
            if (adj.hue !== 0) {
                const hueShift = (adj.hue / 100) * 30 * weight; // Rango fijo de ±30°
                adjustedH = currentH + hueShift;
                
                // Normalizar matiz
                while (adjustedH < 0) adjustedH += 360;
                while (adjustedH >= 360) adjustedH -= 360;
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
        }
        
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
    
    getValues() {
        return { ...this.values };
    }
    
    setValues(values) {
        this.values = { ...values };
        this.updateSliders();
    }
}

// Exportar para uso global
window.ColorControlSystemFixed = ColorControlSystemFixed;