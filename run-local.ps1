$imageName = "hconsole:latest"
docker build -t $imageName . 
docker run --rm -it -p 8000:8000 -v '.\:/app' -w '/app' $imageName /bin/bash

# Set your Azure Storage connection string here or use an environment variable
export HACKBOX_CONNECTION_STRING="${HACKBOX_CONNECTION_STRING:-DefaultEndpointsProtocol=https;AccountName=YOUR_ACCOUNT_NAME;AccountKey=YOUR_ACCESS_KEY;EndpointSuffix=core.windows.net}"
export HACKBOX_COACH_PWD="coach"
export HACKBOX_COACH_USER="coach"
export HACKBOX_HACKER_PWD="user"
export HACKBOX_HACKER_USER="user"

gunicorn --bind=0.0.0.0 --workers=4 startup:app