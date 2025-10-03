// Sistema robusto de manejo de errores
export class ErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.setupGlobalHandlers();
  }
  
  setupGlobalHandlers() {
    window.addEventListener('error', (e) => {
      this.logError('JavaScript Error', e.error, {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (e) => {
      this.logError('Unhandled Promise Rejection', e.reason);
    });
  }
  
  logError(type, error, context = {}) {
    const errorInfo = {
      type,
      message: error?.message || error,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      context,
      userAgent: navigator.userAgent
    };
    
    this.errors.push(errorInfo);
    
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    console.error(`[${type}]`, errorInfo);
    this.showUserFriendlyError(type, error);
  }
  
  showUserFriendlyError(type, error) {
    const messages = {
      'Image Load Error': 'No se pudo cargar la imagen. Verifica que el archivo sea válido.',
      'Processing Error': 'Error al procesar la imagen. Intenta con una imagen más pequeña.',
      'Save Error': 'No se pudo guardar el archivo. Verifica los permisos.',
      'Network Error': 'Error de conexión. Verifica tu conexión a internet.'
    };
    
    const message = messages[type] || 'Ha ocurrido un error inesperado.';
    this.showNotification(message, 'error');
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'error' ? '#cc0000' : '#0066cc'};
      color: white;
      border-radius: 4px;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  getErrors() {
    return this.errors;
  }
  
  clearErrors() {
    this.errors = [];
  }
}

// Validaciones
export const validateImageFile = (file) => {
  if (!file || typeof file !== 'object') {
    throw new Error('Archivo no válido o no proporcionado.');
  }
  
  if (!file.type || !file.size) {
    throw new Error('Propiedades del archivo faltantes.');
  }
  
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 50 * 1024 * 1024; // 50MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de archivo no soportado. Usa JPEG, PNG, WebP o GIF.');
  }
  
  if (file.size > maxSize) {
    throw new Error('El archivo es demasiado grande. Máximo 50MB.');
  }
  
  return true;
};

export const validatePresetData = (data) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Datos de preset no válidos o no proporcionados.');
  }
  
  const requiredFields = ['exposure', 'contrast', 'saturation'];
  const missingFields = requiredFields.filter(field => !(field in data));
  
  if (missingFields.length > 0) {
    throw new Error(`Faltan campos requeridos: ${missingFields.join(', ')}`);
  }
  
  return true;
};