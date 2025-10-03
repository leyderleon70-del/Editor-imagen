// Web Worker para procesamiento de imagen profesional
class ImageProcessor {
    constructor() {
        this.filters = new Map();
        this.initFilters();
    }

    initFilters() {
        // Filtros profesionales optimizados
        this.filters.set('exposure', (imageData, value) => {
            const factor = Math.pow(2, value / 100);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * factor);
                data[i + 1] = Math.min(255, data[i + 1] * factor);
                data[i + 2] = Math.min(255, data[i + 2] * factor);
            }
        });

        this.filters.set('contrast', (imageData, value) => {
            const factor = (259 * (value + 255)) / (255 * (259 - value));
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
                data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
                data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
            }
        });

        this.filters.set('unsharpMask', (imageData, amount, radius, threshold) => {
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            const original = new Uint8ClampedArray(data);
            
            // Gaussian blur para crear máscara
            const blurred = this.gaussianBlur(original, width, height, radius);
            
            for (let i = 0; i < data.length; i += 4) {
                const diff = Math.abs(original[i] - blurred[i]);
                if (diff >= threshold) {
                    const sharpened = original[i] + amount * (original[i] - blurred[i]);
                    data[i] = Math.max(0, Math.min(255, sharpened));
                    data[i + 1] = Math.max(0, Math.min(255, original[i + 1] + amount * (original[i + 1] - blurred[i + 1])));
                    data[i + 2] = Math.max(0, Math.min(255, original[i + 2] + amount * (original[i + 2] - blurred[i + 2])));
                }
            }
        });
    }

    gaussianBlur(data, width, height, radius) {
        // Optimized separable Gaussian blur
        const sigma = radius / 3;
        const kernelSize = Math.min(radius * 2 + 1, 15); // Limit kernel size
        const kernel = this.createGaussianKernel1D(kernelSize, sigma);
        
        // Horizontal pass
        const temp = new Uint8ClampedArray(data.length);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, weight = 0;
                const halfKernel = Math.floor(kernelSize / 2);
                
                for (let kx = -halfKernel; kx <= halfKernel; kx++) {
                    const px = Math.max(0, Math.min(width - 1, x + kx));
                    const idx = (y * width + px) * 4;
                    const w = kernel[kx + halfKernel];
                    
                    r += data[idx] * w;
                    g += data[idx + 1] * w;
                    b += data[idx + 2] * w;
                    weight += w;
                }
                
                const idx = (y * width + x) * 4;
                temp[idx] = r / weight;
                temp[idx + 1] = g / weight;
                temp[idx + 2] = b / weight;
                temp[idx + 3] = data[idx + 3];
            }
        }
        
        // Vertical pass
        const result = new Uint8ClampedArray(data.length);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, weight = 0;
                const halfKernel = Math.floor(kernelSize / 2);
                
                for (let ky = -halfKernel; ky <= halfKernel; ky++) {
                    const py = Math.max(0, Math.min(height - 1, y + ky));
                    const idx = (py * width + x) * 4;
                    const w = kernel[ky + halfKernel];
                    
                    r += temp[idx] * w;
                    g += temp[idx + 1] * w;
                    b += temp[idx + 2] * w;
                    weight += w;
                }
                
                const idx = (y * width + x) * 4;
                result[idx] = r / weight;
                result[idx + 1] = g / weight;
                result[idx + 2] = b / weight;
                result[idx + 3] = temp[idx + 3];
            }
        }
        
        return result;
    }
    
    createGaussianKernel1D(size, sigma) {
        const kernel = new Array(size);
        const center = Math.floor(size / 2);
        let sum = 0;
        
        for (let i = 0; i < size; i++) {
            const x = i - center;
            kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
            sum += kernel[i];
        }
        
        // Normalize
        for (let i = 0; i < size; i++) {
            kernel[i] /= sum;
        }
        
        return kernel;
    }

    createGaussianKernel(radius) {
        const size = radius * 2 + 1;
        const kernel = Array(size).fill().map(() => Array(size));
        const sigma = radius / 3;
        let sum = 0;
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dx = x - radius;
                const dy = y - radius;
                kernel[y][x] = Math.exp(-(dx * dx + dy * dy) / (2 * sigma * sigma));
                sum += kernel[y][x];
            }
        }
        
        // Normalizar
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                kernel[y][x] /= sum;
            }
        }
        
        return kernel;
    }

    calculateHistogram(imageData) {
        const histogram = {
            red: new Array(256).fill(0),
            green: new Array(256).fill(0),
            blue: new Array(256).fill(0),
            luminance: new Array(256).fill(0)
        };
        
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = Math.max(0, Math.min(255, data[i]));
            const g = Math.max(0, Math.min(255, data[i + 1]));
            const b = Math.max(0, Math.min(255, data[i + 2]));
            const lum = Math.max(0, Math.min(255, Math.round(0.299 * r + 0.587 * g + 0.114 * b)));
            
            histogram.red[r]++;
            histogram.green[g]++;
            histogram.blue[b]++;
            histogram.luminance[lum]++;
        }
        
        return histogram;
    }

    processImage(imageData, adjustments) {
        const processed = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );

        // Aplicar filtros en orden profesional
        if (adjustments.exposure !== 0) {
            this.filters.get('exposure')(processed, adjustments.exposure);
        }
        if (adjustments.contrast !== 0) {
            this.filters.get('contrast')(processed, adjustments.contrast);
        }
        if (adjustments.sharpness > 0) {
            this.filters.get('unsharpMask')(processed, adjustments.sharpness / 100, 1, 3);
        }

        return {
            imageData: processed,
            histogram: this.calculateHistogram(processed)
        };
    }
}

const processor = new ImageProcessor();

self.onmessage = function(e) {
    try {
        const { type, data } = e.data;
        
        switch (type) {
            case 'process':
                if (!data || !data.imageData || !data.adjustments) {
                    throw new Error('Invalid data provided for processing');
                }
                const result = processor.processImage(data.imageData, data.adjustments);
                self.postMessage({ type: 'processed', data: result });
                break;
                
            case 'histogram':
                if (!data || !data.imageData) {
                    throw new Error('Invalid image data provided for histogram');
                }
                const histogram = processor.calculateHistogram(data.imageData);
                self.postMessage({ type: 'histogram', data: histogram });
                break;
                
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        self.postMessage({ 
            type: 'error', 
            data: { 
                message: error.message,
                stack: error.stack 
            } 
        });
    }
};