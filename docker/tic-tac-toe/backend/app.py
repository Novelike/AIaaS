from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def check_winner(board):
    win_conditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]             # Diagonals
    ]
    
    for condition in win_conditions:
        a, b, c = condition
        if board[a] and board[a] == board[b] == board[c]:
            return board[a]
    return None

@app.route('/api/check', methods=['POST'])
def check_game():
    data = request.get_json()
    board = data['board']
    winner = check_winner(board)
    return jsonify({'winner': winner})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)