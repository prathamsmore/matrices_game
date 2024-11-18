$(document).ready(function() {
    const appID = "<your-app-id>";
    const apiKey = "<your-api-key>";
    const dbUrl = `https://data.mongodb-api.com/app/${appID}/endpoint/data/v1/action/find`;

    let score = 0;
    let timer;
    const operations = ["Addition", "Multiplication", "Subtraction", "Transpose", "Determinant"];

    function startGame() {
        $('#gameOverScreen').hide();
        $('#gameScreen').show();
        score = 0;
        $('#score').text(score);
        nextRound();
    }

    function nextRound() {
        const matrixA = generateMatrix();
        const matrixB = generateMatrix();
        const operation = operations[Math.floor(Math.random() * operations.length)];
        $('#operation').text(`Perform ${operation}`);
        displayMatrix('matrixA', matrixA);
        displayMatrix('matrixB', matrixB);

        const correctAnswer = getOperationResult(operation, matrixA, matrixB);
        const options = generateOptions(correctAnswer);
        setOptions(options, correctAnswer);
        startTimer();
    }

    function generateMatrix() {
        return Array.from({ length: 3 }, () => Array(3).fill(0).map(() => Math.floor(Math.random() * 10)));
    }

    function displayMatrix(id, matrix) {
        const matrixDiv = $(`#${id}`);
        matrixDiv.empty();
        matrix.forEach(row => {
            row.forEach(val => matrixDiv.append(`<input type="number" value="${val}" readonly>`));
        });
    }

    function getOperationResult(operation, A, B) {
        switch(operation) {
            case "Addition": return addMatrices(A, B);
            case "Multiplication": return multiplyMatrices(A, B);
            case "Subtraction": return subtractMatrices(A, B);
            case "Transpose": return transposeMatrix(A);
            case "Determinant": return calculateDeterminant(A);
        }
    }

    function addMatrices(A, B) {
        return A.map((row, i) => row.map((val, j) => val + B[i][j]));
    }

    function multiplyMatrices(A, B) {
        const result = Array.from({ length: 3 }, () => Array(3).fill(0));
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    result[i][j] += A[i][k] * B[k][j];
                }
            }
        }
        return result;
    }

    function subtractMatrices(A, B) {
        return A.map((row, i) => row.map((val, j) => val - B[i][j]));
    }

    function transposeMatrix(A) {
        return A[0].map((_, colIndex) => A.map(row => row[colIndex]));
    }

    function calculateDeterminant(A) {
        return A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
               A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
               A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    }

    function generateOptions(correctAnswer) {
        const options = [JSON.stringify(correctAnswer)];
        while (options.length < 4) {
            const randomAnswer = JSON.stringify(generateMatrix());
            if (!options.includes(randomAnswer)) options.push(randomAnswer);
        }
        return options.sort(() => Math.random() - 0.5);
    }

    function setOptions(options, correctAnswer) {
        $('.option-btn').each((index, button) => {
            const answerMatrix = JSON.parse(options[index]);
            $(button).html(answerMatrix.map(row => `<div>${row.join(' ')}</div>`).join(''));
            $(button).off('click').on('click', () => {
                if (JSON.stringify(answerMatrix) === JSON.stringify(correctAnswer)) {
                    score++;
                    $('#score').text(score);
                    resetTimer();
                    nextRound();
                } else {
                    endGame();
                }
            });
        });
    }

    function startTimer() {
        let timeLeft = 180;
        $('#timer').text(timeLeft);
        timer = setInterval(() => {
            timeLeft--;
            $('#timer').text(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timer);
                endGame();
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timer);
    }

    function endGame() {
        $('#gameScreen').hide();
        $('#gameOverScreen').show();
        $('#finalScore').text(score);
    }

    $('#replayButton').click(startGame);

    $('#submitScore').click(function() {
        const playerName = $('#playerName').val();
        if (playerName.trim() !== '') {
            submitScore(playerName, score);
        }
    });

    function submitScore(playerName, score) {
        const data = {
            playerName,
            score
        };
        //mongodb+srv://pratham95:0987654321@cluster0.r6loz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0


        fetch('https://data.mongodb-api.com/app/<your-app-id>/endpoint/data/v1/action/insertOne', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': apiKey
            },
            body: JSON.stringify({
                dataSource: 'Cluster0',
                database: 'matrix_game',
                collection: 'leaderboard',
                document: data
            })
        }).then(response => response.json())
          .then(data => alert('Score Submitted!'))
          .catch(error => console.error('Error:', error));
    }

    function getLeaderboard() {
        fetch(dbUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': apiKey
            },
            body: JSON.stringify({
                dataSource: 'Cluster0',
                database: 'matrix_game',
                collection: 'leaderboard',
                filter: {},
                sort: { score: -1 },
                limit: 5
            })
        }).then(response => response.json())
          .then(data => {
              const leaderboardList = data.documents.map(entry => `<li>${entry.playerName}: ${entry.score}</li>`).join('');
              $('#leaderboardList').html(leaderboardList);
          })
          .catch(error => console.error('Error:', error));
    }

    getLeaderboard();
    startGame();
});
