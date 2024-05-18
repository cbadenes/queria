// script.js

async function cargarPDF() {
    const fileInput = document.getElementById('pdfInput');
    const numGrupos = parseInt(document.getElementById('numGrupos').value) || 1;
    const nivelDificultad = parseInt(document.getElementById('nivelDificultad').value) || 1;
    const pdfPath = fileInput.files[0];
    const loadingGif = document.getElementById('loadingGif');
    const botonCrear = document.getElementById('botonCrearCuestionario');
    const resultadoDiv = document.getElementById('resultado');


    if (pdfPath) {
        botonCrear.style.backgroundColor = '#FFA500'; // Cambia el color a naranja
        botonCrear.textContent = 'Generando...';
        botonCrear.disabled = true; // Deshabilita el botón para evitar múltiples clics
        loadingGif.style.display = 'block'; // Mostrar el GIF de carga
        resultadoDiv.innerHTML = ''; // Limpiar el contenedor de resultados antes de generar nuevas preguntas

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
            const openQuestion = Math.random() < 0.4;
            const uniqueSeed = new Date().getTime() + index;  // Combina tiempo y el índice del bucle


            fetch('http://localhost:8000/generate_quiz/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: parrafo.join(' '), 
                    level: nivelDificultad,
                    openQuestion: openQuestion 
                })
            })
            .then(response => response.json())
            .then(data => {
                if (index === numGrupos - 1 ) {
                    botonCrear.style.backgroundColor = ''; // Restablece el color original
                    botonCrear.textContent = 'Crear Cuestionario';
                    botonCrear.disabled = false; // Volver a habilitar el botón
                    loadingGif.style.display = 'none'; // Ocultar el GIF de carga
                }

                // Crear el contenedor de cada pregunta
                const contenedor = document.getElementById('resultado');
                const preguntaDiv = document.createElement('div');
                preguntaDiv.classList.add('pregunta');

                // Añadir el texto de la pregunta
                const tituloPregunta = document.createElement('h2');
                tituloPregunta.textContent = data.PREGUNTA;
                preguntaDiv.appendChild(tituloPregunta);

                if (!openQuestion) {
                    // Código para mostrar opciones múltiples
                    // Crear y añadir el formulario
                    const form = document.createElement('form');
                    form.onsubmit = function(event) {
                        event.preventDefault();  // Previene la recarga de la página
                        validarRespuesta(data, form);
                    };

                    // Desordenar la lista y mostrar el resultado
                    let lista = desordenarListaFisherYates([1, 2, 3, 4]);
                    
                    // Añadir las opciones como elementos del formulario
                    lista.forEach(number => {
                        const opcionLabel = document.createElement('label');
                        const opcionInput = document.createElement('input');
                        opcionInput.type = 'radio';
                        opcionInput.name = 'respuesta' + number;  // Todos los botones de radio de una pregunta comparten el mismo 'name'
                        const key = "OPCION" + number
                        opcionInput.value = data[key];

                        const opcionText = document.createTextNode(data[key]);
                        opcionLabel.appendChild(opcionInput);
                        opcionLabel.appendChild(opcionText);

                        const listItem = document.createElement('li');
                        listItem.appendChild(opcionLabel);
                        form.appendChild(listItem);
                    });

                    // Añadir botón de envío al formulario
                    const submitButton = document.createElement('button');
                    submitButton.type = 'submit';
                    submitButton.textContent = 'Comprobar respuesta';
                    form.appendChild(submitButton);

                    preguntaDiv.appendChild(form);
                } else {
                    // Código para manejar respuesta abierta
                    const form = document.createElement('form');
                    form.onsubmit = function(event) {
                        event.preventDefault();
                        validarRespuestaOpenQuestion(data, parrafo, form);
                    };

                    const inputRespuesta = document.createElement('input');
                    inputRespuesta.type = 'text';
                    inputRespuesta.name = 'respuesta';
                    inputRespuesta.required = true;
                    inputRespuesta.style.width = '100%'; // Asegúrate de que el cuadro de texto utilice todo el ancho disponible


                    const submitButton = document.createElement('button');
                    submitButton.type = 'submit';
                    submitButton.textContent = 'Comprobar respuesta';
                    submitButton.style.width = '100%'; // Asegúrate de que el botón utilice todo el ancho disponible


                    form.appendChild(inputRespuesta);
                    form.appendChild(submitButton);
                    preguntaDiv.appendChild(form);
                }
                
                contenedor.appendChild(preguntaDiv);

            })
            .catch(error => console.error('Error:', error));
        });

    } else {
        alert("Por favor, selecciona un archivo PDF.");
        botonCrear.disabled = false; // Re-habilitar el botón si no se ha cargado un archivo
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
    
    let resultado = seleccionado.localeCompare(data.RESPUESTA, 'es', { sensitivity: 'base' });

    let mensaje;
    if (resultado === 0) {
        mensaje = 'Respuesta correcta!\n' + data.EVIDENCIA;
    } else {
        mensaje = 'Respuesta incorrecta.\n' + data.EVIDENCIA;
    }
    alert(mensaje);  // Mostrar el mensaje con la evidencia
}

function validarRespuestaOpenQuestion(data, parrafo, form) {
    const respuestaUsuario = form.querySelector('input[name="respuesta"]').value.trim();
    const datosParaEnviar = {
        question: data.PREGUNTA,
        answer: respuestaUsuario,
        text: parrafo.join(' ')  
    };

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.style.backgroundColor = '#FFA500'; // Cambia el color a naranja (o cualquier otro color que prefieras)
    submitButton.textContent = 'Validando...';
    submitButton.disabled = true; // Opcional: deshabilitar el botón para evitar múltiples envíos

    fetch('http://localhost:8000/evaluate_answer/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosParaEnviar)
    })
    .then(response => response.json())
    .then(resultadoEvaluacion => {
        // Mostrar el contenido del JSON recibido
        console.log(resultadoEvaluacion)
        submitButton.style.backgroundColor = ''; // Restablece el color original
        submitButton.textContent = 'Comprobar respuesta';
        submitButton.disabled = false; // Volver a habilitar el botón
        if (resultadoEvaluacion.VALOR < 5) {
            alert(resultadoEvaluacion.TEXTO);
        } else {
            alert('¡Respuesta correcta!.\n ' + resultadoEvaluacion.TEXTO);
        }
    })
    .catch(error => {
        console.error('Error al validar la respuesta:', error);
        alert('Hubo un error al validar la respuesta. Por favor, inténtalo de nuevo.');
    });
}


// Función para desordenar la lista usando el algoritmo Fisher-Yates
function desordenarListaFisherYates(lista) {
    for (let i = lista.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lista[i], lista[j]] = [lista[j], lista[i]]; // Intercambiar elementos
    }
    return lista;
}