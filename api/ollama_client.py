from pathlib import Path
import requests
import json
import random
import logging
from datetime import datetime
import os


max_size = int(os.getenv("MAX_SIZE", "1000"))  # Default URL if not specified
use_fixed_model = os.getenv('USE_FIXED_MODEL', 'false').lower() == 'true'

# Configuración básica del logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

print("Versión de Requests:", requests.__version__)

def log(message):
    print(f"{datetime.now()} - {message}")
    #return

def create_quiz_generator(server, context, level, OpenQuestion = False):
    context_content = context[:max_size]
    if OpenQuestion:
        print("Open Question")
        sys_model = "llama3_easy_Open" if level == "easy" else "llama3_medium_Open" if level == "medium" else "llama3_hard_Open"
        
        question_format_template = Path("./prompt_templates/openQuestion_format_template.txt").read_text().strip()
        prompt_user = Path("./prompt_templates/" + "human" + "_OpenQuestion_"+level+".txt").read_text().strip() + question_format_template
    
        response = chat(server,"user",prompt_user.replace('{context}',context_content), sys_model)
        final_output = parse_question(response)
        return final_output    
    else:
        sys_model = "llama3_easy" if level == "easy" else "llama3_medium" if level == "medium" else "llama3_hard"

        question_format_template = Path("./prompt_templates/question_format_template.txt").read_text().strip()
        prompt_user = Path("./prompt_templates/" + "human" + "_template_"+level+".txt").read_text().strip() + question_format_template
    
        response = chat(server,"user",prompt_user.replace('{context}',context_content), sys_model)

        final_output = parse_question(response)

        final_output["RESPUESTA"] = final_output["OPCION4"]

        x = random.sample(range(1, 5), 4)
        # New key names mapping
        key_mapping = {"PREGUNTA": "PREGUNTA", "OPCION1": f"OPCION{x[0]}", "OPCION2": f"OPCION{x[1]}", "OPCION3": f"OPCION{x[2]}", "OPCION4": f"OPCION{x[3]}", "RESPUESTA": "RESPUESTA", "EVIDENCIA": "EVIDENCIA"}
        # Create a new dictionary with updated keys
        shuffled_output = {key_mapping.get(old_key, old_key): value for old_key, value in final_output.items()}

        return shuffled_output
        

def parse_question(chat_response):
    response = chat_response.replace("\n","")
    print("Response:",response)
    json_string = response.split("{")[1].split("}")[0]
    question = json.loads("{" + json_string + "}")
    return question


def chat(server, role, message, model = "llama3"):
    chat_model = "llama3" if use_fixed_model else model
    max_intentos = 3
    intentos = 0
    resultado_valido = False
    messages = [
    {
        'role': role,
        'content': message,
    },
    ]
    response = ""
    output = ""
    while not resultado_valido and intentos < max_intentos:
        try:
            log("Role:" + role)
            log("Context: " + message)
            log("making a request to chat: " + chat_model)
            response = requests.post(
                server + "/api/chat",
                json={"model": chat_model,  "messages": messages, "stream": True},
                timeout=(100,300)
            )
            log("response received from chat: " + chat_model)
            response.raise_for_status()
        except requests.exceptions.Timeout:
            print("La solicitud ha superado el tiempo de espera.")
        except requests.exceptions.RequestException as e:
            print(f"Ocurrió un error: {e}")
        #else:
            #print("Respuesta obtenida:", response.text)
        
        output = ""

        for line in response.iter_lines():
            body = json.loads(line)
            if "error" in body:
                raise Exception(body["error"])
            if body.get("done") is False:
                response = body.get("message", "")
                content = response.get("content", "")
                output += content
                # the response streams one token at a time, print that as we receive it
                #print(content, end="", flush=True)

            if body.get("done", False):
                response["content"] = output
                #return output
        
        if '{' in output:
            resultado_valido = True
            print('Respuesta válida recibida:')
        else:
            print('Respuesta no válida, repitiendo la consulta...')
            messages.append({
                'role': role,
                'content': """Recuerda que es obligatorio que el resultado sea en español formateado con el siguiente esquema:
    
    ```json
    {
    	"PREGUNTA": "string"  // tu pregunta generada usando la información del contexto,
        "OPCION1": "string"  // esta es una respuesta falsa,
        "OPCION2": "string" // esta es una respuesta falsa,
        "OPCION3": "string" // esta es una respuesta falsa,
        "OPCION4": "string" // esta es la respuesta verdadera,
        "EVIDENCIA": "string" // esta es una breve explicación de la respuesta correcta
    }
    ```
                """,
            })
            intentos += 1

        if intentos == max_intentos:
            print('No se recibió una respuesta válida después de', max_intentos, 'intentos.')

    return output

def evaluator(server, context, question, answer):
    model = "llama3_evaluator"
    content = context.strip()[:max_size]
    prompt_user= Path("./prompt_templates/evaluator_format_template.txt").read_text().strip()
    prompt_user = prompt_user.replace('{question}', question).replace('{answer}', answer).replace('{context}', content)

    print("Prompt:", prompt_user)
    response = chat(server, "user", prompt_user, model)
    print("Response:", response)
    return parse_question(response)

