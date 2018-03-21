#!/usr/bin/python
import BaseHTTPServer
import sys
import simplejson

class SimpleHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(301)
        self.send_header('Location', 'https://fitbit-sensors.cf');
        self.end_headers()

    def do_GET(self):
        self.do_HEAD()

def main(HandlerClass=SimpleHTTPRequestHandler,
         ServerClass=BaseHTTPServer.HTTPServer):
    host = ''
    port = 80

    if len(sys.argv) == 2:
        host = sys.argv[1]
        print sys.argv[1]

    server_address = (host, port)

    httpd = ServerClass(server_address, HandlerClass)

    sockaddr = httpd.socket.getsockname()
    print "Serving HTTPS on", sockaddr[0], "port", sockaddr[1]

    httpd.serve_forever()

if __name__ == '__main__':
    main()