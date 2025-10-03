// Función para obtener la API key de forma segura
function getApiKey() {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (!storedKey) {
        const userKey = prompt('Por favor, ingresa tu API Key de Google Gemini:');
        if (userKey) {
            localStorage.setItem('gemini_api_key', userKey);
            return userKey;
        }
        throw new Error('API Key requerida para usar el asistente de IA');
    }
    return storedKey;
}

window.getApiKey = getApiKey;