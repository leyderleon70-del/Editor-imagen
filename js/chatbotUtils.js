// Utilidades avanzadas para el chatbot
class ChatbotUtils {
  
  // Análisis de sentimiento básico
  static analyzeSentiment(text) {
    const positive = ['genial', 'perfecto', 'excelente', 'increíble', 'fantástico', 'me gusta', 'bueno', 'bien'];
    const negative = ['malo', 'horrible', 'feo', 'no me gusta', 'terrible', 'awful', 'bad'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positive.some(p => word.includes(p))) score += 1;
      if (negative.some(n => word.includes(n))) score -= 1;
    });
    
    return { score, sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral' };
  }

  // Extractor de valores numéricos del texto
  static extractNumbers(text) {
    const numbers = text.match(/[+-]?\d+(\.\d+)?/g);
    return numbers ? numbers.map(n => parseFloat(n)) : [];
  }

  // Detector de intención mejorado
  static detectIntent(message) {
    const msg = message.toLowerCase();
    
    // Intenciones específicas
    const intents = {
      analyze: /\b(analiza|analyze|examina|revisa|mira|observa)\b/i,
      apply: /\b(aplica|apply|usa|use|ejecuta)\b/i,
      adjust: /\b(ajusta|adjust|modifica|cambia|sube|baja|aumenta|reduce)\b/i,
      style: /\b(estilo|style|preset|filtro|efecto)\b/i,
      compare: /\b(compara|compare|antes|después|diferencia)\b/i,
      help: /\b(ayuda|help|\?|cómo|como|qué|que)\b/i,
      reset: /\b(reset|reinicia|limpia|borra|vuelve)\b/i,
      save: /\b(guarda|save|exporta|descarga)\b/i,
      load: /\b(carga|load|abre|importa)\b/i
    };

    for (const [intent, pattern] of Object.entries(intents)) {
      if (pattern.test(msg)) {
        return intent;
      }
    }

    return 'general';
  }

  // Extractor de parámetros de ajuste
  static extractAdjustmentParams(text) {
    const msg = text.toLowerCase();
    const params = {};

    // Patrones para diferentes tipos de ajustes
    const patterns = {
      exposure: /\b(exposición|exposure|brillo|brightness)\s*([+-]?\d+)/i,
      contrast: /\b(contraste|contrast)\s*([+-]?\d+)/i,
      saturation: /\b(saturación|saturation|color)\s*([+-]?\d+)/i,
      temperature: /\b(temperatura|temperature|cálido|frío|warm|cool)\s*([+-]?\d+)/i,
      highlights: /\b(luces|highlights|altas)\s*([+-]?\d+)/i,
      shadows: /\b(sombras|shadows|bajas)\s*([+-]?\d+)/i,
      clarity: /\b(claridad|clarity|nitidez)\s*([+-]?\d+)/i,
      vibrance: /\b(vibrance|vibrancia)\s*([+-]?\d+)/i
    };

    // Patrones de dirección
    const directions = {
      more: /\b(más|more|aumenta|sube|higher)\s+(\w+)/i,
      less: /\b(menos|less|reduce|baja|lower)\s+(\w+)/i,
      warmer: /\b(más\s+cálido|warmer|cálido)/i,
      cooler: /\b(más\s+frío|cooler|frío)/i
    };

    // Buscar valores específicos
    for (const [param, pattern] of Object.entries(patterns)) {
      const match = msg.match(pattern);
      if (match) {
        params[param] = parseInt(match[2]);
      }
    }

    // Buscar direcciones
    for (const [direction, pattern] of Object.entries(directions)) {
      const match = msg.match(pattern);
      if (match) {
        const control = match[2] || direction;
        const value = direction.includes('more') || direction.includes('warmer') ? 20 : -20;
        
        // Mapear controles en español
        const controlMap = {
          'contraste': 'contrast',
          'saturación': 'saturation',
          'exposición': 'exposure',
          'brillo': 'exposure',
          'luces': 'highlights',
          'sombras': 'shadows',
          'claridad': 'clarity',
          'cálido': 'temperature',
          'frío': 'temperature'
        };

        const mappedControl = controlMap[control] || control;
        if (['contrast', 'saturation', 'exposure', 'highlights', 'shadows', 'clarity', 'temperature'].includes(mappedControl)) {
          params[mappedControl] = direction === 'cooler' ? -20 : value;
        }
      }
    }

    return params;
  }

  // Generador de respuestas contextuales
  static generateContextualResponse(context, userMessage) {
    const { imageLoaded, currentAdjustments, lastAnalysis, sessionStats } = context;
    
    if (!imageLoaded) {
      return {
        text: '📸 Primero necesitas cargar una imagen. Usa el botón "📁 Subir Imagen" o arrastra una foto aquí.',
        action: 'highlight_upload'
      };
    }

    const intent = this.detectIntent(userMessage);
    
    switch (intent) {
      case 'analyze':
        return {
          text: '🔍 Analizando tu imagen... Esto puede tomar unos segundos.',
          action: 'start_analysis'
        };
        
      case 'help':
        return {
          text: `🎨 **Comandos disponibles:**
• "analiza" - Examino tu imagen y sugiero mejoras
• "aplica [estilo]" - Aplico estilos: vintage, dramático, suave, etc.
• "más/menos [control]" - Ajusto controles específicos
• "reset" - Reinicio todos los ajustes
• "compara" - Muestro antes y después

**Estilos rápidos:** vintage, dramático, suave, cálido, frío, cinematográfico`,
          action: 'show_help'
        };
        
      case 'compare':
        return {
          text: '🔄 Mantén presionado el botón "Antes/Después" para ver la imagen original, o dime qué aspectos específicos quieres comparar.',
          action: 'highlight_compare'
        };
        
      default:
        if (sessionStats.messagesCount === 0) {
          return {
            text: '¡Hola! 👋 Soy tu asistente de edición con IA. ¿Qué te gustaría hacer con tu imagen?',
            action: 'welcome'
          };
        }
        return null;
    }
  }

  // Validador de comandos
  static validateCommand(command, params) {
    const validCommands = ['analyze', 'apply', 'adjust', 'reset', 'save', 'load', 'compare'];
    
    if (!validCommands.includes(command)) {
      return { valid: false, error: 'Comando no reconocido' };
    }

    if (command === 'adjust' && Object.keys(params).length === 0) {
      return { valid: false, error: 'No se especificaron parámetros de ajuste' };
    }

    return { valid: true };
  }

  // Formateador de mensajes
  static formatMessage(text, type = 'text') {
    switch (type) {
      case 'markdown':
        return text
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/\n/g, '<br>');
          
      case 'list':
        return text
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.startsWith('•') ? line : `• ${line}`)
          .join('<br>');
          
      default:
        return text.replace(/\n/g, '<br>');
    }
  }

  // Generador de sugerencias automáticas
  static generateAutoSuggestions(input, context) {
    const suggestions = [];
    const msg = input.toLowerCase();

    // Sugerencias basadas en entrada parcial
    if (msg.includes('anal')) {
      suggestions.push('analiza mi imagen');
    }
    if (msg.includes('más') || msg.includes('aument')) {
      suggestions.push('más contraste', 'más saturación', 'más brillo');
    }
    if (msg.includes('menos') || msg.includes('reduc')) {
      suggestions.push('menos saturación', 'menos contraste', 'menos brillo');
    }
    if (msg.includes('estilo') || msg.includes('preset')) {
      suggestions.push('estilo vintage', 'estilo dramático', 'estilo suave');
    }
    if (msg.includes('cálido') || msg.includes('warm')) {
      suggestions.push('tono más cálido', 'temperatura +20');
    }
    if (msg.includes('frío') || msg.includes('cool')) {
      suggestions.push('tono más frío', 'temperatura -20');
    }

    // Sugerencias basadas en contexto
    if (context.imageLoaded && !context.lastAnalysis) {
      suggestions.push('analiza esta imagen');
    }
    if (context.currentAdjustments && Object.keys(context.currentAdjustments).length > 0) {
      suggestions.push('reset todos los ajustes', 'guarda este preset');
    }

    return suggestions.slice(0, 5); // Máximo 5 sugerencias
  }

  // Calculadora de similitud de texto
  static calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  // Distancia de Levenshtein para similitud de texto
  static levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Generador de IDs únicos
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Debounce para optimización
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle para optimización
  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Validador de entrada de usuario
  static sanitizeInput(input) {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .substring(0, 500); // Límite de caracteres
  }

  // Detector de idioma básico
  static detectLanguage(text) {
    const spanishWords = ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'por', 'son', 'con', 'para', 'al', 'más', 'muy', 'pero', 'sus', 'me', 'ya', 'todo', 'esta', 'fue', 'han', 'ser', 'su', 'hacer', 'tiempo', 'puede', 'dos', 'años', 'estado', 'sobre', 'entre', 'durante', 'también', 'sin', 'hasta', 'donde', 'desde', 'tanto', 'como', 'cuando', 'imagen', 'foto', 'contraste', 'saturación', 'brillo'];
    const englishWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'image', 'photo', 'contrast', 'saturation', 'brightness'];
    
    const words = text.toLowerCase().split(/\s+/);
    let spanishCount = 0;
    let englishCount = 0;
    
    words.forEach(word => {
      if (spanishWords.includes(word)) spanishCount++;
      if (englishWords.includes(word)) englishCount++;
    });
    
    if (spanishCount > englishCount) return 'es';
    if (englishCount > spanishCount) return 'en';
    return 'unknown';
  }

  // Formateador de tiempo
  static formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    if (diff < 60000) return 'hace un momento';
    if (diff < 3600000) return `hace ${Math.floor(diff / 60000)} minutos`;
    if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)} horas`;
    return time.toLocaleDateString();
  }
}

// Exportar utilidades
if (typeof window !== 'undefined') {
  window.ChatbotUtils = ChatbotUtils;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatbotUtils;
}