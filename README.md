<p align="center">
  <img src="https://github.com/cbadenes/queria/blob/main/docs/logo.png" alt="Logo de QuerIA" width="200" height="200">
</p>

# QuerIA: Automation and Customization of Questionnaires

## Description
**QuerIA** is a platform designed to automate the creation and customization of questionnaires using Artificial Intelligence (AI) technologies. The system allows users to generate quizzes tailored to specific learning needs, facilitating self-assessment and educational reinforcement anytime and anywhere.

## Key Features
- **Automated Question Generation**: Creates multiple-choice or open-ended questions based on the provided content.
- **Quiz Customization**: Adjusts quizzes according to the desired difficulty level and the percentage of open-ended questions.
- **User-Friendly Interface**: Easy to use through a web-friendly interface.
- **AI Implementation**: Uses AI algorithms to analyze text and formulate relevant and challenging questions.

## Technologies Used
- Frontend: HTML, CSS, JavaScript
- Backend: FastAPI, LLMs

## Requirements
To run **QuerIA**, you will need the following:
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Other dependencies, (e.g., Docker if necessary, Python environment)

## Installation and Execution
Follow these steps to set up the **QuerIA** system:

### Set Up the Runtime Environment
1. Clone the project repository to your local machine:
   ```bash
   git clone https://github.com/cbadenes/queria.git
   cd queria
   ```  
2. Navigate to the api folder and run the run.sh script to start the API server:
    ```bash
    cd api
    ./run.sh
    ```  
This script will set up and launch the server required for quiz generation.

3. Open the ```index.html``` file located in the web folder with your web browser to use the application:  
    ```bash
    chrome web/index.html
    ```
This will allow you to interact with QuerIA from the web interface.


## Support
If you encounter any issues or have questions about QuerIA, please [open an issue](https://github.com/cbadenes/queria/issues) in the GitHub repository.

## Contributing
Contributions are welcome. If you would like to contribute to the project, please check the [contribution guidelines](https://github.com/cbadenes/queria) or [open a pull request.](https://github.com/cbadenes/queria/pulls).


## License
his project is licensed under the [Apache-2.0 license]. See the ```LICENSE``` file for more details.
