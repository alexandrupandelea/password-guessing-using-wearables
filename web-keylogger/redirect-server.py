import flask
from flask import Response
from flask import Flask

app = Flask(__name__)

@app.route("/index.html/", methods=['GET'])
@app.route("/", methods=['GET'])
def redirect_all():
    resp = Response("", status = 301)
    resp.headers["Location"] = "https://fitbit-sensors.cf"

    return resp


def main():
    app.run(host = '0.0.0.0', threaded = True, port = 80)

if __name__ == '__main__':
    main()
