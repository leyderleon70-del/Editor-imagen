// Chatbot mejorado con IA y funcionalidades avanzadas
class ImageEditorChatbot {
  constructor() {
    this.apiKey = null;
    this.conversationHistory = [];
    this.currentContext = {
      imageLoaded: false,
      currentAdjustments: {},
      lastAnalysis: null,
      userPreferences: {},
      sessionStats: { messagesCount: 0, imagesAnalyzed: 0, presetsApplied: 0 }
    };
    this.rateLimiter = new Map();
    this.config = window.ChatbotConfig || {};
    this.utils = window.ChatbotUtils || {};
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadUserPreferences();
    this.initializeUI();
    this.loadConversationHistory();
    console.log('🤖 Chatbot avanzado inicializado con configuración completa');
  }
  
  // Cargar historial de conversaciones
  loadConversationHistory() {
    try {
      const saved = localStorage.getItem('chatbot_conversation_history');
      if (saved) {
        this.conversationHistory = JSON.parse(saved);
        // Mantener solo las últimas 50 conversaciones
        if (this.conversationHistory.length > 50) {
          this.conversationHistory = this.conversationHistory.slice(-50);
          this.saveConversationHistory();
        }
      }
    } catch (error) {
      console.warn('Error cargando historial:', error);
      this.conversationHistory = [];
    }
  }
  
  // Guardar historial de conversaciones
  saveConversationHistory() {
    try {
      localStorage.setItem('chatbot_conversation_history', JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.warn('Error guardando historial:', error);
    }
  }

  // Gestión segura de API Key
  async getApiKey() {
    if (this.apiKey) return this.apiKey;
    
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      this.apiKey = storedKey;
      return this.apiKey;
    }
    
    const key = prompt('Ingresa tu API Key de Google Gemini para usar el asistente IA:');
    if (key) {
      this.apiKey = key;
      localStorage.setItem('gemini_api_key', key);
      return this.apiKey;
    }
    
    throw new Error('API Key requerida');
  }

  // Rate limiting para evitar spam
  checkRateLimit() {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const count = this.rateLimiter.get(minute) || 0;
    
    if (count >= 20) {
      throw new Error('Límite de mensajes alcanzado. Espera un minuto.');
    }
    
    this.rateLimiter.set(minute, count + 1);
    
    // Limpiar entradas antiguas
    for (const [key] of this.rateLimiter) {
      if (key < minute - 1) this.rateLimiter.delete(key);
    }
  }

  // Análisis inteligente de comandos mejorado
  analyzeCommand(message) {
    if (this.utils.detectIntent) {
      const intent = this.utils.detectIntent(message);
      const params = this.utils.extractAdjustmentParams ? this.utils.extractAdjustmentParams(message) : {};
      
      return {
        command: intent,
        params: Object.keys(params).length > 0 ? params : this.extractStyleFromMessage(message)
      };
    }
    
    // Fallback al método original
    const msg = message.toLowerCase().trim();
    
    const commands = {
      analyze: /\b(analiza|analyze|examina|examine|revisa|review)\b/i,
      apply: /\b(aplica|apply|aplicar|usar|use)\b/i,
      reset: /\b(reset|reinicia|restart|limpiar|clear)\b/i,
      help: /\b(ayuda|help|\?)\b/i,
      save: /\b(guarda|save|guardar)\b/i,
      load: /\b(carga|load|cargar)\s+(.+)$/i,
      style: /\b(estilo|style)\s+(.+)$/i,
      adjust: /\b(ajusta|adjust|modifica|modify|más|menos|more|less)\b/i
    };

    for (const [command, pattern] of Object.entries(commands)) {
      const match = msg.match(pattern);
      if (match) {
        return { command, params: match[2] || message };
      }
    }

    return { command: 'chat', params: message };
  }
  
