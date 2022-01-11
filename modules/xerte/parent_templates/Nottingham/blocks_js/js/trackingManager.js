// noinspection JSPotentiallyInvalidUsageOfThis,SpellCheckingInspection

function TrackingManager(){

    this.pageStates = new Array();
    this.initialised = false;
    this.trackingmode = "full";
    this.mode = "normal";
    this.scoremode = 'first';
    this.nrpages = 0;
    this.toCompletePages = new Array();
    this.completedPages = new Array();
    this.start = new Date();
    this.lo_completed = 0;
    this.lo_passed = -1;
    this.page_timeout = 0;
    this.forcetrackingmode = false;
    this.debug = false;

    this.makeId = makeId;
    this.findCreatePageState = findCreatePageState;
    this.enterPage = enterPage;
    this.initialise = initialise;
    this.pageCompleted = pageCompleted;
    this.getCompletionStatus = getCompletionStatus;
    this.getSuccessStatus = getSuccessStatus;
    this.getdScaledScore = getdScaledScore;
    this.getdRawScore = getdRawScore;
    this.getdMinScore = getdMinScore;
    this.getdMaxScore = getdMaxScore;
    this.getScaledScore = getScaledScore;
    this.getRawScore = getRawScore;
    this.getMinScore = getMinScore;
    this.getMaxScore = getMaxScore;
    this.setPageType = setPageType;
    this.setInteractionType = setInteractionType;
    this.setPageScore = setPageScore;
    this.setInteractionPageXML = setInteractionPageXML;
    this.getInteractionPageXML = getInteractionPageXML;
    this.enterInteraction = enterInteraction;
    this.exitInteraction = exitInteraction;
    this.exitPage = exitPage;
    this.findPage = findPage;
    this.findInteraction = findInteraction;
    this.findAllInteractions = findAllInteractions;
    this.verifyResult = verifyResult;
    this.verifyEnterInteractionParameters = verifyEnterInteractionParameters;
    this.verifyExitInteractionParameters = verifyExitInteractionParameters;
    this.setLeavePage = setLeavePage;
    this.setInteractionModelState = setInteractionModelState;
    this.getInteractionModelState = getInteractionModelState;

    function makeId(page_nr, ia_nr, ia_type, ia_name){

        var tmpid = 'urn:x-xerte:p-' + (page_nr + 1);
        if (ia_nr >= 0)
        {
            tmpid += ':' + (ia_nr + 1);
            if (ia_type.length > 0)
            {
                tmpid += '-' + ia_type;
            }
        }

        if (ia_name)
        {
            // ia_nam can be HTML, just extract text from it
            var div = $("<div>").html(ia_name);
            var strippedName = div.text();
            tmpid += ':' + encodeURIComponent(strippedName.replace(/[^a-zA-Z0-9_ ]/g, "").replace(/ /g, "_"));
            // Truncate to max 255 chars, this should be 4000
            tmpid = tmpid.substr(0,255);
        }
        return tmpid;
    }

    function findCreatePageState (page_nr, ia_type, ia_name){
        var tmpid = makeId(page_nr,-1, ia_type, ia_name);

        for (var i=0; i<this.pageStates.length; i++)
        {
            if (this.pageStates[i].id === tmpid)
                return this.pageStates[i];
        }
        // Not found
        var sit =  new pageState(tmpid,page_nr, ia_type, ia_name);
        if (ia_type !== "page" && ia_type !== "result")
        {
            this.lo_type = "interactive";
            if (this.lo_passed === -1)
            {
                this.lo_passed = 55;
            }
        }
          
        this.pageStates.push(sit);
        return sit;
    }

    function enterPage(page_nr, ia_type, ia_name){
        this.findCreatePageState(page_nr, ia_type, ia_name)
    }

    function initialise()
    {

    }

    function getCompletionStatus()
    {
        var completed = true;
        for(var i = 0; i<this.completedPages.length; i++)
        {
            if(this.completedPages[i] === false)
            {
                completed = false;
                break;
            }
            //if( i == this.completedPages.length-1 && this.completedPages[i] == true)
            //{
            //completed = true;
            //
        }

        if (completed)
        {
            return "completed";

        }
        else if(!completed)
        {
            return 'incomplete';
        }
        else
        {
            return "unknown"
        }
    }

    function getSuccessStatus()
    {
        if (this.lo_type !== "pages only")
        {
            if (this.getScaledScore() > (this.lo_passed / 100))
            {
                return "passed";
            }
            else
            {
                return "failed";
            }
        }
        else
        {
            if (getCompletionStatus() === 'completed')
            {
                return "passed";
            }
            else
            {
                return "unknown";
            }
        }
    }

    function getdScaledScore()
    {
        return this.getdRawScore() / (this.getdMaxScore() - this.getdMinScore());
    }

    function getScaledScore()
    {
        return Math.round(this.getdScaledScore()*100)/100 + "";
    }

    function getdRawScore()
    {
        if (this.lo_type === "pages only")
        {
            if (getCompletionStatus() === 'completed')
                return 100;
            else
                return 0;
        }
        else
        {
            var score = [];
            var weight = [];
            var totalweight = 0.0;
            // Walk passed the pages
            var i=0;
            for (i=0; i<this.nrpages; i++)
            {
                var sit = this.findPage(i);
                if (sit != null && sit.weighting > 0)
                {
                    totalweight += sit.weighting;
                    score.push(sit.score);
                    weight.push(sit.weighting);
                }
            }
            var totalscore = 0.0;
            if (totalweight > 0.0)
            {
                for (i=0; i<score.length; i++)
                {
                    totalscore += (score[i] * weight[i]);
                }
                totalscore = totalscore / totalweight;
            }
            else
            {
                // If the weight is 0.0, set the score to 100
                totalscore = 100.0;
            }
            return totalscore;
        }
    }

    function getRawScore()
    {
        return Math.round(this.getdRawScore()*100)/100 + "";
    }

    function getdMinScore()
    {
        if (this.lo_type === "pages only")
        {
            return 0.0;
        }
        else
        {
            return 0.0;
        }
    }

    function getMinScore()
    {
        return this.getdMinScore() + "";
    }

    function getdMaxScore()
    {
        if (this.lo_type === "pages only")
        {
            return 100.0;
        }
        else
        {
            return 100.0;
        }
    }

    function getMaxScore()
    {
        return this.getdMaxScore() + "";
    }


    function pageCompleted(sit)
    {

        var sits = this.findAllInteractions(sit.page_nr);
        if (sits.length !== sit.nrinteractions)
        {
            return false;
        }
        var done = true;
        for(var i = 0; i < sits.length; i++){
            var s = sits[i].result.success;
            if(!s){
                done = false;
            }
        }
        if (sit.ia_type==="page" && sit.duration < this.page_timeout)
        {
            return false;
        }
        return done;
    }

    function enterInteraction(page_nr, ia_nr, ia_type, ia_name, correctoptions, correctanswer, feedback, ia_sub_nr = 0)
    {

        var tempid = makeId(page_nr, ia_nr, ia_type, ia_name)

        interaction = new InteractionState(tempid, page_nr, ia_nr, ia_type, ia_name, ia_sub_nr);
        this.verifyEnterInteractionParameters(ia_type, ia_name, correctoptions, correctanswer, feedback);
        interaction.enterInteraction(correctanswer, correctoptions);
        var page = this.findPage(page_nr)
        page.interactions.push(interaction)
    }

    function exitInteraction(page_nr, ia_nr, result, learneroptions, learneranswer, feedback, ia_sub_nr = 0)
    {

        var sit = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
        if (sit != null) {
            if (ia_nr !== -1) {
                this.verifyExitInteractionParameters(sit, result, learneroptions, learneranswer, feedback);
                sit.exitInteraction(result, learneranswer, learneroptions, feedback);
            }
            sit.exit();
        }
    }

    function exitPage(page_nr, ia_sub_nr = 0){
        let temp = false;
        let i = 0;


        var page = this.findPage(page_nr);
        var tempscore = 0;
        for(i=0;i<page.interactions.length;i++){
            if(page.interactions[i].result === undefined){
                var result = {
                    success: false,
                    score: 0.0
                };
                page.interactions[i].result = result;
            }
            tempscore+= page.interactions[i].result.score;
        }

        tempscore/=page.interactions.length;

        page.score = tempscore;

        for (i = 0; i < this.toCompletePages.length; i++) {
            var currentPageNr = this.toCompletePages[i];
            if (currentPageNr === page_nr) {
                temp = true;
                break;
            }
        }
        if (temp) {
            if (!this.completedPages[i]) {
                var sit = this.findPage(page_nr);
                if (sit != null) {
                    // Skip results page completely
                    if (sit.ia_type !== "result") {
                        this.completedPages[i] = this.pageCompleted(sit);
                        sit.exit();
                    }
                }
            }
        }

        for(i=0;i<page.interactions.length;i++){
            var interaction = page.interactions[i];
            if(interaction.leavePage != null){
                var blockid = "block" + (interaction.ia_nr + 1);
                interaction.leavePage(blockid);
            }
        }
    }

    function setPageType(page_nr, page_type, nrinteractions, weighting)
    {
          
        var sit = this.findPage(page_nr);
        if (sit != null)
        {
            sit.ia_type = page_type;

            sit.nrinteractions = nrinteractions;
            sit.weighting = parseFloat(weighting);
        }
    }

    function setInteractionType(page_nr, ia_nr, page_type, weighting, sub_ia_nr)
    {

        var sit = this.findPage(page_nr);
        if (sit != null)
        {
            sit.ia_type = page_type;

            sit.nrinteractions = sit.nrinteractions + 1;
        }

        var int = this.findInteraction(page_nr, ia_nr, sub_ia_nr);
        if(int != null){
            int.weighting = weighting;
        }
    }

    function setPageScore(page_nr, score)
    {

        var page = this.findPage(page_nr);
        var tempscore = 0;
        for(i=0;i<page.interactions.length;i++){
            if(page.interactions[i].result != null || page.interactions[i].result != undefined){
                tempscore+= page.interactions[i].result.score;
            }
        }

        tempscore/=page.interactions.length;

        if (page != null && (this.scoremode !== 'first' || page.count < 1))
        {
            page.score = tempscore;
            page.count++;
        }
    }

    function setInteractionPageXML(page_nr, ia_nr, x_currentPage, ia_sub_nr = 0){
        var interactionState = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
        if(interactionState == null){
            return;
        }
        interactionState.setPageXML(x_currentPage);
    }

    function getInteractionPageXML(page_nr, ia_nr, ia_sub_nr = 0){
        var interactionState = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
        if(interactionState == null){
            return;
        }
        return interactionState.pageXML;
    }

    function findPage(page_nr)
    {
        for (let i=0; i<this.pageStates.length; i++)
        {
            if (this.pageStates[i].page_nr === page_nr)
                return this.pageStates[i];
        }
        return null;
    }

    function findInteraction(page_nr, ia_nr, ia_sub_nr = 0)
    {
        var page = this.findPage(page_nr)
        if (page == null){
            return null;
        }
        var i=0;
        for (i=0; i<page.interactions.length; i++)
        {
            if (page.interactions[i].page_nr === page_nr && page.interactions[i].ia_nr === ia_nr && page.interactions[i].ia_sub_nr === ia_sub_nr)
                return page.interactions[i];
        }
        return null;
    }

    function findAllInteractions(page_nr)
    {
        return this.pageStates[page_nr].interactions;
    }

    /**
     * Check whether result has the valid structure and contents
     * @param result
     *
     * result should be an object with a boolean field success and a float field score
     */
    function verifyResult(result)
    {
        if (this.debug)
        {
            if (typeof result != 'object' || typeof result['success'] != 'boolean' || typeof result['score'] != 'number' || result['score'] < 0.0 || result['score'] > 100.0)
            {
                console.log("Invalid result structure: " + result);
            }
        }
    }

    /**
     *
     * @param ia_type
     * @param ia_name
     * @param correctoptions
     * @param correctanswer
     * @param feedback
     *
     *  correctoptions and correctanswer depends on the sit_iatype
     *
     *  1. matching
     *      correctoptions: array of objects with source and target strings
     *              [
     *              {
     *                  source: 'lettuce',
     *                  target: 'vegetable'
     *              },
     *              {
     *                  source: 'apple',
     *                  target: 'fruit'
     *              },
     *              {
     *                  source: 'pear',
     *                  target: 'vegetable'
     *              }
     *              ]
     *      correctanswer: array of matching representation
     *              [
     *              'lettuce --> vegetable',
     *              'apple --> fruit',
     *              'pear --> fruit'
     *              ]
     *
     *   2. multiplechoice
     *       correctoptions: array of objects containg all possible options numbered "1" to max nr of options.
     *              [
     *              {
     *                  id: '1',
     *                  answer: 'London',
     *                  result: true
     *              },
     *              {
     *                  id: '2',
     *                  answer: 'Paris',
     *                  result: false
     *              },
     *              {
     *                  id: '3',
     *                  answer: 'Amsterdam',
     *                  result: false
     *              }
     *              ]
     *       correctanswers contains an array with the answer string of the above structure
     *              [
     *                  'London',
     *                  'Paris',
     *                  'Amsterdam'
     *              ]
     *
     *    3. numeric
     *        correctoptions is ignored
     *        correctanswers is ignored
     *
     *    4. text, fill-in
     *        correctoptions contains an array of strings that are correct. With type text, array is assumed to be empty
     *        correctanswers is ignored
     *
     *    5. page
     *         correctoptions is ignored
     *         correctanswers is ignored
     *
     *    6. default
     *          flag warning
     *
     */
    function verifyEnterInteractionParameters(ia_type, ia_name, correctoptions, correctanswer, feedback)
    {
        if (this.debug) {
            switch(ia_type)
            {
                case 'match':
                    /*
                    *  1. matching
                    *      correctoptions: array of objects with source and target strings
                    *              [
                    *              {
                    *                  source: 'lettuce',
                    *                  target: 'vegetable'
                    *              },
                    *              {
                    *                  source: 'apple',
                    *                  target: 'fruit'
                    *              },
                    *              {
                    *                  source: 'pear',
                    *                  target: 'fruit'
                    *              }
                    *              ]
                    *      learneranswer: array of matching representation
                    *              [
                    *              'lettuce --> vegetable',
                    *              'apple --> fruit',
                    *              'pear --> fruit'
                    *              ]
                    */
                    if (typeof correctoptions == 'object')
                    {
                        for (var i=0; i<correctoptions.length; i++)
                        {
                            var item = correctoptions[i];
                            if (typeof item != 'object' || typeof item['source'] != 'string' || typeof item['target'] != 'string')
                            {
                                console.log("Invalid structure for correctoptions for type match: " + correctoptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctoptions for type match: " + correctoptions);
                    }
                    if (typeof correctanswer == 'object')
                    {
                        for (var i=0; i<correctanswer.length; i++)
                        {
                            var item = correctanswer[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for correctanswer for type match: " + correctanswer);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctanswer for type match: " + correctanswer);
                    }
                    break;
                case 'multiplechoice':
                    /*
                     * 2. multiplechoice
                     *       correctoptions: array of objects containg all possible options numbered "1" to max nr of options.
                     *              [
                     *              {
                     *                  id: '1',
                     *                  answer: 'London',
                     *                  result: true
                     *              },
                     *              {
                     *                  id: '2',
                     *                  answer: 'Paris',
                     *                  result: false
                     *              },
                     *              {
                     *                  id: '3',
                     *                  answer: 'Amsterdam',
                     *                  result: false
                     *              }
                     *              ]
                     *       correctanswers contains an array with the answer string of the above structure
                     *              [
                     *                  'London',
                     *                  'Paris',
                     *                  'Amsterdam'
                     *              ]
                     */
                    if (typeof correctoptions == 'object')
                    {
                        for (var i=0; i<correctoptions.length; i++)
                        {
                            var item = correctoptions[i];
                            if (typeof item != 'object' || typeof item['id'] != 'string' || typeof item['answer'] != 'string' || typeof item['result'] != 'boolean')
                            {
                                console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
                    }
                    if (typeof correctanswer == 'object')
                    {
                        for (var i=0; i<correctanswer.length; i++)
                        {
                            var item = correctanswer[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for correctanswer for type multiplechoice: " + correctanswer);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctanswer for type multiplechoice: " + correctanswer);
                    }
                    break;
                case 'numeric':
                    /**
                     * 3. numeric
                     *        correctoptions is ignored
                     *        correctanswers is ignored
                     */
                    // Nothing to check
                    break;
                case 'text':
                case 'fill-in':
                    /**
                     * 4. text, fill-in
                     *        correctoptions contains an array of strings that are correct. With type text, array is assumed to be empty
                     *        correctanswers is ignored
                     *
                     */
                    if (typeof correctoptions == 'object')
                    {
                        for (var i=0; i<correctoptions.length; i++)
                        {
                            var item = correctoptions[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for correctoptions for type multiplechoice: " + correctoptions);
                    }
                    break;
                case 'page':
                case 'result':
                    /**
                     * 5. page
                     *         correctoptions is ignored
                     *         correctanswers is ignored
                     */
                    // Nothing to check
                    break;

                default:
                    console.log("Invalid ia_type " + ia_type + " entering interaction.");
                    break;
            }
        }
    }


    /**
     * Routine to verify the structures of result, learneroptions and learneranswer given sit.ia_type
     * @param sit
     * @param result
     * @param learneroptions
     * @param learneranswer
     * @param feedback
     *
     *  result should be an object
     *          {
     *              success: true,
     *              score: 100.0
     *          }
     *
     *  learneroptions and learneranswer depends on the sit_iatype
     *
     *  1. matching
     *      learneroptions: array of objects with source and target strings
     *              [
     *              {
     *                  source: 'lettuce',
     *                  target: 'vegetable'
     *              },
     *              {
     *                  source: 'apple',
     *                  target: 'fruit'
     *              },
     *              {
     *                  source: 'pear',
     *                  target: 'vegetable'
     *              }
     *              ]
     *      learneranswer: array of matching representation
     *              [
     *              'lettuce --> vegetable',
     *              'apple --> fruit',
     *              'pear --> vegetable'
     *              ]
     *
     *   2. multiplechoice
     *       learneroptions: array of objects indicating selected options numbered "1" to max nr of options. Therer are only more than one entries, if there are multiple answers allowed
     *              [
     *              {
     *                  id: '2',
     *                  answer: 'Paris'
     *                  result: false
     *              }
     *              ]
     *       learneranswers contains an array with the answer string of the above structure
     *              [
     *                  'Paris'
     *              ]
     *
     *    3. numeric
     *        learneroptions: ignored
     *        learneranswer contains a number between 0 and 100
     *
     *    4. text, fill-in
     *        learneroptions is ignored
     *        learneranswers contains the selected/entered text
     *
     *    5. page
     *         learneroptions is ignored
     *         learneranswers is ignored
     *
     *    6. default
     *          flag warning
     *
     */
    function verifyExitInteractionParameters(sit, result, learneroptions, learneranswer, feedback)
    {
        if (this.debug) {
            verifyResult(result);
            switch(sit.ia_type)
            {
                case 'match':
                    /*
                    *  1. matching
                    *      learneroptions: array of objects with source and target strings
                    *              [
                    *              {
                    *                  source: 'lettuce',
                    *                  target: 'vegetable'
                    *              },
                    *              {
                    *                  source: 'apple',
                    *                  target: 'fruit'
                    *              },
                    *              {
                    *                  source: 'pear',
                    *                  target: 'vegetable'
                    *              }
                    *              ]
                    *      learneranswer: array of matching representation
                    *              [
                    *              'lettuce --> vegetable',
                    *              'apple --> fruit',
                    *              'pear --> vegetable'
                    *              ]
                    */
                    if (typeof learneroptions == 'object')
                    {
                        for (var i=0; i<learneroptions.length; i++)
                        {
                            var item = learneroptions[i];
                            if (typeof item != 'object' || typeof item['source'] != 'string' || typeof item['target'] != 'string')
                            {
                                console.log("Invalid structure for learneroptions for type match: " + learneroptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for learneroptions for type match: " + learneroptions);
                    }
                    if (typeof learneranswer == 'object')
                    {
                        for (var i=0; i<learneranswer.length; i++)
                        {
                            var item = learneranswer[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for learneranswer for type match: " + learneranswer);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for learneranswers for type match: " + learneranswer);
                    }
                    break;
                case 'multiplechoice':
                    /*
                     * 2. multiplechoice
                     *       learneroptions: array of objects indicating selected options numbered "1" to max nr of options. Therer are only more than one entries, if there are multiple answers allowed
                     *              [
                     *              {
                     *                  id: '2',
                     *                  answer: 'Paris'
                     *                  result: false
                     *              }
                     *              ]
                     *       learneranswers contains an array with the answer string of the above structure
                     *              [
                     *                  'Paris'
                     *              ]
                     */
                    if (typeof learneroptions == 'object')
                    {
                        for (var i=0; i<learneroptions.length; i++)
                        {
                            var item = learneroptions[i];
                            if (typeof item != 'object' || typeof item['id'] != 'string' || typeof item['answer'] != 'string' || typeof item['result'] != 'boolean')
                            {
                                console.log("Invalid structure for learneroptions for type multiplechoice: " + learneroptions);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for learneroptions for type multiplechoice: " + learneroptions);
                    }
                    if (typeof learneranswer == 'object')
                    {
                        for (var i=0; i<learneranswer.length; i++)
                        {
                            var item = learneranswer[i];
                            if (typeof item != 'string')
                            {
                                console.log("Invalid structure for learneranswer for type multiplechoice: " + learneranswer);
                            }
                        }
                    }
                    else
                    {
                        console.log("Invalid structure for learneranswers for type multiplechoice: " + learneranswer);
                    }
                    break;
                case 'numeric':
                    /**
                     * 3. numeric
                     *        learneroptions: ignored
                     *        learneranswer contains a number between 0 and 100
                     */
                    if (typeof learneranswer != 'number')
                    {
                        console.log("Invalid structure for learneranswers for type numeric: " + learneranswer);
                    }
                    break;
                case 'text':
                case 'fill-in':
                    /**
                     * 4. text, fill-in
                     *        learneroptions is ignored
                     *        learneranswers contains the selected/entered text
                     *
                     */
                    if (typeof learneranswer != 'string')
                    {
                        console.log("Invalid structure for learneranswers for type fill-in: " + learneranswer);
                    }
                case 'page':
                case 'result':
                    /**
                     * 5. page
                     *         learneroptions is ignored
                     *         learneranswers is ignored
                     */
                    // Nothing to check
                    break;
                default:
                    console.log("Invalid ia_type " + sit.ia_type + " exiting interaction.");
                    break;
            }
        }
    }

    function setInteractionModelState(page_nr, ia_nr, modelState, ia_sub_nr) {
        var interaction = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
        if(interaction != null){
            interaction.modelState = JSON. parse(JSON. stringify(modelState));
        }
    }


    function getInteractionModelState(page_nr, ia_nr, ia_sub_nr) {
        var interaction = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
        if(interaction != null){
            return interaction.modelState;
        } else {
            return null;
        }
    }

    function setLeavePage(page_nr, ia_nr, ia_sub_nr, leavepage) {
        var interaction = this.findInteraction(page_nr, ia_nr, ia_sub_nr);
        if(interaction != null){
            interaction.leavePage = leavepage;
        }
    }
}