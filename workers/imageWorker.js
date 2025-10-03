// Web Worker optimizado para procesamiento de imágenes
class ImageProcessor {
  constructor() {
    this.cache = new Map();
  }
  
  processImage(imageData, filters) {
    const { data, width, height } = imageData;
    const processed = new Uint8ClampedArray(data);
    
    // Aplicar filtros de forma optimizada
    this.applyFilters(processed, filters, width, height);
    
    return new ImageData(processed, width, height);
  }
  
  applyFilters(data, filters, width, height) {
    const len = data.length;
    
    // Pre-calcular valores para mejor rendimiento
    const brightness = 1 + (filters.exposure || 0) * 0.02;
    const contrast = 1 + (filters.contrast || 0) * 0.01;
    const saturation = 1 + (filters.saturation || 0) * 0.01;
    
    // Procesamiento vectorizado
    for (let i = 0; i < len; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];
      
      // Brillo
      r *= brightness;
      g *= brightness;
      b *= brightness;
      
      // Contraste
      r = ((r - 128) * contrast) + 128;
      g = ((g - 128) * contrast) + 128;
      b = ((b - 128) * contrast) + 128;
      
      // Saturación
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * saturation;
      g = gray + (g - gray) * saturation;
      b = gray + (b - gray) * saturation;
      
      // Clamp valores
      data[i] = Math.max(0, Math.min(255, r));
      data[i + 1] = Math.max(0, Math.min(255, g));
      data[i + 2] = Math.max(0, Math.min(255, b));
    }
  }
  
  calculateHistogram(imageData) {
    const { data } = imageData;
    const histogram = {
      r: new Array(256).fill(0),
      g: new Array(256).fill(0),
      b: new Array(256).fill(0)
    };
    
    for (let i = 0; i < data.length; i += 4) {
      histogram.r[data[i]]++;
      histogram.g[data[i + 1]]++;
      histogram.b[data[i + 2]]++;
    }
    
    return histogram;
  }
}

const processor = new ImageProcessor();

self.onmessage = function(e) {
  const { type, imageData, filters, id } = e.data;
  
  try {
    switch (type) {
      case 'process':
        const processed = processor.processImage(imageData, filters);
        const histogram = processor.calculateHistogram(processed);
        self.postMessage({
          type: 'processed',
          imageData: processed,
          histogram,
          id
        });
        break;
        
      case 'histogram':
        const hist = processor.calculateHistogram(imageData);
        self.postMessage({
          type: 'histogram',
          histogram: hist,
          id
        });
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      id
    });
  }
};