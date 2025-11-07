from flask import Flask, request, jsonify
from flask_cors import CORS
from algorithms.a_star import a_star_search

app = Flask(__name__)
CORS(app)

@app.route("/path", methods=["POST"])
def get_path():
    data = request.get_json()
    start = tuple(data["start"])
    goal = tuple(data["goal"])
    grid = data["grid"]
    path = a_star_search(grid, start, goal)
    return jsonify({"path": path})

if __name__ == "__main__":
    app.run(debug=True)
