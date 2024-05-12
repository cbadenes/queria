// script.js

async function cargarPDF() {
    const fileInput = document.getElementById('pdfInput');
    const numGrupos = parseInt(document.getElementById('numGrupos').value) || 1;
    const pdfPath = fileInput.files[0];

    if (pdfPath) {
        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(pdfPath)).promise;
        const numPages = pdf.numPages;
        let textoCompleto = '';

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(' ');
            textoCompleto += textItems + ' '; // Añade un espacio para asegurar que las palabras no se unan al final de una página y el comienzo de la siguiente
        }

        const frases = textoCompleto.split(/(?<=[.!?])\s+/);
        const grupos = dividirEnGrupos(frases, numGrupos);

        // Procesar cada párrafo (ejemplo: enviar cada uno al API)
        grupos.forEach((parrafo, index) => {
            fetch('http://localhost:8000/generate_quiz/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: parrafo.join(' '), level: 1 })
            })
            .then(response => response.json())
            .then(data => {
                // Crear el contenedor de cada pregunta

                const contenedor = document.getElementById('resultado');
            
                const preguntaDiv = document.createElement('div');
                preguntaDiv.classList.add('pregunta');

                // Añadir el texto de la pregunta
                const tituloPregunta = document.createElement('h2');
                tituloPregunta.textContent = data.PREGUNTA;
                preguntaDiv.appendChild(tituloPregunta);

                // Crear y añadir el formulario
                const form = document.createElement('form');
                form.onsubmit = function(event) {
                    event.preventDefault();  // Previene la recarga de la página
                    validarRespuesta(data, form);
                };

                // Añadir las opciones como elementos del formulario
                Object.keys(data).forEach(key => {
                    if (key.startsWith('OPCION')) {
                        const opcionLabel = document.createElement('label');
                        const opcionInput = document.createElement('input');
                        opcionInput.type = 'radio';
                        opcionInput.name = 'respuesta' + index;  // Todos los botones de radio de una pregunta comparten el mismo 'name'
                        opcionInput.value = data[key];

                        const opcionText = document.createTextNode(data[key]);
                        opcionLabel.appendChild(opcionInput);
                        opcionLabel.appendChild(opcionText);

                        const listItem = document.createElement('li');
                        listItem.appendChild(opcionLabel);
                        form.appendChild(listItem);
                    }
                });

                // Añadir botón de envío al formulario
                const submitButton = document.createElement('button');
                submitButton.type = 'submit';
                submitButton.textContent = 'Comprobar respuesta';
                form.appendChild(submitButton);

                preguntaDiv.appendChild(form);
                contenedor.appendChild(preguntaDiv);

            })
            .catch(error => console.error('Error:', error));
        });

    } else {
        alert("Por favor, selecciona un archivo PDF.");
    }
}

function dividirEnGrupos(frases, numGrupos) {
    const grupos = [];
    const frasesPorGrupo = Math.ceil(frases.length / numGrupos);

    for (let i = 0; i < numGrupos; i++) {
        grupos.push(frases.slice(i * frasesPorGrupo, (i + 1) * frasesPorGrupo));
    }

    return grupos;
}

function validarRespuesta(data, form) {
    const opciones = form.querySelectorAll('input[type="radio"]');
    let seleccionado;
    opciones.forEach(opcion => {
        if (opcion.checked) {
            seleccionado = opcion.value;
        }
    });
    
    let mensaje;
    if (seleccionado === data.RESPUESTA) {
        mensaje = 'Respuesta correcta!\n';
    } else {
        mensaje = 'Respuesta incorrecta.\n' + data.EVIDENCIA;
    }
    alert(mensaje);  // Mostrar el mensaje con la evidencia
}