  // Extraer estilo del mensaje
  extractStyleFromMessage(message) {
    const msg = message.toLowerCase();
    const styles = this.config.stylePresets || {};
    
    for (const [styleName, preset] of Object.entries(styles)) {
      if (msg.includes(styleName)) {
        return { style: styleName, preset };
      }
    }
    
    // Buscar estilos en configuración de comandos
    if (this.config.commands && this.config.commands.styles) {
      for (const [styleName, keywords] of Object.entries(this.config.commands.styles)) {
        if (keywords.some(keyword => msg.includes(keyword))) {
          return { style: styleName, preset: styles[styleName] };
        }
      }
    }
    
    return null;
  }

  // Respuestas contextuales inteligentes mejoradas
  getContextualResponse(message) {
    if (this.utils.generateContextualResponse) {
      return this.utils.generateContextualResponse(this.currentContext, message);
    }
    
    // Fallback al método original mejorado
    const msg = message.toLowerCase();
    const context = this.currentContext;
    
    // Respuestas basadas en estado
    if (!context.imageLoaded) {
      if (msg.includes('imagen') || msg.includes('foto') || msg.includes('cargar')) {
        return {
          text: '📸 Primero necesitas cargar una imagen. Usa el botón "📁 Subir Imagen" o arrastra una foto aquí.',
          action: 'highlight_upload'
        };
      }
    }

    // Respuestas de saludo contextuales con hora del día
    const hour = new Date().getHours();
    const greetings = {
      'hola': hour < 12 ? '¡Buenos días! ☀️ Soy tu asistente de edición. ¿Qué imagen vamos a mejorar?' : 
              hour < 18 ? '¡Buenas tardes! 🌅 ¿Listo para crear algo increíble?' : 
              '¡Buenas noches! 🌙 Perfecto momento para editar. ¿En qué te ayudo?',
      'buenos días': '¡Buenos días! ☀️ ¿Trabajaremos con retratos, paisajes o algo creativo?',
      'buenas tardes': '¡Buenas tardes! 🌅 ¿Qué estilo buscas para tu imagen?',
      'buenas noches': '¡Buenas noches! 🌙 ¿Editamos algo con ambiente nocturno?'
    };

    for (const [greeting, response] of Object.entries(greetings)) {
      if (msg.includes(greeting)) return { text: response };
    }

    // Respuestas de ayuda específicas mejoradas
    if (msg.includes('ayuda') || msg.includes('help')) {
      const commands = this.config.messages?.help || `🎨 **Comandos disponibles:**
• "analiza" - Examino tu imagen y sugiero mejoras
• "aplica [estilo]" - Aplico estilos: vintage, dramático, suave, etc.
• "más/menos [control]" - Modifico controles específicos
• "reset" - Reinicio todos los ajustes
• "guarda [nombre]" - Guardo preset personalizado

**Estilos rápidos:** vintage, dramático, suave, cálido, frío, cinematográfico`;
      
      return {
        text: commands,
        action: 'show_commands'
      };
    }

    return null;
  }

  // Procesamiento de comandos específicos
  async processCommand(command, params) {
    switch (command) {
      case 'analyze':
        return await this.analyzeCurrentImage();
      
      case 'apply':
        return await this.applyRecommendations();
      
      case 'reset':
        return this.resetAllAdjustments();
      
      case 'style':
        return this.applyStyle(params);
      
      case 'adjust':
        return this.adjustControl(params);
      
      case 'save':
        return this.savePreset(params);
      
      case 'load':
        return this.loadPreset(params);
      
      default:
        return await this.sendToGemini(params);
    }
  }

  // Análisis de imagen con IA
  async analyzeCurrentImage() {
    if (!this.currentContext.imageLoaded) {
      return {
        text: '📸 No hay imagen cargada para analizar. Sube una imagen primero.',
        action: 'highlight_upload'
      };
    }

    try {
      const imageData = this.getImageAnalysisData();
      const prompt = `Analiza esta imagen y sugiere mejoras específicas de edición:
        Brillo promedio: ${imageData.brightness}
        Contraste: ${imageData.contrast}
        Saturación: ${imageData.saturation}
        Tipo: ${imageData.type}
        
        Proporciona 3-4 sugerencias específicas y prácticas.`;

      const response = await this.sendToGemini(prompt);
      this.currentContext.lastAnalysis = response;
      
      return {
        text: `🔍 **Análisis completado:**\n\n${response}\n\n💡 Escribe "aplica" para aplicar las recomendaciones automáticamente.`,
        action: 'show_apply_button'
      };
    } catch (error) {
      return { text: `❌ Error en análisis: ${error.message}` };
    }
  }

