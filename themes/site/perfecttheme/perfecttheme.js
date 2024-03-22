// use this file for any theme specific javascript/jQuery
// e.g. if your css needs the interface to include extra tags then you can add them to your project from javascript in this file

//CHANGES THE SIZE OF THE FULL SCREEN IMAGE WHEN A USER SROLLS UP OR DOWN

//find current viewport height and set jumbotron to that size (to make sure splash image always fills entire screen)
var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
$(".jumbotron").css("height", h);

//if window is resized, adjust the jumbotron height
$(document).ready(function () {
    debugger;
	if ($(data).find('learningObject').attr('header') != undefined && $(data).find('learningObject').attr('header') != "")
	{
        
		$("head").append("<style>.jumbotron { background-image: url('" + $(data).find('learningObject').attr('header') + "') ; } </style>");
	}
    // else
    // {
    //     $("head").append("<style>.jumbotron { background-image: url('themes/site/flexmbomechatronics/images/banner_rocmn.jpg') ; } </style>");

    // }
 
    $("<div id='BackgroundFooterIMG'></div>").appendTo(".footer");
    $(".footer .container").insertAfter("#BackgroundFooterIMG");
    $("#BackgroundFooterIMG").css('position', 'absolute');
 
    setTimeout(function () {
    var widthfooter = $(".footer").outerWidth();
    var heightfooter = $(".footer").outerHeight();
    var backgroundImgWidht = widthfooter/100*30;
    var backgroundImgHeight = heightfooter/100*80;

    $("#BackgroundFooterIMG").css('width', backgroundImgWidht);
    $("#BackgroundFooterIMG").css('height', backgroundImgHeight);

    var BackgroundFooterIMGWidth =  $("#BackgroundFooterIMG").outerWidth();
    
    

    $(".footer p").css('left', BackgroundFooterIMGWidth);
    

   }, 300);
 
});


    

    $(window).resize(function () {
        // var viewHeight = $(this).height();
        // $(".jumbotron").height(viewHeight);

        $(".jumbotron").css({
            "height":"350px"
        })
        var viewHeight = $(this).height();
        $(".scale").height(viewHeight);

 
    if ($(data).find('learningObject').attr('navbarPos') == "below"){
        $(".navbar").css({
            "position":"static"
        })
        $(".jumbotron").css({
            "margin-top":"0"
        })
    };

   
    setTimeout(function () {
        var widthfooter = $(".footer").outerWidth();
        var heightfooter = $(".footer").outerHeight();
        var backgroundImgWidht = widthfooter/100*30;
        var backgroundImgHeight = heightfooter/100*80;
    
        $("#BackgroundFooterIMG").css('width', backgroundImgWidht);
        $("#BackgroundFooterIMG").css('height', backgroundImgHeight);
    
        var BackgroundFooterIMGWidth =  $("#BackgroundFooterIMG").outerWidth();
        
        
    
        $(".footer p").css('left', BackgroundFooterIMGWidth);
        
    
       }, 300);

    
    }).resize();


        






// $(window).scroll(function () {
//     if ($(document).scrollTop() > 20) {
//         $(".jumbotron").addClass("shrink");
//         $(".titles").addClass("shrinkMenu");
//         $("#clickableWrapper").remove();
//     }
//     else {
//         $(".jumbotron").removeClass("shrink");
//         $(".jumbotron").css("height", Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
//         $(".titles").removeClass("shrinkMenu");
//     }
// });

$(window).scroll(function () {
    if($(".x_scale").length == 1)
    {
        if ($(document).scrollTop() < 20) {
            $("#clickableWrapper").css('display', 'block');
         }
         else
         {
            $("#clickableWrapper").css('display', 'none');
         }
           


        
       
    }
    var headerheight =   $(".jumbotron").height() + 100;
    if ($(document).scrollTop() > headerheight) {

        $("ul#toc").addClass('affix');
        $("ul#toc").removeClass('affix-top');
    }
    else
    {
        $("ul#toc").removeClass('affix');
        $("ul#toc").addClass('affix-top');
    }
   

    
    // var jumbotronheigt = $('.jumbotron').height();
    // console.log(jumbotronheigt)
 
    // $(".bs-docs-sidenav").css('bottom', jumbotronheigt)
    $('iframe').on("load", function() {
        if($('.piframe').length == 0)
        {
          $("<p class='piframe'>&nbsp;&nbsp;&nbsp;</p>").insertAfter("iframe");
        }
              
      
   
       
          
             
          
      });

    
         
    
        
    


})


