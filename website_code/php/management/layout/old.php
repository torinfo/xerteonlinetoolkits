<?php 
_load_language_file("/management.inc");

?>

<iframe id="upload_iframe" name="upload_iframe" src="" style="width:0px;height:0px; display:none;"></iframe>
<!--

     Folder popup is the div that appears when creating a new folder

-->
<div class="topbar">
    <?php
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_right.png"))
    {
    ?>
        <div
            style="width:50%; height:100%; float:right; position:relative; background-image:url(<?php echo "branding/logo_right.png";?>); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
        </div>
    <?php
    }
    else {
    ?>
        <div
            style="width:50%; height:100%; float:right; position:relative; background-image:url(website_code/images/apereoLogo.png); background-repeat:no-repeat; background-position:right; margin-right:10px; float:right">
        </div>
    <?php
    }
    if (file_exists($xerte_toolkits_site->root_file_path . "branding/logo_left.png"))
    {
    ?>
        <img src="<?php echo "branding/logo_left.png";?>" style="margin-left:10px; float:left"/>
    <?php
    }
    else {
    ?>
        <img src="website_code/images/logo.png" style="margin-left:10px; float:left"/>
    <?php
    }
    ?>
</div>
<!--

     Main part of the page

-->
<div class="pagecontainer">

    <div class="buttonbar">

        <div class="userbar">
			<select name="layouts" id="layout">
				<option class="drop"  value="new">New</option>
				<option class="drop" value="old" selected>Old</option>
			</select>
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
                <div id="admin_area">
                </div>
            </div>
        </div>
    </div>
</div>
