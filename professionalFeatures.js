// Funcionalidades profesionales adicionales
class ProfessionalFeatures {
    constructor() {
        this.batchProcessor = new BatchProcessor();
        this.colorGrading = new ColorGrading();
        this.advancedExport = new AdvancedExport();
        this.performanceMonitor = new PerformanceMonitor();
    }
}

// Procesamiento por lotes
class BatchProcessor {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    addToQueue(imageData, preset) {
        this.queue.push({ imageData, preset, id: Date.now() });
    }

    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        const results = [];
        for (const item of this.queue) {
            try {
                const processed = await this.processImage(item.imageData, item.preset);
                results.push({ id: item.id, result: processed });
            } catch (error) {
                console.error('Error processing image:', error);
                results.push({ id: item.id, error: error.message });
            }
        }

        this.queue = [];
        this.processing = false;
        return results;
    }

    async processImage(imageData, preset) {
        // Simular procesamiento avanzado
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(imageData); // Placeholder
            }, 100);
        });
    }
}

// Gradación de color avanzada
class ColorGrading {
    constructor() {
        this.shadows = { r: 0, g: 0, b: 0 };
        this.midtones = { r: 0, g: 0, b: 0 };
        this.highlights = { r: 0, g: 0, b: 0 };
    }

    applyShadowsHighlights(imageData) {
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Determinar zona tonal
            let weight = { shadows: 0, midtones: 0, highlights: 0 };
            
            if (luminance < 85) {
                weight.shadows = 1 - (luminance / 85);
            } else if (luminance > 170) {
                weight.highlights = (luminance - 170) / 85;
            } else {
                weight.midtones = 1 - Math.abs(luminance - 127.5) / 42.5;
            }
            
            // Aplicar gradación con clamp
            data[i] = Math.max(0, Math.min(255, data[i] + this.shadows.r * weight.shadows + 
                      this.midtones.r * weight.midtones + 
                      this.highlights.r * weight.highlights));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + this.shadows.g * weight.shadows + 
                          this.midtones.g * weight.midtones + 
                          this.highlights.g * weight.highlights));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + this.shadows.b * weight.shadows + 
                          this.midtones.b * weight.midtones + 
                          this.highlights.b * weight.highlights));
        }
        
        return imageData;
    }
}

// Exportación avanzada
class AdvancedExport {
    constructor() {
        this.formats = ['png', 'jpeg', 'webp', 'tiff'];
        this.qualities = { jpeg: 90, webp: 85 };
    }

    async exportMultipleFormats(canvas, basename = 'image') {
        if (!canvas || typeof canvas.toBlob !== 'function') {
            throw new Error('Invalid canvas provided');
        }
        
        const exports = [];
        const sanitizedBasename = this.sanitizeFilename(basename);
        
        for (const format of this.formats) {
            try {
                const blob = await this.canvasToBlob(canvas, format);
                exports.push({
                    format,
                    blob,
                    filename: `${sanitizedBasename}.${format}`
                });
            } catch (error) {
                console.error(`Error exporting ${format}:`, error);
            }
        }
        
        return exports;
    }

    sanitizeFilename(filename) {
        return filename.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
    }

    canvasToBlob(canvas, format) {
        return new Promise(resolve => {
            let mimeType, quality;
            
            switch (format) {
                case 'jpeg':
                    mimeType = 'image/jpeg';
                    quality = this.qualities.jpeg / 100;
                    break;
                case 'webp':
                    mimeType = 'image/webp';
                    quality = this.qualities.webp / 100;
                    break;
                case 'png':
                default:
                    mimeType = 'image/png';
                    quality = undefined;
            }
            
            canvas.toBlob(resolve, mimeType, quality);
        });
    }

    downloadZip(exports) {
        try {
            const zip = new JSZip();
            
            exports.forEach(exp => {
                if (exp.blob && exp.filename) {
                    zip.file(exp.filename, exp.blob);
                }
            });
            
            zip.generateAsync({ type: 'blob' }).then(content => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = 'exported_images.zip';
                a.click();
                URL.revokeObjectURL(a.href);
            }).catch(error => {
                console.error('Error generating ZIP:', error);
                alert('Error al generar el archivo ZIP');
            });
        } catch (error) {
            console.error('Error creating ZIP:', error);
            alert('Error al crear el archivo ZIP');
        }
    }
}

