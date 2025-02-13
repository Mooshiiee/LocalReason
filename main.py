from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten for production
    allow_methods=["*"],
    allow_headers=["*"]
)

# SPA Serving (Modified from open-webui approach) that handles 404s in the frontend
class SPAStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 404:
            response = await super().get_response(".", scope)
        return response

app.mount("/", SPAStaticFiles(directory="frontend/dist", html=True), name="spa")

@app.get('/hello')
def read_root():
    return {'Hello': 'World'}
