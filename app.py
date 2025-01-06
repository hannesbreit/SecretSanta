import os
from dotenv import load_dotenv
from app import create_app, db

# Load environment variables from a .env file if it exists
load_dotenv()

config_name = os.getenv('FLASK_CONFIG') or 'development'
app = create_app(config_name)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=8000)  # Ensure the app runs on the correct host and port