setTimeout(function () {
    if ($(".arrow").length) {
        return false;
    }
    if($(".x_scale").length == 1)
    {
        $("<div id='clickableWrapper'><div class='arrow bounce'><i class='fa fa-chevron-down fa-2x' aria-hidden='true'></i></div><div class='promptText'>Scroll naar beneden voor meer informatie...</div></div>").appendTo(".jumbotron .container").hide().fadeIn(1000);
    }
    else
    {
        $("#clickableWrapper").css('display', 'none');
    }

    
  

}, 800);
$("#nav").click(function () {

    setTimeout(function () {
 
        // if ($(data).find('learningObject').attr('header') != undefined && $(data).find('learningObject').attr('header') != "")
        // {
            
        //     $("head").append("<style>.jumbotron::before { background-image: url('" + $(data).find('learningObject').attr('header') + "') ; } </style>");
        // }
        // else
        // {
           
        //     $("head").append("<style>.jumbotron { background-image: url('themes/site/flexmbomechatronics/images/banner_rocmn.jpg') ;} </style>");
    
        // }
        
        if($(".x_scale").length == 1)
        {
            if($("#clickableWrapper").length == 0)
            {
                $("<div id='clickableWrapper'><div class='arrow bounce'><i class='fa fa-chevron-down fa-2x' aria-hidden='true'></i></div><div class='promptText'>Scroll naar beneden voor meer informatie...</div></div>").appendTo(".jumbotron .container").hide().fadeIn(1000);
            }
            if($("#clickableWrapper").length == 1)
            {
                $("#clickableWrapper").css('display', 'block');
            }
        }
        else
        {
            $("#clickableWrapper").css('display', 'none');
        }

        $('iframe').on("load", function() {
          if($('.piframe').length == 0)
          {
            $("<p class='piframe'>&nbsp;&nbsp;&nbsp;</p>").insertAfter("iframe");
          }
                
        
           
        });
        

    
      
         

        
     
    }, 100);
})



//scroll down 125px when scroll prompt is clicked
setTimeout(function () {
    $("#clickableWrapper").click(function () {
        $("html, body").animate({
            scrollTop: "+=125px"
        }, 800);
    });
    
    // $('iframe').on("load", function() {
    //     if($('.piframe').length == 0)
    //     {
    //       $("<p class='piframe'>&nbsp;&nbsp;&nbsp;</p>").insertAfter("iframe");
    //     }
              
      
         
    //   });
}, 800);

//Changes the text of the "Top" button and replaces with an icon
setTimeout(function(){
$( ".btn-mini" ).each(function(index) {
    $( this ).html( '<i class="fa fa-angle-up fa-2x" aria-hidden="true"></i>' );
});
}, 500);

//smooth scroll
setTimeout(function () {
    $("#contentTable  a[href^='#'], a.btn.btn-mini.pull-right").click(function () {
      var target = $(this.hash);
        if (target.length === 0) {
           target = $("a[name='" + this.hash.substr(1) + "']");
        }
       if (target.length === 0) {
            target = $("html");
        }
        $("html, body").animate({
            scrollTop: target.offset().top - 60
        }, 1000);
        return false;
    });
}, 500);

//Adjust when sidebar becomes affixed to the top of the page
function initSidebar(){
	var $window = $(window)
	$(".bs-docs-sidenav").affix({
		offset: {
			top: function () { return $window.width() <= 980 ? 300 : 300 },
			bottom: 270
          
		}
      
	})
};

