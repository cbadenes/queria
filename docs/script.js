// Configuración global
const config = {
    baseURL: 'http://localhost:8000'
};


// script.js
document.getElementById('questionRatio').addEventListener('input', function() {
    document.getElementById('valorRatio').textContent = this.value + '%';
});

// Get the modal
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

function showAlert(customText, isCorrect) {
    var modalContent = document.querySelector(".modal-content");
    var modalText = document.getElementById("modalText");

    // Usando innerHTML para permitir HTML como saltos de línea
    modalText.innerHTML = customText.replace(/\n/g, "<br>"); // Convierte los saltos de línea en etiquetas <br>

    // Eliminar clases previas para resetear los estilos
    modalContent.classList.remove("correct-answer", "incorrect-answer");

    if (isCorrect) {
        modalContent.classList.add("correct-answer"); // Aplicar clase de estilo correcto
    } else {
        modalContent.classList.add("incorrect-answer"); // Aplicar clase de estilo incorrecto
    }
    modal.style.display = "block";
}



// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

async function loadPDF() {
    const fileInput = document.getElementById('pdfInput');
    const numQuestions = parseInt(document.getElementById('numQuestions').value) || 1;
    const difLevel = parseInt(document.getElementById('difLevel').value) || 1;
    const openQuestionRatio = parseInt(document.getElementById('questionRatio').value) || 50;
    const pdfPath = fileInput.files[0];
    const loadingGif = document.getElementById('loadingGif');
    const createButton = document.getElementById('createQuestionerButton');
    const quizDiv = document.getElementById('quiz');


    if (pdfPath) {
        createButton.style.backgroundColor = '#FFA500'; // Cambia el color a naranja
        createButton.textContent = 'Generando...';
        createButton.disabled = true; // Deshabilita el botón para evitar múltiples clics
        loadingGif.style.display = 'block'; // Mostrar el GIF de carga
        quizDiv.innerHTML = ''; // Limpiar el contenedor de resultados antes de generar nuevas preguntas

        const pdf = await pdfjsLib.getDocument(URL.createObjectURL(pdfPath)).promise;
        const numPages = pdf.numPages;
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(' ');
            fullText += textItems + ' '; // Añade un espacio para asegurar que las palabras no se unan al final de una página y el comienzo de la siguiente
        }

        const sentences = fullText.split(/(?<=[.!?])\s+/);
        const chunks = splitChunks(sentences, numQuestions);
        

        // Procesar cada párrafo 
        chunks.forEach((chunkSentences, index) => {
            ratio = openQuestionRatio / 100
            const openQuestion = Math.random() < ratio;            


            fetch(`${config.baseURL}/generate_quiz/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    text: chunkSentences.join(' '), 
                    level: difLevel,
                    openQuestion: openQuestion 
                })
            })
            .then(response => response.json())
            .then(data => {
                if (index === numQuestions - 1 ) {
                    createButton.style.backgroundColor = ''; // Restablece el color original
                    createButton.textContent = 'Crear Cuestionario';
                    createButton.disabled = false; // Volver a habilitar el botón
                    loadingGif.style.display = 'none'; // Ocultar el GIF de carga
                }

                // Crear el contenedor de cada pregunta
                const quizContainer = document.getElementById('quiz');
                const questionDiv = document.createElement('div');
                questionDiv.classList.add('question');

                // Añadir el texto de la pregunta
                const questionText = document.createElement('h2');
                questionText.textContent = data.PREGUNTA;
                questionDiv.appendChild(questionText);

                if (!openQuestion) {
                    // Código para mostrar opciones múltiples
                    // Crear y añadir el formulario
                    const form = document.createElement('form');
                    form.onsubmit = function(event) {
                        event.preventDefault();  // Previene la recarga de la página
                        validateResponse(data, form);
                    };

                    // Desordenar la lista y mostrar el resultado
                    let answerOptions = randomOrder([1, 2, 3, 4]);
                    
                    // Añadir las opciones como elementos del formulario
                    answerOptions.forEach(number => {
                        const labelOption = document.createElement('label');
                        const inputOption = document.createElement('input');
                        inputOption.type = 'radio';
                        inputOption.name = 'respuesta';  // Todos los botones de radio de una pregunta comparten el mismo 'name'
                        const key = "OPCION" + number
                        inputOption.value = data[key];

                        const textOption = document.createTextNode(data[key]);
                        labelOption.appendChild(inputOption);
                        labelOption.appendChild(textOption);

                        const listItem = document.createElement('li');
                        listItem.appendChild(labelOption);
                        form.appendChild(listItem);
                    });

                    // Añadir botón de envío al formulario
                    const submitButton = document.createElement('button');
                    submitButton.type = 'submit';
                    submitButton.textContent = 'Comprobar respuesta';
                    form.appendChild(submitButton);

                    questionDiv.appendChild(form);
                } else {
                    // Código para manejar respuesta abierta
                    const form = document.createElement('form');
                    form.onsubmit = function(event) {
                        event.preventDefault();
                        validateOpenQuestionResponse(data, chunkSentences, form);
                    };

                    //const responseInput = document.createElement('input');
                    //responseInput.type = 'text';
                    //responseInput.name = 'respuesta';
                    //responseInput.required = true;
                    //responseInput.style.width = '100%'; // Asegúrate de que el cuadro de texto utilice todo el ancho disponible

                    const responseInput = document.createElement('textarea');
                    //responseInput.type = 'text';
                    responseInput.name = 'respuesta';
                    responseInput.required = true;
                    //responseInput.style.width = '100%'; // Asegúrate de que el cuadro de texto utilice todo el ancho disponible


                    const submitButton = document.createElement('button');
                    submitButton.type = 'submit';
                    submitButton.textContent = 'Comprobar respuesta';
                    submitButton.style.width = '100%'; // Asegúrate de que el botón utilice todo el ancho disponible


                    form.appendChild(responseInput);
                    form.appendChild(submitButton);
                    questionDiv.appendChild(form);
                }
                
                quizContainer.appendChild(questionDiv);

            })
            .catch(error => console.error('Error:', error));
        });

    } else {
        alert("Por favor, selecciona un archivo PDF.");
        createButton.disabled = false; // Re-habilitar el botón si no se ha cargado un archivo
    }
}

function splitChunks(sentences, numQuestions) {
    const chunks = [];
    const groupSentences = Math.ceil(sentences.length / numQuestions);

    for (let i = 0; i < numQuestions; i++) {
        chunks.push(sentences.slice(i * groupSentences, (i + 1) * groupSentences));
    }

    return chunks;
}

function validateResponse(data, form) {
    const options = form.querySelectorAll('input[type="radio"]');
    let selected;
    options.forEach(option => {
        if (option.checked) {
            selected = option.value;
        }
    });
    
    let result = selected.localeCompare(data.RESPUESTA, 'es', { sensitivity: 'base' });

    let message;
    if (result === 0) {
        message = 'Respuesta correcta!\n\n' + data.EVIDENCIA;
        showAlert(message, true); 
    } else {
        message = 'Respuesta incorrecta.\n\n' + data.EVIDENCIA;
        showAlert(message, false); 
    }
    
}

function validateOpenQuestionResponse(data, parrafo, form) {
    //const userResponse = form.querySelector('input[name="respuesta"]').value.trim();
    const userResponse = form.querySelector('textarea[name="respuesta"]').value.trim();
    const bodyMessage = {
        question: data.PREGUNTA,
        answer: userResponse,
        text: parrafo.join(' ')  
    };

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.style.backgroundColor = '#FFA500'; // Cambia el color a naranja (o cualquier otro color que prefieras)
    submitButton.textContent = 'Validando...';
    submitButton.disabled = true; // Opcional: deshabilitar el botón para evitar múltiples envíos

    fetch(`${config.baseURL}/evaluate_answer/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyMessage)
    })
    .then(response => response.json())
    .then(evaluationResult => {
        // Mostrar el contenido del JSON recibido
        console.log(evaluationResult)
        submitButton.style.backgroundColor = ''; // Restablece el color original
        submitButton.textContent = 'Comprobar respuesta';
        submitButton.disabled = false; // Volver a habilitar el botón
        if (evaluationResult.VALOR < 5) {
            showAlert(evaluationResult.TEXTO, false);
        } else {
            showAlert('¡Respuesta correcta!.\n\n ' + evaluationResult.TEXTO, true);
        }
    })
    .catch(error => {
        console.error('Error al validar la respuesta:', error);
        alert('Hubo un error al validar la respuesta. Por favor, inténtalo de nuevo.');
    });
}


// Función para desordenar la lista usando el algoritmo Fisher-Yates
function randomOrder(valueList) {
    for (let i = valueList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [valueList[i], valueList[j]] = [valueList[j], valueList[i]]; // Intercambiar elementos
    }
    return valueList;
}