// Paso 0: Tu Clave API de Google Cloud
// Asegúrate de que esta clave sea válida y esté descomentada en tu archivo real.
const API_KEY = "xxx"; // REEMPLAZA ESTO SIN CORCHETES

let personaje = {
    salud: 5, honor: 0, peso: "Normal",
    npc_relaciones: { Cripps: "Neutral", Madam_Nazar: "Desconocido" }
};

// Función principal: llama a la API y actualiza la UI
async function procesarDiario() {
    const textoDiario = document.getElementById('entradaDiario').value;
    if (!textoDiario) return;

    // AHORA LLAMAMOS A LA FUNCIÓN REAL DE LA API
    const apiResult = await llamarGoogleCloudNLAPI(textoDiario);
    
    // --> PUNTO CRÍTICO DE DEBUGGING <--
    console.log("Respuesta completa de Google Cloud:", apiResult); 

    mapearAtributos(apiResult, textoDiario);
    actualizarUI();
}

// Función REAL que llama a Google Cloud NL API (CORREGIDA)
async function llamarGoogleCloudNLAPI(texto) {
    const googleEndpoint = `language.googleapis.com{API_KEY}`;
    
    // Añade el proxy delante de la URL de Google
    const endpoint = `corsproxy.io{encodeURIComponent(googleEndpoint)}`;
    
    // CAMBIO 2: El objeto 'document' debe estar dentro de un objeto de solicitud si usas Analyze Entities
    const data = {
        document: { content: texto, type: 'PLAIN_TEXT', language: 'es' },
        encodingType: 'UTF8'
    };

    try {
        const respuesta = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!respuesta.ok) {
            // Manejar errores de la API (ej. clave inválida, cuota excedida)
            const errorBody = await respuesta.json();
            console.error("Error en la llamada a la API:", errorBody);
            alert("Error al conectar con la API de Google: " + errorBody.error.message);
            return null; // Devolvemos null para evitar errores en mapearAtributos
        }
        
        return await respuesta.json(); // Devuelve el JSON de Google

    } catch (error) {
        // Manejar errores de red o CORS
        console.error("Error de red o CORS:", error);
        alert("No se pudo conectar con el servidor de Google. Revisa la consola para más detalles (posible error de CORS o configuración de backend).");
        return null;
    }
}

// Función de Mapeo (donde el error de lógica podría estar)
function mapearAtributos(apiResult, textoOriginal) {
    // Asegúrate de que apiResult exista y tenga entidades antes de continuar
    if (!apiResult || !apiResult.entities) {
        console.error("API Result is invalid or empty, skipping mapping.", apiResult);
        return;
    }

    const textoMinusculas = textoOriginal.toLowerCase();
    
    apiResult.entities.forEach(entidad => {
        const nombreEntidad = entidad.name.toLowerCase();

        // Reglas para Salud usando la respuesta de la API y el texto original
        if (nombreEntidad.includes('salud') || nombreEntidad.includes('vida')) {
            if (textoMinusculas.includes('nivel 6') || textoMinusculas.includes('a 6')) {
                personaje.salud = 6;
            } else if (textoMinusculas.includes('máximo') || textoMinusculas.includes('tope')) {
                personaje.salud = 10;
            }
        }
        // ... (añade más reglas aquí para honor, cripps, etc.)
    });
}

// Función para mostrar los datos en la UI (sin cambios)
function actualizarUI() {
    document.getElementById('attrSalud').textContent = personaje.salud;
    document.getElementById('attrHonor').textContent = personaje.honor;
    document.getElementById('attrPeso').textContent = personaje.peso;
    document.getElementById('attrCripps').textContent = personaje.npc_relaciones.Cripps;
}

// Inicializar la UI al cargar la página
actualizarUI();


