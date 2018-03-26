#!/usr/bin/python
import BaseHTTPServer
import sys
import json
import MySQLdb
import random
import ssl

TIMESTAMP = "timestamp"
KEYS = "keys"
KEY = "key"
KEYCODE = "keyCode"
SENSORS = "sensors"

NR_SENSOR_DATA = 7

passwords = []

class DatabaseOperations:
    def correct_key_entry(self, key_entry):
        if (not TIMESTAMP in key_entry) or (not KEY in key_entry) or \
            (not KEYCODE in key_entry):
            return False

        if not isinstance(key_entry[TIMESTAMP], int):
            return False

        if len(key_entry[KEY]) != 1:
            return False

        if not isinstance(key_entry[KEYCODE], int):
            return False

        return True

    def correct_sensor_entry(self, data, index):
        if not isinstance(data[SENSORS][index], int):
            return False

        if not isinstance(data[SENSORS][index + 1], float):
            return False

        if not isinstance(data[SENSORS][index + 2], float):
            return False

        if not isinstance(data[SENSORS][index + 3], float):
            return False

        if not isinstance(data[SENSORS][index + 4], float):
            return False

        if not isinstance(data[SENSORS][index + 5], float):
            return False

        if not isinstance(data[SENSORS][index + 6], float):
            return False

        return True

    def insert_data(self, data):
        sql = ""

        if KEYS in data.keys() and len(data[KEYS]) > 0:
            sql = "insert into pressedKeys values "
            db = MySQLdb.connect("localhost","root","","datadb")
            cursor = db.cursor()

            for key_entry in data[KEYS]:
                if self.correct_key_entry(key_entry):
                    sql += "(" + str(key_entry[TIMESTAMP]) + ", '" + key_entry[KEY] + \
                        "', " + str(key_entry[KEYCODE]) + "),"

        elif SENSORS in data.keys() and len(data[SENSORS]) > 0 and \
            len(data[SENSORS]) % NR_SENSOR_DATA == 0:

            sql = "insert into sensorData values "
            db = MySQLdb.connect("localhost","root","","datadb")
            cursor = db.cursor()

            for i in range(0, len(data[SENSORS]), NR_SENSOR_DATA):
                if self.correct_sensor_entry(data, i):
                    sql += "(" + str(data[SENSORS][i]) + ", " + str(data[SENSORS][i + 1]) + \
                    ", " + str(data[SENSORS][i + 2]) + ", " + str(data[SENSORS][i + 3]) + ", " + \
                    str(data[SENSORS][i + 4]) + ", " + str(data[SENSORS][i + 5]) + ", " + \
                    str(data[SENSORS][i + 6]) + "),"

        if sql != "":
            # remove last ','
            sql = sql[:-1]

            try:
                cursor.execute(sql)
                db.commit()
            except:
                db.rollback()

            db.close()

class SimpleHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    dbops = DatabaseOperations()

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        self._set_headers()

        if self.path == "/" or self.path == "/index.html":
            indexStr = open('index.html', 'r').read()
        elif self.path == "/password":
            global passwords
            indexStr = random.choice(passwords)
        else:
            indexStr = "Invalid path"

        self.wfile.write(indexStr)

    def do_POST(self):
        r = self.receive_post_data()
        if r:
            self.send_response(200)
        else:
            self.send_response(400)
        self.end_headers()

    def receive_post_data(self):
        remainbytes = int(self.headers['content-length'])

        data = json.loads(self.rfile.read(remainbytes))

        print "{}".format(data)

        self.dbops.insert_data(data)

        return True

def test(HandlerClass=SimpleHTTPRequestHandler,
         ServerClass=BaseHTTPServer.HTTPServer):
    host = ''
    port = 443

    if len(sys.argv) == 2:
        host = sys.argv[1]
        print sys.argv[1]

    server_address = (host, port)

    httpd = ServerClass(server_address, HandlerClass)
    httpd.socket = ssl.wrap_socket (httpd.socket, keyfile='privkey.pem', \
        certfile='./fullchain.pem', server_side=True)

    sockaddr = httpd.socket.getsockname()
    print "Serving HTTPS on", sockaddr[0], "port", sockaddr[1]

    httpd.serve_forever()

def main():

    global passwords
    with open("passwords") as f:
        passwords = f.readlines()

    passwords = [x.strip() for x in passwords]

    test()

if __name__ == '__main__':
    main()