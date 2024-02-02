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


@app.get("/services", response_class=HTMLResponse)
async def get_services():
    services = {
        "netflix": "Netflix",
        "disney": "Disney+",
        "hulu": "Hulu",
    }

    if (os.environ.get('USE_API') != 'False'):
        url = "https://streaming-availability.p.rapidapi.com/countries"

        headers = {
            "X-RapidAPI-Key": os.environ.get('RAPID_API_KEY'),
            "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com"
        }

        response = requests.get(url, headers=headers)
        data = response.json()
        servicesObject = data['result']['us']['services']
        services = {}

        for serviceKey in servicesObject:
            individualService = servicesObject[serviceKey]
            supportedStreamingTypes = individualService['supportedStreamingTypes']
            if (supportedStreamingTypes['free']):
                services[f"{individualService['id']}.free"] = f"{individualService['name']} (Free)"
            if (supportedStreamingTypes['subscription']):
                services[f"{individualService['id']}.subscription"] = f"{individualService['name']} (Subscription)"

    labels = []

    for key in services:
        labels.append(f'<label><input type="checkbox" name="services" value="{key}" />{services[key]}</label>')

    labels_string = '\n'.join(labels)

    return f'''
    {labels_string}
    '''




@app.get("/genres", response_class=HTMLResponse)
async def get_genres():
    
    genres = {
        12:"Adventure",
        16:"Animation",
        18:"Drama",
        14:"Fantasy"
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

        # resort the genres based on the value
        genres = dict(sorted(genres.items(), key=lambda item: item[1])) 
    
    labels = []

    for key in genres:
        labels.append(f'<label><input type="checkbox" name="genres" value="{key}" />{genres[key]}</label>')

    labels_string = '\n'.join(labels)

    return f'''
    {labels_string}
    '''

@app.post("/search", response_class=HTMLResponse)
async def search_movies(keyword: Annotated[str, Form()] = "", services: Annotated[list, Form()] = [], genres: Annotated[list, Form()] = []):

    if (len(services) == 0):
        return "<p class='form-error'>Please select at least one service</p>"

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
        "show_type":"movie",
    }

    headers = {
        "X-RapidAPI-Key": os.environ.get('RAPID_API_KEY'),
        "X-RapidAPI-Host": "streaming-availability.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()
    print(data)
    movies = data['result']
    tableRows = []

    for movie in movies:
        services = []
        serviceData = movie['streamingInfo']['us']
        for serviceObject in serviceData:
            services.append(serviceObject['service'])

        services = list(set(services))

        tableRows.append(f'''
        <tr>
            <td>{movie['year']}</td>
            <td>{movie['title']}</td>
            <td>{",".join(movie['directors'])}</td>
            <td>{", ".join(services)}</td>
        </tr>
        ''')

    return f'''
    <h3>Results</h3>
    <table>
        <thead>
            <tr>
                <th>Year</th>
                <th>Title</th>
                <th>Directors</th>
                <th>Services</th>
            </tr>
        </thead>
        <tbody>
            {''.join(tableRows)}
        </tbody>
    </table>
    '''