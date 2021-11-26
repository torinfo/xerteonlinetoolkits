function state(){


    this.childState = [];

    this.exit = exit;
    this.enter = enter;
    this.addState = addState;
    this.removeState = removeState;

    function exit(){

    }

    function enter(){

    }

    function addState(state){
        this.childState.push(state)
    }

    function removeState(state){
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