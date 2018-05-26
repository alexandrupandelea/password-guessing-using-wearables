#!/bin/bash

sudo gunicorn -w 4 --certfile=fullchain.pem --keyfile=privkey.pem -b 0.0.0.0:443 server:app