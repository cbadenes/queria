from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ollama_client import create_quiz_generator, evaluator
from pydantic import BaseModel

import json
import time
import uvicorn
import os


#server = "https://librairy.linkeddata.es/ollama" #remote
server = os.getenv("SERVER_URL", "http://127.0.0.1:11434")  # Default URL if not specified

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Lista de orígenes permitidos, "*" significa todos los orígenes (no recomendado para producción)
    allow_credentials=True,
    allow_methods=["*"],  # Métodos HTTP permitidos
    allow_headers=["*"],  # Cabeceras HTTP permitidas
)

class DataInput(BaseModel):
    text: str
    level: int = 2
    answer: str = None
    question: str = None
    openQuestion: bool = False



@app.post("/generate_quiz/")
async def genera_cuestionario(input: DataInput):
    level = "easy" if input.level == 1 else "medium" if input.level == 2 else "hard"
    
    start_time = time.time()
    print("making one " + level + " questionaire..")
    
    output = create_quiz_generator(server, input.text, level, input.openQuestion)

    end_time = time.time()
    duration = end_time - start_time  
    print(json.dumps(output, indent=2, ensure_ascii=False))
    print(f"Request served in {duration} seconds")
    #return  json.dumps(output, indent=2, ensure_ascii=False)
    return output


@app.post("/evaluate_answer/")
async def answer_evaluation(input: DataInput):
    start_time = time.time()
    print("evaluating the answer..")
    
    output = evaluator(server, input.text, input.question, input.answer)

    end_time = time.time()
    duration = end_time - start_time  
    print(f"Request served in {duration} seconds")
    #return  json.dumps(output, indent=2, ensure_ascii=False)
    return output


