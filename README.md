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

