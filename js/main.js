// Archivo principal optimizado
import { debounce, throttle, Cache, EventBus } from './utils.js';
import { HistoryManager } from './historyManager.js';
import { ErrorHandler, validateImageFile } from './errorHandler.js';

// Inicialización global
const errorHandler = new ErrorHandler();
const historyManager = new HistoryManager();
const eventBus = new EventBus();
const imageCache = new Cache(50);

// Web Worker optimizado
let imageWorker = null;

const initWorker = () => {
  try {
    imageWorker = new Worker('./workers/imageWorker.js');
    imageWorker.onmessage = (e) => {
      const { type, imageData, histogram, id } = e.data;
      if (type === 'processed') {
        eventBus.emit('imageProcessed', { imageData, histogram });
      }
    };
    console.log('Web Worker initialized');
  } catch (error) {
    errorHandler.logError('Worker Init Error', error);
  }
};

// Sistema Undo/Redo
const setupUndoRedo = () => {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      const state = historyManager.undo();
      if (state) {
        eventBus.emit('stateRestored', state);
        updateUndoRedoButtons();
      }
    });
  }
  
  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      const state = historyManager.redo();
      if (state) {
        eventBus.emit('stateRestored', state);
        updateUndoRedoButtons();
      }
    });
  }
  
  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undoBtn?.click();
    }
    if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      redoBtn?.click();
    }
  });
};

const updateUndoRedoButtons = () => {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  
  if (undoBtn) {
    undoBtn.disabled = !historyManager.canUndo();
    undoBtn.style.opacity = historyManager.canUndo() ? '1' : '0.5';
  }
  
  if (redoBtn) {
    redoBtn.disabled = !historyManager.canRedo();
    redoBtn.style.opacity = historyManager.canRedo() ? '1' : '0.5';
  }
};

// Optimización de sliders con debounce
const optimizeSliders = () => {
  const sliders = document.querySelectorAll('input[type="range"]');
  
  sliders.forEach(slider => {
    const debouncedUpdate = debounce((value) => {
      eventBus.emit('sliderChanged', { id: slider.id, value });
    }, 16); // 60fps
    
    slider.addEventListener('input', (e) => {
      debouncedUpdate(e.target.value);
    });
    
    // Guardar estado en historial al soltar
    slider.addEventListener('mouseup', () => {
      const currentState = getCurrentEditorState();
      historyManager.save(currentState);
      updateUndoRedoButtons();
    });
  });
};

// Validación de archivos mejorada
const setupFileHandling = () => {
  const fileInput = document.getElementById('fileInput');
  
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        validateImageFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          eventBus.emit('imageLoaded', e.target.result);
        };
        reader.readAsDataURL(file);
        
      } catch (error) {
        errorHandler.logError('File Validation Error', error);
      }
    });
  }
};

// Estado del editor
const getCurrentEditorState = () => {
  const sliders = document.querySelectorAll('input[type="range"]');
  const state = {};
  
  sliders.forEach(slider => {
    state[slider.id] = slider.value;
  });
  
  return {
    sliders: state,
    timestamp: Date.now()
  };
};

// Auto-guardado
const setupAutoSave = () => {
  const autoSave = debounce(() => {
    const state = getCurrentEditorState();
    localStorage.setItem('editorAutoSave', JSON.stringify(state));
  }, 2000);
  
  eventBus.on('sliderChanged', autoSave);
};

// Inicialización principal
const init = () => {
  try {
    initWorker();
    setupUndoRedo();
    optimizeSliders();
    setupFileHandling();
    setupAutoSave();
    
    // Restaurar auto-guardado
    const saved = localStorage.getItem('editorAutoSave');
    if (saved) {
      const state = JSON.parse(saved);
      eventBus.emit('stateRestored', state);
    }
    
    updateUndoRedoButtons();
    console.log('Editor initialized successfully');
    
  } catch (error) {
    errorHandler.logError('Initialization Error', error);
  }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Exportar para uso global
window.editorAPI = {
  historyManager,
  eventBus,
  errorHandler,
  imageCache
};