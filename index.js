import {createServer} from "http";
import {createServer as createSocket} from 'sockjs';
import Board from "./game/field.js";


const httpServer = createServer();
const socketServer = createSocket();
let poolOfClients = [];

socketServer.installHandlers(httpServer);
httpServer.listen(process.env.PORT);

socketServer.on('connection', connection => {
    poolOfClients = [...poolOfClients, connection];

    connection.on('close', () => {
        poolOfClients = poolOfClients.filter(c => c !== connection);
    });

    connection.on('data', (msg) => {
        try {
            const parsedData = JSON.parse(msg);
            switch (parsedData.type) {
                case "firstStep":
                    firstStepHandle(connection, parsedData.payload);
                    break;
                case "step":
                    stepHandle(connection, parsedData.payload);
                    break;
                case "clearBoard":
                    clearBoardHandle();
                    break;
                case "getBoardState":
                    getBoardStateHandle(connection);
                    break;
                default:
                    defaultHandle(connection);
                    break;
            }
        } catch (e) {
            console.log(e);
        }
    });
});

function firstStepHandle(connection, payload) {
    const board = Board.getInstance();
    const { result } = board.firstStep(payload);

    const currentState = board.currentGameState();

    if(result) {
        const message = JSON.stringify({type: 'firstStepSuccess', payload: currentState});
        poolOfClients.forEach(conn =>
            conn.write(message)
        )
    } else {
        console.log(payload)
        const message = JSON.stringify({type: 'firstStepFailed', payload: currentState});
        connection.write(message);
    }
}

function stepHandle(connection, payload) {
    const board = Board.getInstance();
    const { result } = board.step(payload);

    const currentState = board.currentGameState();

    if(result) {
        const message = JSON.stringify({type: 'stepSuccess', payload: currentState});
        poolOfClients.forEach(conn =>
            conn.write(message)
        )
    } else {
        const message = JSON.stringify({type: 'stepFailed', payload: currentState});
        connection.write(message);
    }
}

function clearBoardHandle() {
    const board = Board.getInstance();

    board.clear();

    const message = JSON.stringify({type: 'clearBoard', payload: board.currentGameState()});
    poolOfClients.forEach(conn =>
        conn.write(message)
    );
}

function getBoardStateHandle(connection) {
    const board = Board.getInstance();

    connection.write(JSON.stringify({type: 'boardState', payload: board.currentGameState()}));
}

function defaultHandle(connection) {
    console.log('default');
    connection.write(JSON.stringify({type: 'pong'}));
}
