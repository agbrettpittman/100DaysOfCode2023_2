import requests, os
from typing_extensions import Annotated
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi import FastAPI, Form

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
    genres = {
        12:"Adventure",
        14:"Fantasy",
        16:"Animation",
        18:"Drama"
    }

    if (os.environ.get('USE_API') != 'False'):
        url = "https://streaming-availability.p.rapidapi.com/genres"

        headers = {
            "X-RapidAPI-Key": os.environ.get('RAPID_API_KEY'),
            "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com"
        }

        response = requests.get(url, headers=headers)
        data = response.json()
        genres = data['result']

        print(genres)
    
    
    labels = []

    for key in genres:
        labels.append(f'<label><input type="checkbox" name="genres" value="{key}" />{genres[key]}</label>')

    labels_string = '\n'.join(labels)

    return f'''
    {labels_string}
    '''

@app.post("/search", response_class=HTMLResponse)
async def search_movies(keyword: Annotated[str, Form()] = "", services: Annotated[list, Form()] = [], genres: Annotated[list, Form()] = []):
    print(f"keyword: {keyword}")
    print(f"services: {services}")
    print(f"genres: {genres}")

    url = "https://streaming-availability.p.rapidapi.com/search/filters"

    querystring = {
        "services": ",".join(services),
        "country":"us",
        "keyword":keyword,
        "output_language":"en",
        "order_by":"original_title",
        "genres":",".join(genres),
        "genres_relation":"and",
        "show_type":"all"
    }

    headers = {
        "X-RapidAPI-Key": os.environ.get('RAPID_API_KEY'),
        "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)

    print(response.json())

    return f'''
    <h3>Results</h3>
    <table>
        <thead>
            <tr>
                <th>Title</th>
                <th>Year</th>
                <th>Directors</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Movie 1</td>
                <td>2021</td>
                <td>Director 1</td>
            </tr>
            <tr>
                <td>Movie 2</td>
                <td>2020</td>
                <td>Director 2</td>
            </tr>
    </table>
    '''