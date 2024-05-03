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
    this.nrinteractions = null;
    this.weighting = 0.0;
    this.score = 0.0;
    this.correctOptions = [];
    this.correctAnswers = [];
    this.learnerAnswers = [];
    this.learnerOptions = [];
    this.duration = 0;
    this.start = new Date();
    this.end = this.start;


    function exit(){
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        this.duration += duration
        // if (duration > 100)
        // {
        //     ;
        //     this.count++;
        //     return true;
        // }
        // else
        // {
        //     return false;
        // }
    }

    function enter(){
        
        this.start = new Date();
    }
}
