# paxo-site

## Installation for contribute

### Get source code
``git clone https://github.com/paxo-rch/paxo-site.git`` <br>
``cd paxo-site``

### Create virtual environnement
``py -m venv .venv`` <br>
``.\.venv\Sripts\activate`` or ``source ./.venv/bin/activate`` (depends on your OS)

### Install dependencies
``pip install -r requirements.txt``

### Create .env file
Now create a .env file and create in it a field SECRET="your_personal_secret_key"

### Run server
``py manage.py runserver``

## Dependencies

### Backend
- asgiref 3.7.2
- Django 4.2.4
- python-dotenv 1.0.0
- sqlparse 0.4.4
- typing-extensions 4.7.1
- tzdata 2023.3

### Frontend
- htmx 1.9.4
- splidejs 4.1.4
- font-awesome 6.4.0

