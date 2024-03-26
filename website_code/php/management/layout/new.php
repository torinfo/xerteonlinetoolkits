<?php
_load_language_file("/website_code/php/management/site.inc");
_load_language_file("/management.inc");
_load_language_file("/website_code/php/management/management_library.inc");
?>
<div id="managementContainer">
    <iframe id="upload_iframe" name="upload_iframe" src="" style="width:0px;height:0px; display:none;"></iframe>

    <div class="white_topbar">
        <div class="topbar-section">

			<div class="layout-dropdown">
				<form action="#">
					<select name="layouts" id="layout">
						<option class="drop" value="new" selected>New</option>
						<option class="drop" value="old" >Old</option>
					</select>
				</form>
			</div>
			
			<div class="Profile">
				<img src="media/download.jpg">
			</div>

			<?php display_language_selectionform_extra("dropdown", false) ?>

			<script>
			 $(document).ready(function() {
				 $('#layout').change(function() {
					 let theme = $(this).val(); 
					 $.ajax({
						 url: "./website_code/php/management/changeTheme.php",
						 method: "GET",
						 data: {
							 theme: theme,
							 change: true
						 },
					 }).done(function(result) {
						 if(result === "false") return;
						 $("body").html(result);
						 $("#layout_css").attr("href", "website_code/styles/management_"+theme+".css")
						 $("body").trigger("load");
					 }).fail(function(jqXHR, textStatus, error){
						 alert("something went wrong");
						 console.log("something went wrong");
					 });
				 });
			 });

			</script>

            <div id="toggle-switch">
                <label class="switch">
                    <input id="themeSwitch" type="checkbox">
                    <span class="slider round"></span>
                </label>

            </div>

            <script>
             const toggleSwitch = document.getElementById('themeSwitch');

             function switchTheme(e) {
                 if (e.target.checked) {
                     document.documentElement.setAttribute('data-theme', 'dark');
                     localStorage.setItem('theme', 'dark');
                 } else {
                     document.documentElement.setAttribute('data-theme', 'light');
                     localStorage.setItem('theme', 'light');
                 }
             }

             toggleSwitch.addEventListener('change', switchTheme, false);


			 if(localStorage.getItem('theme') == 'dark'){
				 document.documentElement.setAttribute('data-theme', 'dark');
				 toggleSwitch.checked = true;
			 }else{
                 document.documentElement.setAttribute('data-theme', 'light');
			 }
            </script>


        </div>
    </div>

    <div class="block">
        <div class="block-header">


        </div>
        <div id="admin_area">
        </div>

    </div>

    <div class="sidebar">
        <div class="background_logo" id="logoContainer">
            <img id="logo_top_left" src="media/xerte-logo.png" width="100px" height="50px">
        </div>
        <div class="xerte-buttons-container">
            <button type="button" id="button-site" class="xerte-button" onclick="javascript:site_list(); javascript:add_border('button-site');"><div class="icon-1"><i class="fa fa-sitemap"></i></div> <?PHP echo MANAGEMENT_MENUBAR_SITE; ?>	</button>
            <button type="button" id="button-template" class="xerte-button" onclick=" javascript:templates_list(); javascript:add_border('button-template');"><div class="icon-2"><i class="fa fa-file-code-o"></i></div><?PHP echo MANAGEMENT_MENUBAR_CENTRAL; ?>	</button>
            <button type="button" id="button-gebruikers" class="xerte-button" onclick="javascript:users_list(); javascript:add_border('button-gebruikers');"><div class="icon-3"><i class="fa fa-users-cog"></i></div> <?PHP echo MANAGEMENT_MENUBAR_USERS; ?>	</button>
            <button type="button" id="button-groepen" class="xerte-button" onclick="javascript:user_groups_list(); javascript:add_border('button-groepen'); "><div class="icon-4"><i class="fa fa-users"></i></div> <?PHP echo MANAGEMENT_MENUBAR_USER_GROUPS; ?>	</button>
            <button type="button" id="button-gebruikerslo" class="xerte-button" onclick="javascript:user_templates_list(); javascript:add_border('button-gebruikerslo');"><div class="icon-5"><i class="far fa-file-alt"></i></div> <?PHP echo MANAGEMENT_MENUBAR_TEMPLATES; ?>	</button>
            <button type="button" id="button-logs" class="xerte-button" onclick="javascript:errors_list(); javascript:add_border('button-logs');"><div class="icon-6"> <i class="fa fa-exclamation-triangle"></i></div> <?PHP echo MANAGEMENT_MENUBAR_LOGS; ?>	</button>
            <button type="button" id="button-toegang" class="xerte-button" onclick="javascript:play_security_list(); javascript:add_border('button-toegang');"><div class="icon-7"><i class="fa fa-key"></i></div> <?PHP echo MANAGEMENT_MENUBAR_PLAY; ?></button>
            <button type="button" id="button-categorie" class="xerte-button" onclick="javascript:categories_list(); javascript:add_border('button-categorie');"><div class="icon-8"><i class="fa fa-list-ul"></i></div> <?PHP echo MANAGEMENT_MENUBAR_CATEGORIES; ?>	</button>
            <button type="button" id="button-educations" class="xerte-button" onclick="javascript:educationlevel_list(); javascript:add_border('button-educations');"><div class="icon-9"><i class="fa fa-list-ul"></i></div> <?PHP echo MANAGEMENT_MENUBAR_EDUCATION; ?>	</button>
            <button type="button" id="button-groeperingen" class="xerte-button" onclick="javascript:grouping_list(); javascript:add_border('button-groeperingen');"><div class="icon-10"><i class="fa fa-list-ul"></i></div> <?PHP echo MANAGEMENT_MENUBAR_GROUPINGS; ?>	</button>
            <button type="button" id="button-cursussen" class="xerte-button" onclick="javascript:course_list(); javascript:add_border('button-cursussen');"><div class="icon-11"><i class="fa fa-list-ul"></i></div> <?PHP echo MANAGEMENT_MENUBAR_COURSES; ?>	</button>
            <button type="button" id="button-licentie" class="xerte-button" onclick="javascript:licenses_list(); javascript:add_border('button-licentie');"><div class="icon-12"><i class="fa fa-cc"></i></div> <?PHP echo MANAGEMENT_MENUBAR_LICENCES; ?>	 </button>
            <button type="button" id="button-feed"  class="xerte-button" onclick="javascript:feeds_list(); javascript:add_border('button-feed');"><div class="icon-13"><i class="fa fa-rss"></i></div> <?PHP echo MANAGEMENT_MENUBAR_FEEDS; ?></button>
        </div>



    </div>


    <script>


     document.addEventListener('click', function(event) {
         if(event.target.classList.contains('xerte-button')) {
             var id = event.target.id;
             var newContent;
             switch(id) {
                 case 'button-site':
                     newContent = "Site";
                     break

                 case 'button-template':
                     newContent = "Template";
                     break;

                 case 'button-gebruikers':
                     newContent = "Gebruikers";
                     break;

                 case 'button-groepen':
                     newContent = "Groepen";
                     break;

                 case 'button-gebruikerslo':
                     newContent = "Gebruikers LO";
                     break;

                 case 'button-logs':
                     newContent = "Logs";
                     break;

                 case 'button-toegang':
                     newContent = "Toegang";
                     break;

                 case 'button-categorie':
                     newContent = "Categorie";
                     break;

                 case 'button-educations':
                     newContent = "Educations";
                     break;

                 case 'button-groeperingen':
                     newContent = "Groepering";
                     break;

                 case 'button-cursussen':
                     newContent = "Cursussen";
                     break;

                 case 'button-licentie':
                     newContent = "Licentie";
                     break;

                 case 'button-feed':
                     newContent = "Feed";
                     break;
                     // Add cases for all other buttons
             }
             document.getElementById("content-header").innerHTML = newContent;
         }
     });


     // document.getElementById('button-site').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Site";
     // };
     //
     // document.getElementById('button-template').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Template";
     // };
     //
     // document.getElementById('button-gebruikers').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Gebruikers";
     // };
     //
     // document.getElementById('button-groepen').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Groepen";
     // };
     //
     // document.getElementById('button-gebruikerslo').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Gebruikers LO";
     // };
     //
     // document.getElementById('button-logs').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Logs";
     // };
     //
     // document.getElementById('button-toegang').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Toegang";
     // };
     //
     // document.getElementById('button-categorie').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Categorie";
     // };
     //
     // document.getElementById('button-educations').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Educations";
     // };
     //
     // document.getElementById('button-groeperingen').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Groeperingen";
     // };
     //
     //
     // document.getElementById('button-cursussen').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Cursussen";
     // };
     //
     //
     // document.getElementById('button-licentie').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Licentie";
     // };
     //
     //
     // document.getElementById('button-feed').onclick = function()
     // {
     //     document.getElementById("content-header").innerHTML = "Feed";
     // };




    </script>


    <div id="button-site-menu" class="menu">
        <div class="space-top">
            <a href="#" id="site-settings" onclick="javascript:site_display('siteSettings'); javascript:add_second_border('site-settings');" >Site settings (HTML/Images)</a>
            <a href="#" id="server-details" onclick="javascript:site_display('serverdetails'); javascript:add_second_border('server-details');"> Server Settings</a>
            <a href="#" id="rss-details" onclick="javascript:site_display('rssdetails'); javascript:add_second_border('rss-details');"> RSS settings</a>
            <a href="#" id="path-details" onclick="javascript:site_display('pathdetails'); javascript:add_second_border('path-details');">Path settings</a>
            <a href="#" id="sql-details" onclick="javascript:site_display('sqldetails'); javascript:add_second_border('sql-details');">SQL query settings</a>
            <a href="#" id="error-details" onclick="javascript:site_display('errordetails'); javascript:add_second_border('error-details');">Error handling settings</a>
            <a href="#" id="auth-details" onclick="javascript:site_display('authdetails'); javascript:add_second_border('auth-details');">Authentication settings</a>
            <a href="#" id="ldap-details" onclick="javascript:site_display('ldapdetails'); javascript:add_second_border('ldap-details');">LDAP settings </a>
            <a href="#" id="xerte-details" onclick="javascript:site_display('xertedetails'); javascript:add_second_border('xerte-details');">Xerte settings</a>
            <a href="#" id="email-details" onclick="javascript:site_display('emaildetails'); javascript:add_second_border('email-details');">Email</a>
            <a href="#" id="language-details" onclick="javascript:site_display('languagedetails'); javascript:add_second_border('language-details');">Language settings</a>
            <a href="#" id="xapi-details" onclick="javascript:site_display('xapidetails'); javascript:add_second_border('xapi-details');">xAPI settings</a>
            <a href="#" id="socialicon-details" onclick="javascript:site_display('socialicondetails'); javascript:add_second_border('socialicon-details');">Social Icon settings</a>
            <a href="#" id="lti-details" onclick="javascript:site_display('ltidetails'); javascript:add_second_border('lti-details');">LT/Moodle settings</a>
        </div>
    </div>

    <div id="button-template-menu" class="menu">
        <div class="space-top">
            <a href="#" id="sub-template" onclick="javascript:template_display('sub-templates'); javascript:add_second_border('sub-template');">Sub-Templates</a>
        </div>
    </div>

    <div id="button-gebruikers-menu" class="menu">
        <div class="space-top">
            <a href="#" id="Gebruiker" onclick="javascript:add_second_border('Gebruiker');">Guest User</a>
        </div>
    </div>

    <div id="button-groepen-menu" class="menu">
        <div class="space-top">
            <a href="#" id="Groepen" onclick="javascript:add_second_border('Groepen');">Manage Groups</a>
        </div>
    </div>

    <div id="button-gebruikerslo-menu" class="menu">
        <div class="space-top">
            <a href="#" id="Gebruikerlo" onclick="javascript:add_second_border('Gebruikerlo');">Projects</a>
        </div>
    </div>

    <div id="button-logs-menu" class="menu">
        <div class="space-top">
            <a href="#" id="logs" onclick="javascript:add_second_border('logs');">Log files</a>

        </div>
    </div>

    <div id="button-toegang-menu" class="menu">
        <div class="space-top">
            <a href="#" id="new-settings" onclick="javascript:add_second_border('new-settings');">Add new settings</a>
            <a href="#" id="manage-settings" onclick="javascript:add_second_border('manage-settings');">Manage existing settings</a>
        </div>
    </div>

    <div id="button-categorie-menu" class="menu">
        <div class="space-top">
            <a href="#" id="categorie" onclick="javascript:add_second_border('categorie');">Add new categorie</a>
            <a href="#" id="manage-categorie" onclick="javascript:add_second_border('manage-categorie');">Manage existing categorie</a>
        </div>
    </div>

    <div id="button-educations-menu" class="menu">
        <div class="space-top">
            <a href="#" id="level" onclick="javascript:add_second_border('level');">Add new education level</a>
            <a href="#" id="manage-level" onclick="javascript:add_second_border('manage-level');">Manage existing education levels</a>
        </div>
    </div>

    <div id="button-groeperingen-menu" class="menu">
        <div class="space-top">
            <a href="#" id="manage-groups" onclick="javascript:add_second_border('manage-groups');">Manage groups</a>
        </div>
    </div>

    <div id="button-cursussen-menu" class="menu">
        <div class="space-top">
            <a href="#" id="add-level" onclick="javascript:add_second_border('add-level');">Add new education level</a>
            <a href="#" id="manage-level" onclick="javascript:add_second_border('manage-level');">Manage existing education levels</a>
        </div>
    </div>

    <div id="button-licentie-menu" class="menu">
        <div class="space-top">
            <a href="#" id="licentie" onclick="javascript:add_second_border('licentie');">Licenses</a>
        </div>
    </div>

    <div id="button-feed-menu" class="menu">
        <div class="space-top">
            <a href="#" id="feed" onclick="javascript:add_second_border('feed');">Feed</a>
        </div>
    </div>




    <script>

     $(".xerte-button").each(function (index, element){
         $("#"+$(this).attr('id')+"-menu").addClass('hide');
         $(this).on("click", function(){
             var doubleClickElement;
             $(".xerte-button").each(function (index, element){
                 if($("#"+$(this).attr('id')+"-menu").hasClass("show")){
                     $("#"+$(this).attr('id')+"-menu").removeClass('show');
                     $("#"+$(this).attr('id')+"-menu").addClass('hide');
                     doubleClickElement =  "#"+$(this).attr('id')+"-menu";
                 }

             })

             if($("#"+$(this).attr('id')+"-menu").hasClass("show")){
                 $("#"+$(this).attr('id')+"-menu").removeClass('show');
                 $("#"+$(this).attr('id')+"-menu").addClass('hide');
             }else{
                 if("#"+$(this).attr('id')+"-menu" != doubleClickElement){
                     $("#"+$(this).attr('id')+"-menu").removeClass('hide');
                     $("#"+$(this).attr('id')+"-menu").addClass('show');
                 }
             }

         });
     })
     // $('.xerte-button').click(function(){
     //     $('.navbar-collapse').toggleClass('show');
     //     $('.navbar-toggle').toggleClass('hide');
     // });
     // $( "#menuButton" ).each(function(index) {
     //
     // });
    </script>

    <script type="application/javascript">
     var loLanguage = '<?php (isset($_SESSION['toolkits_language'])) ? $_SESSION['toolkits_language'] : "";?>';
    </script>

    <div class="pagecontainer">

        <div class="buttonbar">

            <div class="userbar">
                <?php // echo "&nbsp;&nbsp;&nbsp;" . INDEX_LOGGED_IN_AS . " ";
                echo "Admin"; ?>
                <button title="<?php echo MANAGEMENT_LOGOUT; ?>"
                        type="button" class="xerte_button_c_no_width"
                        onclick="javascript:logout()" style="margin-bottom: 8px;">
                    <i class="fas fa-sign-out-alt"></i><?php echo MANAGEMENT_LOGOUT; ?>
                </button>
            </div>
            <div style="clear:both;"></div>
            <div class="separator"></div>
        </div>

        <div class="admin_mgt_area">
            <div class="admin_mgt_area_top">
                <div class="sign_in_TL m_b_d_2_child">
                    <div class="sign_in_TR m_b_d_2_child">
                        <h1 class="heading">
                            <?PHP echo MANAGEMENT_TITLE; ?>
                        </h1>
                    </div>
                </div>
            </div>

            <div class="admin_mgt_area_middle">
                <div class="admin_mgt_area_middle_button">

                    <!--

                         admin area menu

                    -->

                    <div class="admin_mgt_area_middle_button_left">
                        <button type="button" class="xerte_button" onclick="javascript:site_list();"><i class="fa fa-sitemap"></i> <?PHP echo MANAGEMENT_MENUBAR_SITE; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:templates_list();"><i class="fa fa-file-code-o"></i> <?PHP echo MANAGEMENT_MENUBAR_CENTRAL; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:users_list();"><i class="fa fa-users-cog"></i> <?PHP echo MANAGEMENT_MENUBAR_USERS; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:user_groups_list();"><i class="fa fa-users"></i> <?PHP echo MANAGEMENT_MENUBAR_USER_GROUPS; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:user_templates_list();"><i class="far fa-file-alt"></i> <?PHP echo MANAGEMENT_MENUBAR_TEMPLATES; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:errors_list();"><i class="fa fa-exclamation-triangle"></i> <?PHP echo MANAGEMENT_MENUBAR_LOGS; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:play_security_list();"><i class="fa fa-key"></i> <?PHP echo MANAGEMENT_MENUBAR_PLAY; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:categories_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_CATEGORIES; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:educationlevel_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_EDUCATION; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:grouping_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_GROUPINGS; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:course_list();"><i class="fa fa-list-ul"></i> <?PHP echo MANAGEMENT_MENUBAR_COURSES; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:licenses_list();"><i class="fa fa-cc"></i> <?PHP echo MANAGEMENT_MENUBAR_LICENCES; ?>	</button>
                        <button type="button" class="xerte_button" onclick="javascript:feeds_list();"><i class="fa fa-rss"></i> <?PHP echo MANAGEMENT_MENUBAR_FEEDS; ?>	</button> <!--style="margin-right:10px;"-->
                    </div>
                    <div class="admin_mgt_area_middle_button_right">
                        <button type="button" class="xerte_button" onclick="javascript:save_changes()"><i class="fa fa-floppy-o"></i> <?PHP echo MANAGEMENT_MENUBAR_SAVE; ?></button>
                    </div>

                </div>
            </div>
        </div>
    </div>

</div>
<script type="text/javascript" src="editor/js/vendor/ckeditor/ckeditor.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/adapters/jquery.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.addons.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.mode.htmlmixed.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.mode.javascript.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/beautify.min.js"></script>
<script type="text/javascript" src="editor/js/vendor/ckeditor/plugins/codemirror/js/codemirror.addons.search.min.js"></script>
<script>
 setTimeout(function() {
	 var sidebarWidth = $(".sidebar").width();

	 $(".menu").css('left', sidebarWidth);

	 $(window).resize(function(){
		 var sidebarWidth = $(".sidebar").width();

		 $(".menu").css('left', sidebarWidth);
	 });

	 $(".xerte-buttons-container .xerte-button").click(function(){
		 var sidebarWidth = $(".sidebar").width();


		 $(".menu").css('left', sidebarWidth);

		 if($(".xerte-button").hasClass('xerte-button-border'))
		 {

			 $("#button-site-menu")._removeClass('hide').addClass('show')
		 }
		 else
		 {
			 $("#button-site-menu")._removeClass('show').addClass('hide')
		 }
	 });


 }, 50);
</script>
