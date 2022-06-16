<?PHP
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.

 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


require(dirname(__FILE__) .  '/../../website_code/php/xmlInspector.php');


function process_logos($tp, $page_content) {
    $base_path = dirname(__FILE__) . '/../../' . $tp . 'common/img/';
    $extensions = ['svg',  'png', 'jpg', 'gif'];

    // Deal with both logos
    foreach ([['L', '_left'], ['R', '']] as $suffix) {
        foreach($extensions as $ext) {
            if (file_exists($base_path . 'logo' . $suffix[1] . '.' . $ext)) {
                $page_content = str_replace("%LOGO_" . $suffix[0] . "%", '<img class="logo' . $suffix[0] . '" src="%TEMPLATEPATH%common/img/logo' . $suffix[1] . '.'. $ext . '"/>' , $page_content);
                break;
            }
        }
        $page_content = str_replace("%LOGO_" . $suffix[0] . "%", '<img class="logo' . $suffix[0] . '" src="" />' , $page_content);
    }

    return $page_content;
}

function show_preview_code($row)
{

    global $xerte_toolkits_site;

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    $xmlfile = $string_for_flash . "preview.xml";

    $xmlFixer = new XerteXMLInspector();
    $xmlFixer->loadTemplateXML($xmlfile, true);

    if (strlen($xmlFixer->getName()) > 0)
    {
        $title = $xmlFixer->getName();
    }
    else
    {
        $title = SITE_PREVIEW_TITLE;
    }

    $string_for_flash_xml = $xmlfile;

    $string_for_flash = $xerte_toolkits_site->users_file_area_short . $row['template_id'] . "-" . $row['username'] . "-" . $row['template_name'] . "/";

    $template_path_string = "modules/site/parent_templates/" . $row['parent_template'] . "/";

    require_once("config.php");

    _load_language_file("/modules/site/preview.inc");

    $version = getVersion();
    $language_ISO639_1code = substr($xmlFixer->getLanguage(), 0, 2);
    // $engine is assumed to be javascript if flash is NOT set
    $page_content = file_get_contents($xerte_toolkits_site->basic_template_path . $row['template_framework'] . "/player_html5/rloObject.htm");

    $tracking = "<script type=\"text/javascript\" src=\"" . $template_path_string . "common/js/xttracking_noop.js?version=" . $version . "\"></script>";

    $page_content = process_logos($template_path_string, $page_content);

    $page_content = str_replace("%TRACKING_SUPPORT%", $tracking, $page_content);
    $page_content = str_replace("%VERSION_PARAM%", "?version" . $version , $page_content);
    $page_content = str_replace("%LANGUAGE%", $language_ISO639_1code, $page_content);
    $page_content = str_replace("%TITLE%", $title, $page_content);
    $page_content = str_replace("%TEMPLATEPATH%", $template_path_string, $page_content);
    $page_content = str_replace("%XMLPATH%", $string_for_flash, $page_content);
    $page_content = str_replace("%XMLFILE%", $string_for_flash_xml, $page_content);
	$page_content = str_replace("%THEMEPATH%", "themes/" . $row['parent_template'] . "/",$page_content);
    $page_content = str_replace("%LASTUPDATED%", $row['date_modified'], $page_content);
    $page_content = str_replace("%DATECREATED%", $row['date_created'], $page_content);
    $page_content = str_replace("%NUMPLAYS%", $row['number_of_uses'], $page_content);
    $page_content = str_replace("%USE_URL%", "", $page_content);
    $page_content = str_replace("%GLOBALHIDESOCIAL%", $xerte_toolkits_site->globalhidesocial, $page_content);
    $page_content = str_replace("%GLOBALSOCIALAUTH%", $xerte_toolkits_site->globalsocialauth, $page_content);

    //remove socialicons script
    $xml = new XerteXMLInspector();
    $xml->loadTemplateXML($xmlfile);
    $hidesocial = $xml->getLOAttribute('hidesocial');
    $footerhide = $xml->getLOAttribute('footerHide');
    $footerpos = $xml->getLOAttribute('footerPos');
    if ($hidesocial != 'true' && $footerhide != 'true' && $footerpos != 'replace' && ($xerte_toolkits_site->globalhidesocial != 'true' || $xerte_toolkits_site->globalsocialauth != 'false')) {
        $page_content = str_replace("%ADDTHISSCRIPT%", '<script type="text/javascript" src="//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-50f40a8436e8c4c5" async="async"></script>', $page_content);
    } else {
        $page_content = str_replace("%ADDTHISSCRIPT%", '', $page_content);
    }

    //twittercard
    $xml = new XerteXMLInspector();
    $xml->loadTemplateXML($xmlfile);
    $tcoption = $xml->getLOAttribute('tcoption');
    $tcmode= $xml->getLOAttribute('tcmode');
    $tcsite= $xml->getLOAttribute('tcsite');
    $tccreator= $xml->getLOAttribute('tccreator');
    $tctitle= $xml->getLOAttribute('tctitle');
    $tcdescription= $xml->getLOAttribute('tcdescription');
    $tcimage= $xml->getLOAttribute('tcimage');
    $tcimage = str_replace("FileLocation + '" , $xerte_toolkits_site->site_url . $string_for_flash, $tcimage);
    $tcimage = str_replace("'", "", $tcimage);
    $tcimagealt= $xml->getLOAttribute('tcimagealt');
    if ($tcoption=="true"){
        $page_content = str_replace("%TWITTERCARD%", '<meta name="twitter:card" content="'.$tcmode.'"><meta name="twitter:site" content="'.$tcsite.'"><meta name="twitter:creator" content="'.$tccreator.'"><meta name="twitter:title" content="'.$tctitle.'"><meta name="twitter:description" content="'.$tcdescription.'"><meta name="twitter:image" content="'.$tcimage.'"><meta name="twitter:image:alt" content="'.$tcimagealt.'">', $page_content);
    }else{
        $page_content = str_replace("%TWITTERCARD%", "", $page_content);
    }

    echo $page_content;
}