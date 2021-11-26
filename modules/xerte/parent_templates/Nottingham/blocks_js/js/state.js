export default class state{
    constructor() {
    }

    childState = [];

    exit(){

    }

    enter(){

    }

    addState(state){
        this.childState.push(state)
    }

    removeState(state){
        var i = 0;
        while (i < this.childState.length) {
            if (this.childState[i] === state) {
                this.childState.splice(i, 1);
            } else {
                ++i;
            }
        }
    }

}