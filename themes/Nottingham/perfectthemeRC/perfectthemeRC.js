

$( document ).ready(function() {
    setInterval(
        function() 
        {
            // var header = document.getElementById("x_headerBlock");
            // if($("#x_headerBlock").hasClass("hideTitleTxt") && $("#x_headerBlock").hasClass("hideTitleIcon")){
            //     $("#x_background").css("margin-top","0px");
                
            // }

            if( $("#x_headerBlock").css('display') == 'none') {
                $("#x_background").css("margin-top","0px");
             }
}, 50);
});


setInterval(
    function() 
    {
        if ($(".x_crossword_page")[0]) {
            $("#x_pageDiv").css('padding-top', '0px');
            $("#x_pageDiv table td, #x_pageDiv table th ").css('padding', '0px');
            $("div#tableName p ").css('margin-bottom', '0px');
           
            $("#x_pageDiv table td").css('min-width', '0px');
            
            var inputWidth =  $("#pageContents input").width();
            $("#crossword-table .no-border").css('width', inputWidth);
            $("div#showButton").css('position', 'absolute');
            $("div#showButton").css('bottom', '5%');
            $("div#showButton").css('left', '50%');         
        }
}, 100);





