# QuerIA: Automatización y Personalización de Cuestionarios

## Descripción
**QuerIA** es una plataforma diseñada para automatizar la creación y personalización de cuestionarios utilizando tecnologías de Inteligencia Artificial (IA). El sistema permite a los usuarios generar cuestionarios adaptados a necesidades específicas de aprendizaje, facilitando la autoevaluación y el refuerzo educativo desde cualquier lugar y en cualquier momento.

## Características Principales
- **Generación Automatizada de Preguntas**: Crea preguntas de múltiple elección o abiertas basadas en el contenido proporcionado.
- **Personalización de Cuestionarios**: Ajusta los cuestionarios según el nivel de dificultad deseado y el porcentaje de preguntas abiertas.
- **Interfaz Sencilla de Usuario**: Facilidad de uso a través de una interfaz web amigable.
- **Implementación de IA**: Utiliza algoritmos de IA para analizar el texto y formular preguntas pertinentes y desafiantes.

## Tecnologías Utilizadas
- Frontend: HTML, CSS, JavaScript
- Backend: FastAPI, LLMs

## Requisitos
Para ejecutar **QuerIA**, necesitarás lo siguiente:
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- [Otras dependencias, e.g., Docker si es necesario, entorno de Python]

## Instalación y Ejecución
Sigue estos pasos para poner en marcha el sistema **QuerIA**:

### Configurar el entorno de ejecución
1. Clona el repositorio del proyecto en tu máquina local:
   ```bash
   git clone https://github.com/cbadenes/queria.git
   cd queria
   ```  
2. Navega a la carpeta api y ejecuta el script run.sh para arrancar el servidor de la API
    ```bash
    cd api
    ./run.sh
    ```  
Este script configurará y lanzará el servidor necesario para la generación de cuestionarios.  

3. Abre el archivo index.html que se encuentra en la carpeta web con tu navegador web para utilizar la aplicación:  
    ```bash
    chrome web/index.html
    ```
Esto te permitirá interactuar con QuerIA desde la interfaz web.


## Soporte
Si tienes problemas o preguntas acerca de QuerIA, por favor [abre un issue](https://github.com/cbadenes/queria/issues) en el repositorio de GitHub.

## Contribuir
Las contribuciones son bienvenidas. Si deseas contribuir al proyecto, por favor revisa las [guías de contribución](https://github.com/cbadenes/queria) o [abre un pull request](https://github.com/cbadenes/queria/pulls).


## Licencia
Este proyecto está licenciado bajo [Apache-2.0 license], ver el archivo LICENSE.md para más detalles.
