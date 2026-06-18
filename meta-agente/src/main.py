import uvicorn
from apscheduler.schedulers.background import BackgroundScheduler
from telemetry import setup_logging
from datalake import QdrantCache
from ledger import MockLedger
from eternal_maze import EternalMaze
from graph import build_workflow
from api import create_app
from config import CLEANUP_INTERVAL

setup_logging()
cache, ledger, maze = QdrantCache(), MockLedger(), EternalMaze()
workflow = build_workflow(cache, ledger, maze)
app = create_app(workflow, ledger)

scheduler = BackgroundScheduler()
scheduler.add_job(cache.cleanup_expired, "interval", seconds=CLEANUP_INTERVAL)
scheduler.start()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
