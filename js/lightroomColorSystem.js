// Sistema de Control de Colores Profesional - Nivel Adobe Lightroom
class LightroomColorSystem {
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
        
        // Rangos de color exactos de Lightroom
        this.colorRanges = {
            red: { center: 0, primary: [315, 45], secondary: [300, 60] },
            orange: { center: 45, primary: [15, 75], secondary: [0, 90] },
            yellow: { center: 75, primary: [45, 105], secondary: [30, 120] },
            green: { center: 135, primary: [105, 165], secondary: [90, 180] },
            aqua: { center: 195, primary: [165, 225], secondary: [150, 240] },
            blue: { center: 255, primary: [225, 285], secondary: [210, 300] },
            purple: { center: 315, primary: [285, 345], secondary: [270, 360] },
            magenta: { center: 345, primary: [315, 15], secondary: [300, 30] }
        };
        
        this.onUpdate = null;
        this.isProcessing = false;
    }
    
    init(container, updateCallback) {
        this.onUpdate = updateCallback;
        this.setupEventListeners();
        this.updateSliderColors();
    }
    
    setupEventListeners() {
        // Tabs con comportamiento profesional
        document.querySelectorAll('.color-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.color-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentColor = tab.dataset.color;
                this.updateSliders();
                this.updateSliderColors();
            });
        });
        
        // Sliders con debouncing profesional
        let updateTimeout = null;
        document.querySelectorAll('#colorSlidersContainer input[type="range"]').forEach(slider => {
            slider.addEventListener('input', () => {
                const property = slider.id.replace('color-', '');
                const value = parseInt(slider.value);
                
                this.values[this.currentColor][property] = value;
                
                // Actualización visual inmediata
                const valueDisplay = slider.parentElement.querySelector('.value');
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
                
                // Debouncing profesional
                if (updateTimeout) clearTimeout(updateTimeout);
                if (!this.isProcessing) {
                    updateTimeout = setTimeout(() => {
                        this.isProcessing = true;
                        requestAnimationFrame(() => {
                            if (this.onUpdate) this.onUpdate();
                            this.isProcessing = false;
                        });
                    }, 80);
                }
            });
        });
        
        // Reset buttons
        document.querySelectorAll('#colorSlidersContainer .reset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const property = btn.dataset.slider;
                const slider = document.getElementById(`color-${property}`);
                
                if (slider) {
                    this.values[this.currentColor][property] = 0;
                    slider.value = 0;
                    
                    const valueDisplay = btn.parentElement.querySelector('.value');
                    if (valueDisplay) valueDisplay.textContent = '0';
                    
                    if (this.onUpdate) this.onUpdate();
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
        const gradients = this.getLightroomGradients();
        const colorGradients = gradients[this.currentColor] || gradients.all;
        
        ['hue', 'saturation', 'luminance'].forEach(property => {
            const slider = document.getElementById(`color-${property}`);
            if (slider) {
                slider.style.background = colorGradients[property];
            }
        });
    }
    
    getLightroomGradients() {
        return {
            all: {
                hue: 'linear-gradient(90deg, #ff0000 0%, #ff8000 14%, #ffff00 28%, #80ff00 42%, #00ff00 57%, #00ff80 71%, #00ffff 85%, #0080ff 100%)',
                saturation: 'linear-gradient(90deg, #808080 0%, #ff4444 100%)',
                luminance: 'linear-gradient(90deg, #000000 0%, #ffffff 100%)'
            },
            red: {
                hue: 'linear-gradient(90deg, #ff00cc 0%, #ff0066 25%, #ff0000 50%, #ff3300 75%, #ff6600 100%)',
                saturation: 'linear-gradient(90deg, #999999 0%, #ff0000 100%)',
                luminance: 'linear-gradient(90deg, #330000 0%, #ff6666 100%)'
            },
            orange: {
                hue: 'linear-gradient(90deg, #ff0000 0%, #ff3300 25%, #ff6600 50%, #ff9900 75%, #ffcc00 100%)',
                saturation: 'linear-gradient(90deg, #999999 0%, #ff6600 100%)',
                luminance: 'linear-gradient(90deg, #331a00 0%, #ffaa66 100%)'
            },
            yellow: {
                hue: 'linear-gradient(90deg, #ff6600 0%, #ff9900 25%, #ffcc00 50%, #ffff00 75%, #ccff00 100%)',
                saturation: 'linear-gradient(90deg, #999999 0%, #ffff00 100%)',
                luminance: 'linear-gradient(90deg, #333300 0%, #ffff66 100%)'
            },
            green: {
                hue: 'linear-gradient(90deg, #ccff00 0%, #99ff00 25%, #66ff00 50%, #33ff00 75%, #00ff00 100%)',
                saturation: 'linear-gradient(90deg, #999999 0%, #00ff00 100%)',
                luminance: 'linear-gradient(90deg, #003300 0%, #66ff66 100%)'
            },
            aqua: {
                hue: 'linear-gradient(90deg, #00ff66 0%, #00ff99 25%, #00ffcc 50%, #00ffff 75%, #00ccff 100%)',
                saturation: 'linear-gradient(90deg, #999999 0%, #00ffff 100%)',
                luminance: 'linear-gradient(90deg, #003333 0%, #66ffff 100%)'
            },
            blue: {
                hue: 'linear-gradient(90deg, #00ccff 0%, #0099ff 25%, #0066ff 50%, #0033ff 75%, #0000ff 100%)',
                saturation: 'linear-gradient(90deg, #999999 0%, #0066ff 100%)',
                luminance: 'linear-gradient(90deg, #000033 0%, #6666ff 100%)'
            },
            purple: {
                hue: 'linear-gradient(90deg, #0000ff 0%, #3300ff 25%, #6600ff 50%, #9900ff 75%, #cc00ff 100%)',
                saturation: 'linear-gradient(90deg, #999999 0%, #6600ff 100%)',
                luminance: 'linear-gradient(90deg, #1a0033 0%, #aa66ff 100%)'
            },
            magenta: {
                hue: 'linear-gradient(90deg, #cc00ff 0%, #ff00cc 25%, #ff0099 50%, #ff0066 75%, #ff0033 100%)',
                saturation: 'linear-gradient(90deg, #999999 0%, #ff00cc 100%)',
                luminance: 'linear-gradient(90deg, #330033 0%, #ff66cc 100%)'
            }
        };
    }
    
    hasActiveChanges() {
        return Object.values(this.values).some(color => 
            color.hue !== 0 || color.saturation !== 0 || color.luminance !== 0
        );
    }
    
    // Conversión RGB a HSL profesional (algoritmo de Lightroom)
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const sum = max + min;
        
        let h = 0, s = 0, l = sum / 2;
        
        if (diff !== 0) {
            s = l > 0.5 ? diff / (2 - sum) : diff / sum;
            
            switch (max) {
                case r: h = ((g - b) / diff) + (g < b ? 6 : 0); break;
                case g: h = ((b - r) / diff) + 2; break;
                case b: h = ((r - g) / diff) + 4; break;
            }
            h /= 6;
        }
        
        return [h * 360, s, l];
    }
    
    // Conversión HSL a RGB profesional
    hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360; // Normalizar
        h /= 360;
        
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h * 6) % 2 - 1));
        const m = l - c / 2;
        
        let r = 0, g = 0, b = 0;
        
        if (h < 1/6) { r = c; g = x; b = 0; }
        else if (h < 2/6) { r = x; g = c; b = 0; }
        else if (h < 3/6) { r = 0; g = c; b = x; }
        else if (h < 4/6) { r = 0; g = x; b = c; }
        else if (h < 5/6) { r = x; g = 0; b = c; }
        else { r = c; g = 0; b = x; }
        
        return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
    }
    
    // Algoritmo de peso profesional de Lightroom
    getColorWeight(hue, saturation, luminance, colorName) {
        if (colorName === 'all') return 1.0;
        
        const range = this.colorRanges[colorName];
        if (!range) return 0;
        
        // Normalizar matiz
        let normalizedHue = ((hue % 360) + 360) % 360;
        
        // Calcular peso basado en proximidad al rango primario
        let weight = 0;
        const primary = range.primary;
        
        // Manejar rangos que cruzan 0°
        if (primary[0] > primary[1]) {
            if (normalizedHue >= primary[0] || normalizedHue <= primary[1]) {
                weight = 1.0;
            } else {
                const dist1 = Math.min(
                    Math.abs(normalizedHue - primary[0]),
                    Math.abs(normalizedHue - (primary[0] - 360))
                );
                const dist2 = Math.min(
                    Math.abs(normalizedHue - primary[1]),
                    Math.abs(normalizedHue - (primary[1] + 360))
                );
                const minDist = Math.min(dist1, dist2);
                weight = Math.max(0, 1 - minDist / 30);
            }
        } else {
            if (normalizedHue >= primary[0] && normalizedHue <= primary[1]) {
                weight = 1.0;
            } else {
                const minDist = Math.min(
                    Math.abs(normalizedHue - primary[0]),
                    Math.abs(normalizedHue - primary[1])
                );
                weight = Math.max(0, 1 - minDist / 30);
            }
        }
        
        // Modulación por saturación (algoritmo de Lightroom)
        const saturationWeight = Math.pow(saturation, 0.5);
        
        // Modulación por luminancia (evitar extremos)
        const luminanceWeight = 1 - Math.pow(Math.abs(luminance - 0.5) * 2, 2);
        
        return weight * saturationWeight * luminanceWeight;
    }
    
    // Procesamiento profesional por píxel
    processPixel(r, g, b) {
        if (!this.hasActiveChanges()) return [r, g, b];
        
        const [h, s, l] = this.rgbToHsl(r, g, b);
        let newH = h, newS = s, newL = l;
        
        // Aplicar ajustes globales primero
        const allAdj = this.values.all;
        if (allAdj.hue !== 0) {
            newH = h + (allAdj.hue * 1.8); // Rango más sutil
        }
        if (allAdj.saturation !== 0) {
            const factor = 1 + (allAdj.saturation / 100);
            newS = Math.max(0, Math.min(1, s * factor));
        }
        if (allAdj.luminance !== 0) {
            const factor = 1 + (allAdj.luminance / 100);
            newL = Math.max(0, Math.min(1, l * factor));
        }
        
        // Aplicar ajustes selectivos
        for (const colorName of Object.keys(this.colorRanges)) {
            const adj = this.values[colorName];
            if (adj.hue === 0 && adj.saturation === 0 && adj.luminance === 0) continue;
            
            const weight = this.getColorWeight(h, s, l, colorName);
            if (weight <= 0.01) continue;
            
            if (adj.hue !== 0) {
                const hueShift = (adj.hue / 100) * 15 * weight; // Rango profesional ±15°
                newH += hueShift;
            }
            
            if (adj.saturation !== 0) {
                const satFactor = 1 + ((adj.saturation / 100) * weight * 0.8);
                newS = Math.max(0, Math.min(1, newS * satFactor));
            }
            
            if (adj.luminance !== 0) {
                const lumFactor = 1 + ((adj.luminance / 100) * weight * 0.6);
                newL = Math.max(0, Math.min(1, newL * lumFactor));
            }
        }
        
        const [newR, newG, newB] = this.hslToRgb(newH, newS, newL);
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
window.LightroomColorSystem = LightroomColorSystem;