  // Aplicar recomendaciones automáticamente
  async applyRecommendations() {
    if (!this.currentContext.lastAnalysis) {
      return { text: '🔍 Primero necesito analizar la imagen. Escribe "analiza".' };
    }

    // Extraer valores sugeridos del análisis
    const adjustments = this.extractAdjustmentsFromAnalysis(this.currentContext.lastAnalysis);
    
    if (Object.keys(adjustments).length === 0) {
      return { text: '⚠️ No pude extraer ajustes específicos del análisis anterior.' };
    }

    // Aplicar ajustes gradualmente
    this.applyAdjustmentsGradually(adjustments);
    
    return {
      text: `✨ **Aplicando recomendaciones:**\n${this.formatAdjustments(adjustments)}\n\n🎯 Los cambios se están aplicando gradualmente.`,
      action: 'apply_adjustments',
      adjustments
    };
  }

  // Aplicar estilos predefinidos mejorado
  applyStyle(styleName) {
    const styles = this.config.stylePresets || {
      'vintage': { exposure: 10, contrast: -15, saturation: -20, temperature: 25, vignette: 15 },
      'dramático': { contrast: 30, shadows: -40, highlights: -20, clarity: 25 },
      'suave': { contrast: -10, highlights: -15, shadows: 15, clarity: -20 },
      'cinematográfico': { contrast: 20, shadows: -25, temperature: -15, vignette: 20 },
      'cálido': { temperature: 35, tint: 5, highlights: -10, saturation: 10, vibrance: 15 },
      'frío': { temperature: -25, tint: -5, highlights: 10, shadows: -10, vibrance: 10 },
      'natural': { vibrance: 20, clarity: 5, shadows: 10, highlights: -5, saturation: 5 }
    };

    const normalizedName = styleName.toLowerCase();
    let style = styles[normalizedName];
    
    // Buscar por sinónimos si no se encuentra directamente
    if (!style && this.config.commands?.styles) {
      for (const [configStyle, keywords] of Object.entries(this.config.commands.styles)) {
        if (keywords.includes(normalizedName)) {
          style = styles[configStyle];
          break;
        }
      }
    }
    
    if (!style) {
      const availableStyles = Object.keys(styles).join(', ');
      return { 
        text: `❌ Estilo "${styleName}" no encontrado.\n\n**Estilos disponibles:** ${availableStyles}\n\n💡 Prueba con: "estilo vintage" o "aplica dramático"` 
      };
    }

    this.applyAdjustmentsGradually(style);
    
    // Registrar en historial
    this.addToHistory('style_applied', { style: styleName, adjustments: style });
    
    return {
      text: `🎨 Aplicando estilo **${styleName}**...\n\n${this.formatAdjustments(style)}`,
      action: 'apply_adjustments',
      adjustments: style
    };
  }

  // Ajustar control específico
  adjustControl(controlText) {
    const adjustments = this.parseControlAdjustment(controlText);
    
    if (!adjustments) {
      return { text: '❌ No entendí el ajuste. Ejemplo: "más contraste", "menos saturación", "brillo +20"' };
    }

    this.applyAdjustmentsGradually(adjustments);
    return {
      text: `🎛️ Ajustando ${Object.keys(adjustments).join(', ')}...`,
      action: 'apply_adjustments',
      adjustments
    };
  }

