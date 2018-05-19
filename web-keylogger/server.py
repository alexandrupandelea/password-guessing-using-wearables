#!/usr/bin/python
from flask import Flask
from flask import jsonify
from flask import request
from flask import json
from flask import Response
import flask
import MySQLdb
import random
import time
import threading
import numbers

TIMESTAMP = "timestamp"
KEYS = "keys"
KEY = "key"
KEYCODE = "keyCode"
SENSORS = "sensors"
ID = "id"
CLIENT_TIME = "clientTime"
SERVER_TIME0 = "serverTime0"
SERVER_TIME1 = "serverTime1"
SUCCESS = "success"
FAIL = "fail"

MIN_ID = 1000
MAX_ID = 9999
MAX_ITER = 1000
NR_SENSOR_DATA = 7
TIMEOUT = 450.0
PRIORITY = 1

passwords = []
pending_ids = []

def purge_pending_ids():
    global pending_ids

    threading.Timer(TIMEOUT, purge_pending_ids).start()
    crt_time = time.time()

    pending_ids = [x for x in pending_ids if crt_time - x[1] <= TIMEOUT]

purge_pending_ids()

app = Flask(__name__)

class DatabaseOperations:
    def random_id(self):
        sql = "select distinct id from pressedKeys"
        db = MySQLdb.connect("localhost","root","","datadb")
        cursor = db.cursor()

        cursor.execute(sql)
        data = cursor.fetchall()

        existing_ids = [data[i][0] for i in range(0, len(data))]

        retries = MAX_ITER
        while True:
            retries -= 1
            if retries == 0:
                break

            random.seed(time.time())
            new_id= random.randint(MIN_ID, MAX_ID)
            if new_id not in existing_ids and new_id not in pending_ids:
                # reserve this id for TIMEOUT seconds
                pending_ids.append([new_id, time.time()])

                return new_id

        return -1

    def correct_key_entry(self, key_entry):
        if (not TIMESTAMP in key_entry) or (not KEY in key_entry) or \
            (not KEYCODE in key_entry):
            return False

        if not isinstance(key_entry[TIMESTAMP], numbers.Number):
            return False

        if len(key_entry[KEY]) != 1:
            return False

        if not isinstance(key_entry[KEYCODE], numbers.Number):
            return False

        return True

    def correct_sensor_entry(self, data, index):
        if not isinstance(data[SENSORS][index], numbers.Number):
            return False

        if not isinstance(data[SENSORS][index + 1], numbers.Number):
            return False

        if not isinstance(data[SENSORS][index + 2], numbers.Number):
            return False

        if not isinstance(data[SENSORS][index + 3], numbers.Number):
            return False

        if not isinstance(data[SENSORS][index + 4], numbers.Number):
            return False

        if not isinstance(data[SENSORS][index + 5], numbers.Number):
            return False

        if not isinstance(data[SENSORS][index + 6], numbers.Number):
            return False

        return True

    def insert_data(self, data):
        sql = ""

        if KEYS in data.keys() and len(data[KEYS]) > 0:
            sql = "insert into pressedKeys values "
            db = MySQLdb.connect("localhost","root","","datadb")
            cursor = db.cursor()

            # remove id from pending list
            global pending_ids
            pending_ids = [x for x in pending_ids if x[0] != data[ID]]

            for key_entry in data[KEYS]:
                if self.correct_key_entry(key_entry):
                    sql += "(" + str(data[ID]) + ", " + '%f' % key_entry[TIMESTAMP] + ", '" + \
                        key_entry[KEY] + "', " + str(key_entry[KEYCODE]) + "),"

        elif SENSORS in data.keys() and len(data[SENSORS]) > 0 and \
            (len(data[SENSORS]) - 1) % NR_SENSOR_DATA == 0:

            sql = "insert into sensorData values "
            db = MySQLdb.connect("localhost","root","","datadb")
            cursor = db.cursor()

            for i in range(0, len(data[SENSORS]) - 1, NR_SENSOR_DATA):
                if self.correct_sensor_entry(data, i):
                    sql += "(" + str(data[SENSORS][-1]) + ", " + '%f' % data[SENSORS][i] + ", " + \
                    '%f' % data[SENSORS][i + 1] + ", " + '%f' % data[SENSORS][i + 2] + ", " + \
                    '%f' % data[SENSORS][i + 3] + ", " + '%f' % data[SENSORS][i + 4] + ", " + \
                    '%f' % data[SENSORS][i + 5] + ", " + '%f' % data[SENSORS][i + 6] + "),"

        if sql != "":
            # remove last ','
            sql = sql[:-1]

            try:
                cursor.execute(sql)
                db.commit()
            except:
                db.rollback()

            db.close()

dbops = DatabaseOperations()

@app.route("/index.html/", methods = ['GET'])
@app.route("/", methods = ['GET'])
def get_index():
    return open('index.html', 'r').read()

@app.route("/index.html/id", methods = ['GET'])
@app.route("/id", methods = ['GET'])
def get_random_id():
    rand_id = dbops.random_id()

    return str(rand_id)

@app.route("/index.html/password", methods = ['GET'])
@app.route("/password", methods = ['GET'])
def get_random_password():
    global passwords
    random.seed(time.time())

    return random.choice(passwords)

@app.route("/index.html/clientTime=<client_time>", methods = ['GET'])
@app.route("/clientTime=<client_time>", methods = ['GET'])
def get_time(client_time):
    crt_time = int(round(time.time() * 1000))

    return jsonify({CLIENT_TIME : client_time, \
                SERVER_TIME0 : crt_time, \
                SERVER_TIME1 : int(round(time.time() * 1000))})

@app.route('/index.html', methods = ['POST'])
@app.route('/', methods = ['POST'])
def post_data():
    resp = None

    if "application/json" in request.headers['Content-Type']:
        print "JSON Message: " + json.dumps(request.json)

        data = request.json
        dbops.insert_data(data)

        resp = Response(SUCCESS, status = 200)
    else:
        resp = Response(FAIL, status = 400)

    return resp

def main():
    global passwords
    with open("passwords") as f:
        passwords = f.readlines()

    passwords = [x.strip() for x in passwords]

    context = ('fullchain.pem', 'privkey.pem')
    app.run(host = '0.0.0.0', ssl_context = context, processes = 10, port = 443)

if __name__ == '__main__':
    main()