export default class trackingManager {
    constructor() {

    }

    pageStates = [];


    makeId(page_nr, ia_nr, ia_type, ia_name){

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

    findCreatePageState (page_nr, ia_type, ia_name){
        var tmpid = makeId(page_nr,-1, ia_type, ia_name);

        for (var i=0; i<this.pageStates.length; i++)
        {
            if (this.pageStates[i].id === tmpid)
                return this.pageStates[i];
        }
        // Not found
        var sit =  new pageState(page_nr, ia_type, ia_name);
        if (ia_type != "page" && ia_type != "result")
        {
            this.lo_type = "interactive";
            if (this.lo_passed == -1)
            {
                this.lo_passed = 55;
            }
        }

        this.pageStates.push(sit);
        return sit;
    }

    enterPage(page_nr, ia_type, ia_name){
        this.findCreatePageState(page_nr, ia_type, ia_name)
    }
}