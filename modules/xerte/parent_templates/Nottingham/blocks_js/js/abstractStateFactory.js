class abstractStateFactory {

    constructor(type){
        this._type = type;
    }

    /**
     * Implementation optional
     */
    createState() {
        console.log('running from super class. Text: '+this._type);
    }

}