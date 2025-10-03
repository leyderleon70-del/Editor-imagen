// Renderizador de histograma profesional
class HistogramRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.channels = ['luminance', 'red', 'green', 'blue'];
        this.visibleChannels = new Set(['luminance']);
        this.animationFrame = null;
        this.setupCanvas();
    }

    setupCanvas() {
        // Configurar canvas para alta resolución
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.width = rect.width;
        this.height = rect.height;
    }

    render(histogram, animated = true) {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (animated) {
            this.animateRender(histogram);
        } else {
            this.directRender(histogram);
        }
    }

    animateRender(histogram) {
        let progress = 0;
        const duration = 300; // ms
        const startTime = performance.now();

        const animate = (currentTime) => {
            progress = Math.min(1, (currentTime - startTime) / duration);
            
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.drawHistogram(histogram, progress);
            
            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            }
        };

        this.animationFrame = requestAnimationFrame(animate);
    }

    directRender(histogram) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawHistogram(histogram, 1);
    }

    drawHistogram(histogram, progress = 1) {
        if (!histogram) return;

        // Encontrar valor máximo para normalización
        let maxValue = 0;
        this.channels.forEach(channel => {
            if (this.visibleChannels.has(channel) && histogram[channel]) {
                const channelMax = this.findArrayMax(histogram[channel]);
                maxValue = Math.max(maxValue, channelMax);
            }
        });

        if (maxValue === 0) return;

        // Configurar estilos
        const colors = {
            luminance: 'rgba(255, 255, 255, 0.8)',
            red: 'rgba(255, 100, 100, 0.7)',
            green: 'rgba(100, 255, 100, 0.7)',
            blue: 'rgba(100, 100, 255, 0.7)'
        };

        // Dibujar grid de fondo
        this.drawGrid();

        // Dibujar cada canal visible
        this.channels.forEach(channel => {
            if (this.visibleChannels.has(channel) && histogram[channel]) {
                this.drawChannel(histogram[channel], colors[channel], maxValue, progress);
            }
        });

        // Dibujar estadísticas
        this.drawStatistics(histogram);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Líneas verticales (cuartos)
        for (let i = 1; i < 4; i++) {
            const x = (this.width / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Líneas horizontales
        for (let i = 1; i < 4; i++) {
            const y = (this.height / 4) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    drawChannel(data, color, maxValue, progress) {
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color.replace('0.7)', '0.2)').replace('0.8)', '0.2)');
        this.ctx.lineWidth = 1;

        const barWidth = this.width / 256;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height);

        for (let i = 0; i < 256; i++) {
            const value = data[i] || 0;
            const normalizedHeight = (value / maxValue) * this.height * progress;
            const x = i * barWidth;
            const y = this.height - normalizedHeight;
            
            if (i === 0) {
                this.ctx.lineTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.lineTo(this.width, this.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawStatistics(histogram) {
        if (!this.visibleChannels.has('luminance') || !histogram.luminance) return;

        const stats = this.calculateStatistics(histogram.luminance);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '10px Inter, sans-serif';
        
        const text = `Media: ${stats.mean} | Mediana: ${stats.median} | Desv: ${stats.stdDev}`;
        const textWidth = this.ctx.measureText(text).width;
        
        // Fondo semi-transparente
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.width - textWidth - 10, 5, textWidth + 8, 16);
        
        // Texto
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText(text, this.width - textWidth - 6, 16);
    }

    calculateStatistics(data) {
        let sum = 0;
        let count = 0;
        let values = [];

        for (let i = 0; i < data.length; i++) {
            const freq = data[i];
            sum += i * freq;
            count += freq;
            
            // Agregar valores para mediana
            for (let j = 0; j < freq; j++) {
                values.push(i);
            }
        }

        const mean = Math.round(sum / count);
        
        values.sort((a, b) => a - b);
        const median = values[Math.floor(values.length / 2)];

        // Desviación estándar
        let variance = 0;
        for (let i = 0; i < data.length; i++) {
            const freq = data[i];
            variance += freq * Math.pow(i - mean, 2);
        }
        const stdDev = Math.round(Math.sqrt(variance / count));

        return { mean, median, stdDev };
    }

    toggleChannel(channel) {
        if (this.visibleChannels.has(channel)) {
            this.visibleChannels.delete(channel);
        } else {
            this.visibleChannels.add(channel);
        }
    }

    setChannels(channels) {
        this.visibleChannels.clear();
        channels.forEach(channel => this.visibleChannels.add(channel));
    }

    findArrayMax(array) {
        let max = 0;
        for (let i = 0; i < array.length; i++) {
            if (array[i] > max) {
                max = array[i];
            }
        }
        return max;
    }
    
    exportHistogramData(histogram) {
        const stats = {};
        this.channels.forEach(channel => {
            if (histogram[channel]) {
                stats[channel] = this.calculateStatistics(histogram[channel]);
            }
        });
        return stats;
    }
}

// Exportar para uso global
window.HistogramRenderer = HistogramRenderer;