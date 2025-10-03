// Sistema de capas profesional
class LayerSystem {
    constructor() {
        this.layers = [];
        this.activeLayer = null;
        this.blendModes = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'];
        this.canvas = null;
        this.ctx = null;
    }

    init(canvas) {
        if (!canvas || typeof canvas.getContext !== 'function') {
            throw new Error('Invalid canvas provided to LayerSystem');
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.createBaseLayer();
    }

    createBaseLayer() {
        const baseLayer = {
            id: 'base',
            name: 'Imagen Base',
            type: 'image',
            visible: true,
            opacity: 1,
            blendMode: 'normal',
            canvas: document.createElement('canvas'),
            adjustments: {},
            mask: null
        };
        
        this.layers.push(baseLayer);
        this.activeLayer = baseLayer;
        return baseLayer;
    }

    addAdjustmentLayer(type, name) {
        const sanitizedType = this.sanitizeAdjustmentType(type);
        const sanitizedName = this.sanitizeLayerName(name || `Ajuste ${this.layers.length}`);
        
        const layer = {
            id: `layer_${Date.now()}`,
            name: sanitizedName,
            type: 'adjustment',
            adjustmentType: sanitizedType,
            visible: true,
            opacity: 1,
            blendMode: 'normal',
            adjustments: this.getDefaultAdjustments(sanitizedType),
            mask: null
        };
        
        this.layers.push(layer);
        this.activeLayer = layer;
        this.updateLayerPanel();
        return layer;
    }

    getDefaultAdjustments(type) {
        const defaults = {
            'curves': { points: [[0, 0], [255, 255]] },
            'levels': { shadows: 0, midtones: 1, highlights: 255 },
            'colorBalance': { shadows: [0, 0, 0], midtones: [0, 0, 0], highlights: [0, 0, 0] },
            'hsl': { hue: 0, saturation: 0, lightness: 0 },
            'exposure': { exposure: 0, offset: 0, gamma: 1 }
        };
        return defaults[type] || {};
    }

    createMask(layer) {
        if (!layer.mask) {
            layer.mask = {
                canvas: document.createElement('canvas'),
                data: null,
                inverted: false
            };
            layer.mask.canvas.width = this.canvas.width;
            layer.mask.canvas.height = this.canvas.height;
            
            // Máscara blanca por defecto (todo visible)
            const ctx = layer.mask.canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, layer.mask.canvas.width, layer.mask.canvas.height);
        }
        return layer.mask;
    }

    applyMask(imageData, maskData, inverted = false) {
        if (!imageData || !maskData || !imageData.data || !maskData.data) {
            throw new Error('Invalid image data or mask data provided');
        }
        
        if (imageData.data.length !== maskData.data.length) {
            throw new Error('Image data and mask data dimensions do not match');
        }
        
        const data = imageData.data;
        const mask = maskData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const maskValue = mask[i] / 255;
            const alpha = inverted ? 1 - maskValue : maskValue;
            data[i + 3] *= alpha;
        }
        