  // Comunicación con Gemini AI
  async sendToGemini(message) {
    try {
      this.checkRateLimit();
      const apiKey = await this.getApiKey();
      
      const contextPrompt = this.buildContextPrompt(message);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: contextPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API Error ${response.status}`);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      // Guardar en historial
      this.conversationHistory.push({ user: message, bot: result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  // Construir prompt con contexto
  buildContextPrompt(message) {
    const context = this.currentContext;
    let prompt = `Eres un experto en edición de imágenes profesional. 

CONTEXTO ACTUAL:
- Imagen cargada: ${context.imageLoaded ? 'Sí' : 'No'}
- Ajustes actuales: ${JSON.stringify(context.currentAdjustments)}
- Preferencias del usuario: ${JSON.stringify(context.userPreferences)}

INSTRUCCIONES:
- Responde de forma concisa y práctica
- Sugiere valores específicos para controles
- Usa emojis para hacer las respuestas más amigables
- Si mencionas ajustes, usa nombres exactos de controles

USUARIO: ${message}

RESPUESTA:`;

    return prompt;
  }

  // Utilidades para aplicar ajustes
  applyAdjustmentsGradually(adjustments) {
    Object.entries(adjustments).forEach(([control, value], index) => {
      setTimeout(() => {
        this.setControlValue(control, value);
      }, index * 200);
    });
  }

  setControlValue(controlName, value) {
    const controlMap = {
      'exposure': 'exposureSlider',
      'contrast': 'contrastSlider',
      'saturation': 'saturationSlider',
      'warmth': 'temperatureSlider',
      'shadows': 'shadowsSlider',
      'highlights': 'highlightsSlider',
      'clarity': 'claritySlider',
      'vignette': 'vignetteSlider'
    };

    const elementId = controlMap[controlName.toLowerCase()];
    const slider = document.getElementById(elementId);
    
    if (slider) {
      const currentValue = parseInt(slider.value);
      const targetValue = Math.max(slider.min, Math.min(slider.max, currentValue + value));
      
      this.animateSlider(slider, currentValue, targetValue);
      this.currentContext.currentAdjustments[controlName] = targetValue;
    }
  }

  animateSlider(slider, from, to) {
    const duration = 500;
    const steps = 20;
    const stepValue = (to - from) / steps;
    let currentStep = 0;

    const animate = () => {
      if (currentStep <= steps) {
        const value = from + (stepValue * currentStep);
        slider.value = Math.round(value);
        slider.dispatchEvent(new Event('input'));
        currentStep++;
        setTimeout(animate, duration / steps);
      }
    };

    animate();
  }

  // Parsear ajustes de texto natural
  parseControlAdjustment(text) {
    const patterns = [
      { regex: /más\s+(contraste|saturación|brillo|claridad)/i, multiplier: 20 },
      { regex: /menos\s+(contraste|saturación|brillo|claridad)/i, multiplier: -20 },
      { regex: /(contraste|saturación|brillo|claridad)\s*\+(\d+)/i, multiplier: 1 },
      { regex: /(contraste|saturación|brillo|claridad)\s*-(\d+)/i, multiplier: -1 }
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern.regex);
      if (match) {
        const control = match[1].toLowerCase();
        const value = match[2] ? parseInt(match[2]) * pattern.multiplier : pattern.multiplier;
        return { [control]: value };
      }
    }

    return null;
  }

  // Extraer ajustes del análisis de IA
  extractAdjustmentsFromAnalysis(analysis) {
    const adjustments = {};
    const patterns = [
      { regex: /aumentar.*contraste.*(\d+)/i, control: 'contrast' },
      { regex: /reducir.*contraste.*(\d+)/i, control: 'contrast', negative: true },
      { regex: /más.*brillo.*(\d+)/i, control: 'exposure' },
      { regex: /menos.*brillo.*(\d+)/i, control: 'exposure', negative: true },
      { regex: /saturación.*(\d+)/i, control: 'saturation' }
    ];

    patterns.forEach(pattern => {
      const match = analysis.match(pattern.regex);
      if (match) {
        let value = parseInt(match[1]);
        if (pattern.negative) value = -value;
        adjustments[pattern.control] = value;
      }
    });

    return adjustments;
  }

  // Obtener datos de análisis de imagen
  getImageAnalysisData() {
    const canvas = document.getElementById('imageCanvas');
    if (!canvas) return { brightness: 50, contrast: 50, saturation: 50, type: 'unknown' };

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Análisis básico de la imagen
    let totalBrightness = 0;
    let totalSaturation = 0;
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      
      totalBrightness += (r + g + b) / 3;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      totalSaturation += max > 0 ? (max - min) / max : 0;
    }
    
    const pixelCount = imageData.data.length / 4;
    
    return {
      brightness: Math.round((totalBrightness / pixelCount) / 255 * 100),
      saturation: Math.round((totalSaturation / pixelCount) * 100),
      contrast: 50, // Placeholder
      type: 'photo'
    };
  }

  // Gestión de preferencias
  loadUserPreferences() {
    const saved = localStorage.getItem('chatbot_preferences');
    if (saved) {
      this.currentContext.userPreferences = JSON.parse(saved);
    }
  }

  saveUserPreferences() {
    localStorage.setItem('chatbot_preferences', JSON.stringify(this.currentContext.userPreferences));
  }

  // Configuración de eventos
  setupEventListeners() {
    // Escuchar cambios en la imagen
    window.addEventListener('imageLoaded', () => {
      this.currentContext.imageLoaded = true;
    });

    // Escuchar cambios en controles
    document.addEventListener('input', (e) => {
      if (e.target.type === 'range') {
        this.currentContext.currentAdjustments[e.target.id] = e.target.value;
      }
    });
  }

  // Inicializar UI del chatbot
  initializeUI() {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;

    // Limpiar mensajes existentes para evitar duplicación
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.innerHTML = '';
    }

    // Mensaje de bienvenida inteligente
    const welcomeMessage = this.getWelcomeMessage();
    this.addMessage(welcomeMessage, false);
  }

  getWelcomeMessage() {
    return `¡Hola! 👋 Soy tu asistente de edición profesional con IA avanzada.

🎨 **¿Cómo puedo ayudarte?**
• Analizar y mejorar tu imagen automáticamente
• Aplicar estilos profesionales (vintage, dramático, etc.)
• Ajustar controles específicos con comandos naturales
• Enseñarte técnicas de edición profesional
• Recordar tus preferencias para futuras ediciones

💡 **Comandos rápidos:** "analiza", "más contraste", "estilo vintage", "ayuda"`;
  }

  // Métodos de UI
  addMessage(content, isUser = false) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.setAttribute('data-timestamp', Date.now());
    
    if (typeof content === 'object' && content.text) {
      messageDiv.innerHTML = this.formatMessage(content.text);
      if (content.action) {
        this.executeAction(content.action, content);
      }
    } else {
      messageDiv.innerHTML = this.formatMessage(content);
    }
    
    // Animación de entrada
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    chatMessages.appendChild(messageDiv);
    
    // Animar entrada
    requestAnimationFrame(() => {
      messageDiv.style.transition = 'all 0.3s ease';
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateY(0)';
    });
    
    // Auto-scroll suave
    if (this.config.ui?.autoScroll !== false) {
      setTimeout(() => {
        chatMessages.scrollTo({
          top: chatMessages.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }

  formatMessage(text) {
    if (this.utils.formatMessage) {
      return this.utils.formatMessage(text, 'markdown');
    }
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  executeAction(action, data) {
    switch (action) {
      case 'highlight_upload':
        this.highlightElement('#fileInput');
        break;
      case 'show_apply_button':
        this.showApplyButton();
        break;
      case 'apply_adjustments':
        // Los ajustes ya se aplicaron en applyAdjustmentsGradually
        break;
    }
  }

  highlightElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.animation = 'pulse 2s infinite';
      setTimeout(() => {
        element.style.animation = '';
      }, 4000);
    }
  }

  showApplyButton() {
    // Crear botón temporal para aplicar recomendaciones
    const button = document.createElement('button');
    button.textContent = '✨ Aplicar Recomendaciones';
    button.className = 'btn apply-recommendations-btn';
    button.onclick = () => {
      this.processCommand('apply');
      button.remove();
    };
    
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.appendChild(button);
    }
  }

  // Formatear ajustes para mostrar
  formatAdjustments(adjustments) {
    return Object.entries(adjustments)
      .map(([control, value]) => `• ${control}: ${value > 0 ? '+' : ''}${value}`)
      .join('\n');
  }

  // Resetear ajustes
  resetAllAdjustments() {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      slider.value = slider.defaultValue || 0;
      slider.dispatchEvent(new Event('input'));
    });
    
    this.currentContext.currentAdjustments = {};
    return { text: '🔄 Todos los ajustes han sido reiniciados.' };
  }

  // Manejar mensaje del usuario mejorado
  async handleUserMessage(message) {
    if (!message.trim()) return;

    // Sanitizar entrada
    const sanitizedMessage = this.utils.sanitizeInput ? this.utils.sanitizeInput(message) : message.trim();
    
    this.addMessage(sanitizedMessage, true);
    this.currentContext.sessionStats.messagesCount++;
    
    // Agregar al historial
    this.addToHistory('user_message', { message: sanitizedMessage, timestamp: Date.now() });
    
    try {
      // Mostrar indicador de escritura
      this.showTypingIndicator();
      
      // Analizar comando
      const { command, params } = this.analyzeCommand(sanitizedMessage);
      
      // Verificar respuesta contextual primero
      const contextualResponse = this.getContextualResponse(sanitizedMessage);
      if (contextualResponse) {
        setTimeout(() => {
          this.hideTypingIndicator();
          this.addMessage(contextualResponse);
        }, this.config.ui?.typingDelay || 800);
        return;
      }
      
      // Procesar comando
      const response = await this.processCommand(command, params);
      
      setTimeout(() => {
        this.hideTypingIndicator();
        this.addMessage(response);
        
        // Agregar respuesta al historial
        this.addToHistory('bot_response', { response, timestamp: Date.now() });
      }, this.config.ui?.typingDelay || 800);
      
    } catch (error) {
      this.hideTypingIndicator();
      const errorMessage = this.getErrorMessage(error);
      this.addMessage(errorMessage);
      
      // Log error for debugging
      console.error('Chatbot error:', error);
    }
  }
  
  // Obtener mensaje de error apropiado
  getErrorMessage(error) {
    const errorMessages = this.config.messages?.errors;
    
    if (error.message.includes('API Key')) {
      return errorMessages?.apiError || '❌ Error de API Key. Verifica tu configuración.';
    }
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return errorMessages?.rateLimit || '⏱️ Límite de consultas alcanzado. Espera un momento.';
    }
    if (error.message.includes('imagen') || error.message.includes('image')) {
      return errorMessages?.noImage || '📸 Necesito una imagen cargada para continuar.';
    }
    
    return `❌ Error: ${error.message}`;
  }
  
  // Agregar al historial
  addToHistory(type, data) {
    this.conversationHistory.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    // Mantener solo las últimas 100 entradas
    if (this.conversationHistory.length > 100) {
      this.conversationHistory = this.conversationHistory.slice(-100);
    }
    
    this.saveConversationHistory();
  }

  showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing';
    typingDiv.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  hideTypingIndicator() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
  }
}

// Inicializar chatbot cuando el DOM esté listo
let chatbot = null;

function initializeChatbot() {
  if (document.getElementById('chatMessages')) {
    chatbot = new ImageEditorChatbot();
    
    // Configurar eventos de entrada
    const chatInput = document.getElementById('chatInput');
    const chatSendBtn = document.getElementById('chatSendBtn');
    
    if (chatInput && chatSendBtn) {
      const handleSend = () => {
        const message = chatInput.value.trim();
        if (message) {
          chatbot.handleUserMessage(message);
          chatInput.value = '';
        }
      };
      
      chatSendBtn.addEventListener('click', handleSend);
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }
  }
}

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
  initializeChatbot();
}

// Exportar para uso global
window.ImageEditorChatbot = ImageEditorChatbot;
window.chatbot = chatbot;