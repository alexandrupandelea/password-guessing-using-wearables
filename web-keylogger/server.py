#!/usr/bin/python
import BaseHTTPServer
import sys
import simplejson
import MySQLdb

TIMESTAMP = "timestamp"
KEYS = "keys"
KEY = "key"
KEYCODE = "keyCode"

class DatabaseOperations:
    def insert_data(self, data):
        if KEYS in data.keys() and len(data[KEYS]) > 0:
            sql = "insert into pressedKeys values "
            db = MySQLdb.connect("localhost","root","","datadb")
            cursor = db.cursor()

            for keyEntry in data[KEYS]:
                sql += "(" + str(keyEntry[TIMESTAMP]) + ", '" + keyEntry[KEY] + "', " + \
                    str(keyEntry[KEYCODE]) + "),"

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
        indexStr = open('index.html', 'r').read()
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

def main(HandlerClass = SimpleHTTPRequestHandler, ServerClass = BaseHTTPServer.HTTPServer):
    BaseHTTPServer.test(HandlerClass, ServerClass)

if __name__ == '__main__':
    test()
