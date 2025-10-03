// Configuración avanzada del chatbot
const ChatbotConfig = {
  // Configuración de API
  api: {
    maxRetries: 3,
    retryDelay: 2000,
    timeout: 30000,
    rateLimit: {
      maxRequests: 20,
      windowMs: 60000
    }
  },

  // Configuración de análisis de imagen
  imageAnalysis: {
    sampleSize: 200,
    cacheSize: 50,
    analysisThresholds: {
      brightness: { dark: 80, bright: 200 },
      saturation: { low: 0.2, high: 0.6 },
      contrast: { low: 0.3, high: 0.8 },
      noise: { threshold: 0.15 }
    }
  },

  // Configuración de aprendizaje
  learning: {
    maxHistory: 100,
    learningRate: 0.2,
    decayFactor: 0.8,
    minConfidence: 0.6
  },

  // Comandos y respuestas
  commands: {
    // Comandos de análisis
    analyze: ['analiza', 'analyze', 'examina', 'examine', 'revisa', 'review'],
    apply: ['aplica', 'apply', 'aplicar', 'usar', 'use'],
    reset: ['reset', 'reinicia', 'restart', 'limpiar', 'clear'],
    help: ['ayuda', 'help', '?'],
    describe: ['que ves', 'qué ves', 'describe', 'observas', 'miras'],
    
    // Comandos de estilo
    styles: {
      vintage: ['vintage', 'retro', 'antiguo', 'clásico'],
      dramatic: ['dramático', 'dramatic', 'intenso', 'fuerte'],
      soft: ['suave', 'soft', 'sutil', 'delicado'],
      warm: ['cálido', 'warm', 'caliente', 'acogedor'],
      cool: ['frío', 'cool', 'azulado', 'helado'],
      cinematic: ['cinematográfico', 'cinematic', 'película', 'movie'],
      natural: ['natural', 'realista', 'orgánico']
    }
  },

  // Presets de estilo
  stylePresets: {
    vintage: {
      exposure: 10,
      contrast: -15,
      saturation: -20,
      temperature: 25,
      vignette: 15,
      clarity: -10
    },
    dramatic: {
      contrast: 30,
      shadows: -40,
      highlights: -20,
      clarity: 25,
      vibrance: 15
    },
    soft: {
      contrast: -10,
      highlights: -15,
      shadows: 15,
      clarity: -20,
      saturation: -5
    },
    warm: {
      temperature: 35,
      tint: 5,
      highlights: -10,
      saturation: 10,
      vibrance: 15
    },
    cool: {
      temperature: -25,
      tint: -5,
      highlights: 10,
      shadows: -10,
      vibrance: 10
    },
    cinematic: {
      contrast: 20,
      shadows: -25,
      temperature: -15,
      vignette: 20,
      clarity: 10
    },
    natural: {
      vibrance: 20,
      clarity: 5,
      shadows: 10,
      highlights: -5,
      saturation: 5
    }
  },

  // Mensajes del sistema
  messages: {
    welcome: {
      default: '¡Hola! 👋 Soy tu asistente de edición profesional con IA. ¿Cómo puedo ayudarte a mejorar tus imágenes?'
    },
    
    errors: {
      noImage: '📸 Necesito que cargues una imagen primero para poder analizarla.',
      apiError: '❌ Error de conexión con la IA. Verifica tu API key o intenta más tarde.',
      rateLimit: '⏱️ Has alcanzado el límite de consultas. Espera un momento antes de continuar.',
      invalidCommand: '🤔 No entendí ese comando. Escribe "ayuda" para ver qué puedo hacer.'
    },

    tips: [
      '💡 Tip: Usa "analiza" para obtener recomendaciones automáticas basadas en tu imagen.',
      '🎨 Tip: Prueba comandos como "más contraste", "tono cálido" o "estilo vintage".',
      '📊 Tip: El histograma te muestra la distribución tonal de tu imagen.',
      '⚡ Tip: Usa Ctrl+Z para reiniciar todos los ajustes rápidamente.',
      '🔄 Tip: Mantén presionado "Antes/Después" para comparar con la imagen original.'
    ]
  },

  // Configuración de UI
  ui: {
    typingDelay: 800,
    messageMaxLength: 500,
    showTypingIndicator: true,
    autoScroll: true,
    animationDuration: 300
  }
};

// Exportar configuración
if (typeof window !== 'undefined') {
  window.ChatbotConfig = ChatbotConfig;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatbotConfig;
}