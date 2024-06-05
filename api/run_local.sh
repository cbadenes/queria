export MAX_SIZE=100000
export SERVER_URL="http://127.0.0.1:11434"
export USE_FIXED_MODEL="false"
uvicorn main_API:app --timeout-keep-alive 1000 --reload  
