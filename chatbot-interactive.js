// Respuestas interactivas para conversación básica
function getInteractiveResponse(message) {
  const msg = message.toLowerCase();
  
  const responses = {
    'hola': '¡Hola! 👋 ¿Qué tipo de imagen vas a editar hoy? ¿Es un retrato, paisaje, o algo más artístico?',
    'hi': '¡Hi! 👋 What kind of photo are you working on? Portrait, landscape, or something creative?',
    'hello': '¡Hello! 👋 Tell me about your photo - is it bright, dark, colorful, or black & white?',
    'buenos días': '¡Buenos días! ☀️ ¿Tu imagen necesita más luz, más color, o prefieres un estilo específico como vintage?',
    'buenas tardes': '¡Buenas tardes! 🌅 ¿Qué ambiente buscas? ¿Algo cálido y acogedor, o frío y dramático?',
    'buenas noches': '¡Buenas noches! 🌙 ¿Trabajas con fotos nocturnas o buscas un estilo más oscuro y misterioso?',
    'gracias': '¡De nada! 😊 ¿Te gustaría probar otro estilo o necesitas ayuda con algún control específico?',
    'thanks': 'You\'re welcome! 😊 Want to try a different style or need help with specific controls?',
    'adiós': '¡Hasta luego! 👋 ¿Guardaste tu preset favorito? ¡Nos vemos pronto!',
    'bye': 'Goodbye! 👋 Did you save your favorite preset? See you soon!',
    'ayuda': '¡Claro! 🎨 ¿Prefieres que te sugiera estilos automáticamente o quieres aprender a usar controles específicos?',
    'help': 'Sure! 🎨 Would you like automatic style suggestions or want to learn specific controls?',
    '¿qué puedes hacer?': '¡Muchas cosas! ✨ ¿Quieres que analice tu imagen actual, te enseñe estilos populares, o prefieres experimentar?',
    'what can you do': 'Lots of things! ✨ Want me to analyze your current image, show popular styles, or experiment?',
    'no sé': '¡No te preocupes! 🤔 ¿Tu imagen está muy oscura, muy clara, o los colores no te convencen?',
    'aburrido': '¡Vamos a darle vida! 🚀 ¿Probamos con colores más vibrantes, un contraste dramático, o efectos vintage?',
    'retrato': '📸 ¡Perfecto! ¿Quieres suavizar la piel, realzar los ojos, o crear un ambiente más cálido?',
    'paisaje': '🌄 ¡Excelente! ¿Buscas colores más vivos, un cielo más dramático, o tonos naturales?',
    'imagen': '🖼️ ¿Qué tipo de imagen quieres? Puedo cargar: bosque, desierto, montaña, océano, ciudad, playa, naturaleza...',
    'foto': '📷 ¡Claro! ¿De qué tema? Ejemplo: "foto de bosque", "imagen de desierto", "paisaje de montaña"...',
    'otra': (typeof lastTheme !== 'undefined' && lastTheme) ? `🔄 ¡Perfecto! Te cargo otra imagen de ${lastTheme}` : '🖼️ ¿Otra imagen de qué tema? Primero dime: bosque, desierto, montaña, océano, ciudad, playa...',
    'another': (typeof lastTheme !== 'undefined' && lastTheme) ? `🔄 Perfect! Loading another ${lastTheme} image` : '🖼️ Another image of what theme? Tell me: forest, desert, mountain, ocean, city, beach...'
  };
  
  for (const [key, response] of Object.entries(responses)) {
    if (msg.includes(key)) return response;
  }
  return null;
}

// Función para manejar tips adicionales
function getFollowUpTip(message) {
  const msg = message.toLowerCase();
  
  if (msg.includes('no sé')) {
    return '💡 Tip: Escribe "analiza" para que examine tu imagen y te dé sugerencias específicas.';
  } else if (msg.includes('ayuda')) {
    return '🎯 Comandos útiles: "analiza", "vintage", "dramático", "más contraste", "tono cálido"';
  }
  return null;
}

// Estado para recordar el último tema
let lastTheme = null;
let themeImageIndex = {};

// Función para cargar imagen temática
function loadThemeImage(theme) {
  const themeUrls = {
    'bosque': [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&crop=center'
    ],
    'forest': [
      'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&h=800&fit=crop&crop=center'
    ],
    'desierto': [
      'https://images.unsplash.com/photo-1682686581427-7c80ab60e3f3?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1682686580391-615b1f28e5ee?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1682686580003-22d3d65399a8?w=1200&h=800&fit=crop&crop=center'
    ],
    'desert': [
      'https://images.unsplash.com/photo-1682686580391-615b1f28e5ee?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1682686580003-22d3d65399a8?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1682686581427-7c80ab60e3f3?w=1200&h=800&fit=crop&crop=center'
    ],
    'montaña': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop&crop=center'
    ],
    'mountain': [
      'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center'
    ],
    'océano': [
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&h=800&fit=crop&crop=center'
    ],
    'ocean': [
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&h=800&fit=crop&crop=center'
    ],
    'ciudad': [
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=800&fit=crop&crop=center'
    ],
    'city': [
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop&crop=center'
    ],
    'playa': [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&crop=center'
    ],
    'beach': [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=800&fit=crop&crop=center'
    ],
    'naturaleza': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=1200&h=800&fit=crop&crop=center'
    ],
    'nature': [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1574263867128-a3d5c1b1deaa?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center'
    ],
    'paisaje': [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop&crop=center'
    ],
    'landscape': [
      'https://images.unsplash.com/photo-1464822759844-d150baec0494?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1200&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center'
    ]
  };
  
  if (!themeUrls[theme]) return null;
  
  if (!themeImageIndex[theme]) themeImageIndex[theme] = 0;
  
  const urls = themeUrls[theme];
  const url = urls[themeImageIndex[theme]];
  themeImageIndex[theme] = (themeImageIndex[theme] + 1) % urls.length;
  
  lastTheme = theme;
  
  return url;
}

// Función para detectar solicitud de imagen
function detectImageRequest(message) {
  const msg = message.toLowerCase();
  
  if ((msg.includes('otra') && (msg.includes('imagen') || msg.includes('foto'))) || 
      (msg.includes('another') && (msg.includes('image') || msg.includes('picture')))) {
    return lastTheme;
  }
  
  const imageKeywords = ['imagen', 'foto', 'picture', 'image', 'carga', 'load', 'muestra', 'show'];
  const hasImageKeyword = imageKeywords.some(keyword => msg.includes(keyword));
  
  if (hasImageKeyword) {
    const themes = Object.keys({
      'bosque': true, 'forest': true, 'desierto': true, 'desert': true,
      'montaña': true, 'mountain': true, 'océano': true, 'ocean': true,
      'ciudad': true, 'city': true, 'playa': true, 'beach': true,
      'naturaleza': true, 'nature': true, 'paisaje': true, 'landscape': true
    });
    
    for (const theme of themes) {
      if (msg.includes(theme)) {
        return theme;
      }
    }
  }
  return null;
}

// Exportar funciones
if (typeof window !== 'undefined') {
  window.getInteractiveResponse = getInteractiveResponse;
  window.getFollowUpTip = getFollowUpTip;
  window.loadThemeImage = loadThemeImage;
  window.detectImageRequest = detectImageRequest;
}