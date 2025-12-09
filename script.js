// Paso 0: Tu Clave API de Google Cloud
const API_KEY = "[AIzaSyCPd2nZNScU79Zt_8P3H5Bj3r50QG2xYKM]"; // <-- REEMPLAZA ESTO CON TU CLAVE REAL

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

// Función REAL que llama a Google Cloud NL API
async function llamarGoogleCloudNLAPI(texto) {
    const endpoint = `language.googleapis.com{API_KEY}`;
    const data = {
        document: { content: texto, type: 'PLAIN_TEXT', language: 'es' },
        encodingType: 'UTF8'
    };

    const respuesta = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    return await respuesta.json(); // Devuelve el JSON de Google
}

// Función de Mapeo (donde el error de lógica podría estar)
function mapearAtributos(apiResult, textoOriginal) {
    const textoMinusculas = textoOriginal.toLowerCase();
    
    // Asegúrate de que apiResult.entities exista
    if (!apiResult || !apiResult.entities) {
        console.error("API Result is invalid or empty", apiResult);
        return;
    }

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