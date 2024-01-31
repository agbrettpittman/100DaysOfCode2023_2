import requests, os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

app = FastAPI(title="API")
ui_app = FastAPI(title="UI")

print("Running with environment variables:")
print(f"USE_API: {os.environ.get('USE_API')}")
print(f"RAPID_API_KEY: {os.environ.get('RAPID_API_KEY')}")

ui_app.mount("/api", app)
ui_app.mount("/", StaticFiles(directory="client",html = True), name="client")

@app.get("/")
async def get_root():
    return {"message": "Hello World"}

@app.get("/genres", response_class=HTMLResponse)
async def get_genres():
    
    print(os.environ.get('USE_API'))
    print(os.environ.get('RAPID_API_KEY'))
    genres = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy']

    if (os.environ.get('USE_API') != 'False'):
        url = "https://streaming-availability.p.rapidapi.com/genres"

        headers = {
            "X-RapidAPI-Key": os.environ.get('RAPID_API_KEY'),
            "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com"
        }

        response = requests.get(url, headers=headers)
        data = response.json()
        results = data['result']
        genres = []

        for key in results:
            genres.append(results[key])
    
    
    labels = []

    for genre in genres:
        labels.append(f'<label><input type="checkbox" name="genre" value="{genre}" />{genre}</label>')

    labels_string = '\n'.join(labels)

    return f'''
    {labels_string}
    '''