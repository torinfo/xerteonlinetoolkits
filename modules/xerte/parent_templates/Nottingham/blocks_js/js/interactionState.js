function InteractionState(id, page_nr, ia_nr, ia_type, ia_name){

    this.id = id;
    this.page_nr = page_nr;
    this.ia_type = ia_type;
    this.ia_name = ia_name;
    this.start = new Date();
    this.end = this.start;
    this.count = 0;
    this.duration = 0;
    this.nrinteractions = 0;
    this.weighting = 0.0;
    this.score = 0.0;
    this.correctOptions = [];
    this.correctAnswers = [];
    this.learnerAnswers = [];
    this.learnerOptions = [];

    this.exit = exit;
    this.enterInteraction = enterInteraction;
    this.exitInteraction = exitInteraction;

    function exit()
    {
        debugger
        this.end = new Date();
        var duration = this.end.getTime() - this.start.getTime();
        if (duration > 100)
        {
            this.duration += duration;
            this.count++;
            return true;
        }
        else
        {
            return false;
        }

    }

    function enterInteraction(correctAnswers, correctOptions)
    {
        debugger
        this.correctAnswers = correctAnswers;
        this.correctOptions = correctOptions;
    }

    function exitInteraction(result, learnerAnswers, learnerOptions, feedback)
    {
        debugger
        this.learnerAnswers = learnerAnswers;
        this.learnerOptions = learnerOptions;
        this.result = result;
        this.feedback = feedback;
    }
}