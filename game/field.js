function getClearMap() {
    return [
        'None', 'None', 'None',
        'None', 'None', 'None',
        'None', 'None', 'None'
    ]
}

const WIN_COMB = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
]

function checkIsGameEnd(map) {
    return WIN_COMB.some(comb =>
        comb.every(pos => map[pos] === 'X') ||
        comb.every(pos => map[pos] === '0')
    );
}

export default class Board {
    static instance;
    map = getClearMap();
    steps = [];
    status = 'start';


    checkGameEnd() {
        const isGameEnd = this.steps.length >=5 && checkIsGameEnd(this.map);
        if (isGameEnd) {
            this.status = 'Finished';
        }
    }

    changeMap(cellNum, step) {
        this.map[cellNum] = step % 2 === 0 ? '0' : 'X';
    }

    static getInstance() {
        if (!Board.instance) {
            Board.instance = new Board();
        }
        return Board.instance;
    }

    currentGameState() {
        return {
            map: this.map,
            steps: this.steps,
            status: this.status,
        }
    }

    clear() {
        this.status = 'Start';
        this.map = getClearMap();
        this.steps = [];
    }

    firstStep(stepData) {
        const isFieldCorrect = stepData.field >= 0 && stepData.field < 9;
        const isMapEmpty = this.map.every(f => f === 'None');
        const isNoSteps = this.steps.length === 0;

        const step = {
            id: 0,
            prevStep: undefined,
            field: stepData.field,
        }

        if (isFieldCorrect && isMapEmpty && isNoSteps) {
            this.steps = [step]
            this.changeMap(stepData.field, 0);

            this.status = 'Game';

            return {result: true};
        } else {
            return {result: false};
        }
    }

    step(stepData) {
        const isProgression = this.steps.length > 0 && this.steps.slice(-1)[0].id === stepData.prevStep && this.status === 'Game';
        const isFieldCorrect = stepData.field >= 0 && stepData.field < 9 && this.map[stepData.field] === 'None';
        console.log(this.steps.slice(-1)[0].id === stepData.prevStep);
        if (isFieldCorrect && isProgression) {
            const step = {
                id: this.steps.length,
                prevStep: this.steps.length - 1,
                field: stepData.field,
            }

            this.steps = [...this.steps, step];
            this.changeMap(stepData.field, step.id);

            this.checkGameEnd();

            return {result: true};
        } else {
            return {result: false};
        }

    }
}