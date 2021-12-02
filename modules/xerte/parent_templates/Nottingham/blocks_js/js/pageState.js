function pageState(id, page_nr, ia_type, ia_name){

    this.exit = exit;
    this.enter = enter;

    this.id = id;
    this.page_nr = page_nr;
    this.ia_type = ia_type;
    this.ia_name = ia_name;
    this.start = new Date();
    this.end = this.start;
    this.interactions = new Array();
    this.count = 0;
    this.duration = 0;
    this.nrinteractions = 0;
    this.weighting = 0.0;
    this.score = 0.0;
    this.correctOptions = [];
    this.correctAnswers = [];
    this.learnerAnswers = [];
    this.learnerOptions = [];


    function exit(){
        for(let i = 0; i < this.interactions.length; i++){
            if(this.interactions[i].duration > this.duration){
                this.duration = this.interactions[i].duration;
            }
        }
    }

    function enter(){

    }
}