        return imageData;
    }

    blendLayers(base, overlay, mode, opacity) {
        const baseData = base.data;
        const overlayData = overlay.data;
        
        for (let i = 0; i < baseData.length; i += 4) {
            const baseR = baseData[i] / 255;
            const baseG = baseData[i + 1] / 255;
            const baseB = baseData[i + 2] / 255;
            
            const overlayR = overlayData[i] / 255;
            const overlayG = overlayData[i + 1] / 255;
            const overlayB = overlayData[i + 2] / 255;
            const overlayA = overlayData[i + 3] / 255 * opacity;
            
            let resultR, resultG, resultB;
            
            switch (mode) {
                case 'multiply':
                    resultR = baseR * overlayR;
                    resultG = baseG * overlayG;
                    resultB = baseB * overlayB;
                    break;
                case 'screen':
                    resultR = 1 - (1 - baseR) * (1 - overlayR);
                    resultG = 1 - (1 - baseG) * (1 - overlayG);
                    resultB = 1 - (1 - baseB) * (1 - overlayB);
                    break;
                case 'overlay':
                    resultR = baseR < 0.5 ? 2 * baseR * overlayR : 1 - 2 * (1 - baseR) * (1 - overlayR);
                    resultG = baseG < 0.5 ? 2 * baseG * overlayG : 1 - 2 * (1 - baseG) * (1 - overlayG);
                    resultB = baseB < 0.5 ? 2 * baseB * overlayB : 1 - 2 * (1 - baseB) * (1 - overlayB);
                    break;
                default: // normal
                    resultR = overlayR;
                    resultG = overlayG;
                    resultB = overlayB;
            }
            
            // Mezclar con opacidad
            baseData[i] = Math.round((baseR * (1 - overlayA) + resultR * overlayA) * 255);
            baseData[i + 1] = Math.round((baseG * (1 - overlayA) + resultG * overlayA) * 255);
            baseData[i + 2] = Math.round((baseB * (1 - overlayA) + resultB * overlayA) * 255);
        }
        
        return base;
    }

    renderLayers() {
        if (!this.canvas || this.layers.length === 0) return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Renderizar capas de abajo hacia arriba
        for (const layer of this.layers) {
            if (!layer.visible) continue;
            
            if (layer.type === 'image' && layer.canvas) {
                tempCtx.globalAlpha = layer.opacity;
                tempCtx.globalCompositeOperation = layer.blendMode;
                tempCtx.drawImage(layer.canvas, 0, 0);
            }
        }
        
        // Copiar resultado al canvas principal
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(tempCanvas, 0, 0);
    }

    updateLayerPanel() {
        const panel = document.getElementById('layerPanel');
        if (!panel) return;
        
        panel.innerHTML = '';
        
        // Crear elementos de capa en orden inverso (arriba = encima)
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            const layerElement = this.createLayerElement(layer);
            panel.appendChild(layerElement);
        }
    }

    createLayerElement(layer) {
        const div = document.createElement('div');
        div.className = `layer-item ${layer === this.activeLayer ? 'active' : ''}`;
        
        // Create visibility toggle
        const visibilityDiv = document.createElement('div');
        visibilityDiv.className = 'layer-visibility';
        visibilityDiv.dataset.layer = layer.id;
        visibilityDiv.textContent = layer.visible ? '👁️' : '🚫';
        
        // Create layer name
        const nameDiv = document.createElement('div');
        nameDiv.className = 'layer-name';
        nameDiv.textContent = layer.name;
        
        // Create opacity slider
        const opacityDiv = document.createElement('div');
        opacityDiv.className = 'layer-opacity';
        const opacitySlider = document.createElement('input');
        opacitySlider.type = 'range';
        opacitySlider.min = '0';
        opacitySlider.max = '100';
        opacitySlider.value = Math.round(layer.opacity * 100);
        opacitySlider.dataset.layer = layer.id;
        opacitySlider.className = 'opacity-slider';
        opacityDiv.appendChild(opacitySlider);
        
        // Create blend mode select
        const blendDiv = document.createElement('div');
        blendDiv.className = 'layer-blend';
        const blendSelect = document.createElement('select');
        blendSelect.dataset.layer = layer.id;
        blendSelect.className = 'blend-select';
        
        this.blendModes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode;
            option.textContent = mode;
            option.selected = mode === layer.blendMode;
            blendSelect.appendChild(option);
        });
        
        blendDiv.appendChild(blendSelect);
        
        div.appendChild(visibilityDiv);
        div.appendChild(nameDiv);
        div.appendChild(opacityDiv);
        div.appendChild(blendDiv);
        
        // Event listeners
        div.querySelector('.layer-visibility').addEventListener('click', () => {
            layer.visible = !layer.visible;
            this.updateLayerPanel();
            this.renderLayers();
        });
        
        div.querySelector('.opacity-slider').addEventListener('input', (e) => {
            layer.opacity = e.target.value / 100;
            this.renderLayers();
        });
        
        div.querySelector('.blend-select').addEventListener('change', (e) => {
            layer.blendMode = e.target.value;
            this.renderLayers();
        });
        
        div.addEventListener('click', () => {
            this.activeLayer = layer;
            this.updateLayerPanel();
        });
        
        return div;
    }
    
    sanitizeAdjustmentType(type) {
        const allowedTypes = ['curves', 'levels', 'colorBalance', 'hsl', 'exposure'];
        return allowedTypes.includes(type) ? type : 'curves';
    }
    
    sanitizeLayerName(name) {
        if (typeof name !== 'string') return 'Capa sin nombre';
        return name.replace(/[<>"'&]/g, '').substring(0, 50) || 'Capa sin nombre';
    }

    deleteLayer(layerId) {
        const index = this.layers.findIndex(l => l.id === layerId);
        if (index > 0) { // No eliminar capa base
            this.layers.splice(index, 1);
            if (this.activeLayer.id === layerId) {
                this.activeLayer = this.layers[Math.max(0, index - 1)];
            }
            this.updateLayerPanel();
            this.renderLayers();
        }
    }

    duplicateLayer(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            const duplicate = JSON.parse(JSON.stringify(layer));
            duplicate.id = `layer_${Date.now()}`;
            duplicate.name += ' Copia';
            
            const index = this.layers.indexOf(layer);
            this.layers.splice(index + 1, 0, duplicate);
            this.activeLayer = duplicate;
            this.updateLayerPanel();
        }
    }
}

// Exportar para uso global
window.LayerSystem = LayerSystem;