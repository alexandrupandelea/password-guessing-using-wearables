#!/usr/bin/python
import BaseHTTPServer
import sys
import simplejson
import MySQLdb
import random

TIMESTAMP = "timestamp"
KEYS = "keys"
KEY = "key"
KEYCODE = "keyCode"

passwords = []

class DatabaseOperations:
    def correct_key_entry(self, keyEntry):
        if (not TIMESTAMP in keyEntry) or (not KEY in keyEntry) or \
            (not KEYCODE in keyEntry):
            return False

        if not isinstance(keyEntry[TIMESTAMP], int):
            return False

        if len(keyEntry[KEY]) != 1:
            return False

        if not isinstance(keyEntry[KEYCODE], int):
            return False

        return True

    def insert_data(self, data):
        if KEYS in data.keys() and len(data[KEYS]) > 0:
            sql = "insert into pressedKeys values "
            db = MySQLdb.connect("localhost","root","","datadb")
            cursor = db.cursor()

            for keyEntry in data[KEYS]:
                if self.correct_key_entry(keyEntry):
                    sql += "(" + str(keyEntry[TIMESTAMP]) + ", '" + keyEntry[KEY] + \
                        "', " + str(keyEntry[KEYCODE]) + "),"

            # remove last ','
            sql = sql[:-1]

            try:
                print sql
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

        data = simplejson.loads(self.rfile.read(remainbytes))
        print "{}".format(data)

        self.dbops.insert_data(data)

        return True

def test(HandlerClass=SimpleHTTPRequestHandler,
         ServerClass=BaseHTTPServer.HTTPServer):
    host = ''
    port = 80

    if len(sys.argv) == 2:
        host = sys.argv[1]
        print sys.argv[1]

    server_address = (host, port)

    httpd = ServerClass(server_address, HandlerClass)

    sockaddr = httpd.socket.getsockname()
    print "Serving HTTP on", sockaddr[0], "port", sockaddr[1]

    httpd.serve_forever()

def main():

    global passwords
    with open("passwords") as f:
        passwords = f.readlines()

    passwords = [x.strip() for x in passwords]

    test()

if __name__ == '__main__':
    main()