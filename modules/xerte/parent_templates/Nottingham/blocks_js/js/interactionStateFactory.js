import state from "./state";

class interactionStateFactory extends abstractStateFactory{
    constructor(type){
        super(type);
    }

    createState() {
        console.log('running from extended class. Text: '+this._type);
        var s = new state();
        s.addState()
    }
}