// Monitor de rendimiento
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            processingTime: [],
            memoryUsage: [],
            fps: []
        };
        this.startTime = 0;
    }

    startMeasure() {
        this.startTime = performance.now();
    }

    endMeasure(operation) {
        const duration = performance.now() - this.startTime;
        this.metrics.processingTime.push({ operation, duration, timestamp: Date.now() });
        
        // Mantener solo las últimas 100 mediciones
        if (this.metrics.processingTime.length > 100) {
            this.metrics.processingTime.shift();
        }
        
        return duration;
    }

    getAverageProcessingTime() {
        if (this.metrics.processingTime.length === 0) return 0;
        
        const total = this.metrics.processingTime.reduce((sum, metric) => sum + metric.duration, 0);
        return total / this.metrics.processingTime.length;
    }

    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) // MB
            };
        }
        return null;
    }

    displayStats() {
        const avgTime = this.getAverageProcessingTime();
        const memory = this.getMemoryUsage();
        
        console.log(`Performance Stats:
        Average Processing Time: ${avgTime.toFixed(2)}ms
        Memory Usage: ${memory ? `${memory.used}MB / ${memory.total}MB` : 'N/A'}
        Recent Operations: ${this.metrics.processingTime.length}`);
    }
}

// Gestor de presets inteligentes
class SmartPresetManager {
    constructor() {
        this.presets = new Map();
        this.usage = new Map();
        this.recommendations = [];
    }

    addPreset(name, values, imageType = 'general') {
        this.presets.set(name, {
            values,
            imageType,
            created: Date.now(),
            usage: 0
        });
    }

    getRecommendedPresets(imageAnalysis) {
        const recommendations = [];
        
        for (const [name, preset] of this.presets) {
            if (preset.imageType === imageAnalysis.type || preset.imageType === 'general') {
                const score = this.calculateCompatibilityScore(preset.values, imageAnalysis);
                recommendations.push({ name, preset, score });
            }
        }
        
        return recommendations
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    calculateCompatibilityScore(presetValues, imageAnalysis) {
        let score = 0;
        
        // Análisis de compatibilidad basado en características de imagen
        if (imageAnalysis.brightness < 100 && presetValues.exposure > 0) score += 20;
        if (imageAnalysis.saturation < 0.3 && presetValues.vibrance > 0) score += 15;
        if (imageAnalysis.contrast < 0.5 && presetValues.contrast > 0) score += 10;
        
        return Math.min(100, score);
    }

    trackUsage(presetName) {
        if (this.presets.has(presetName)) {
            this.presets.get(presetName).usage++;
            this.usage.set(presetName, (this.usage.get(presetName) || 0) + 1);
        }
    }

    getMostUsedPresets(limit = 5) {
        return Array.from(this.usage.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name]) => this.presets.get(name));
    }
}

// Comparador de imágenes avanzado
class ImageComparator {
    constructor() {
        this.splitPosition = 0.5;
        this.mode = 'vertical'; // 'vertical', 'horizontal', 'overlay'
    }

    createSplitView(originalCanvas, editedCanvas, container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'comparison-wrapper';
        wrapper.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
        `;

        const originalDiv = document.createElement('div');
        originalDiv.className = 'comparison-original';
        const originalClone = this.cloneCanvas(originalCanvas);
        originalDiv.appendChild(originalClone);

        const editedDiv = document.createElement('div');
        editedDiv.className = 'comparison-edited';
        const editedClone = this.cloneCanvas(editedCanvas);
        editedDiv.appendChild(editedClone);

        const slider = document.createElement('div');
        slider.className = 'comparison-slider';
        
        wrapper.appendChild(originalDiv);
        wrapper.appendChild(editedDiv);
        wrapper.appendChild(slider);
        
        this.setupSliderInteraction(wrapper, slider);
        
        container.appendChild(wrapper);
        return wrapper;
    }

    cloneCanvas(canvas) {
        const clone = document.createElement('canvas');
        clone.width = canvas.width;
        clone.height = canvas.height;
        const ctx = clone.getContext('2d');
        ctx.drawImage(canvas, 0, 0);
        return clone;
    }

    setupSliderInteraction(wrapper, slider) {
        let isDragging = false;
        
        slider.addEventListener('mousedown', () => isDragging = true);
        document.addEventListener('mouseup', () => isDragging = false);
        
        wrapper.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = wrapper.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            this.updateSplit(wrapper, Math.max(0, Math.min(1, position)));
        });
    }

    updateSplit(wrapper, position) {
        this.splitPosition = position;
        const slider = wrapper.querySelector('.comparison-slider');
        const edited = wrapper.querySelector('.comparison-edited');
        
        if (this.mode === 'vertical') {
            slider.style.left = `${position * 100}%`;
            edited.style.clipPath = `inset(0 ${(1 - position) * 100}% 0 0)`;
        }
    }
}

// Exportar clases para uso global
window.ProfessionalFeatures = ProfessionalFeatures;
window.BatchProcessor = BatchProcessor;
window.ColorGrading = ColorGrading;
window.AdvancedExport = AdvancedExport;
window.PerformanceMonitor = PerformanceMonitor;
window.SmartPresetManager = SmartPresetManager;
window.ImageComparator = ImageComparator;