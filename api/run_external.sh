export MAX_SIZE=150
export SERVER_URL="https://librairy.linkeddata.es/ollama"
export USE_FIXED_MODEL="true"
uvicorn main_API:app --timeout-keep-alive 1000 --reload  
