class pageStateFactory extends abstractStateFactory{
    constructor(type){
        super(type);
    }

    createState() {
        console.log('running from extended class. Text: '+this._type);
    }
}

