<?php
/**
 * import_qti.php
 *
 * Priorities:
 * 1) Keep zip security checks similar to import.php (path traversal + x_check_zip + upload filter)
 * 2) Keep new template creation similar to new_template.php (create_new_template())
 * 3) After creating temp folder + extracting, use QTI3 library on the uploaded zip to create a PHP object (QtiPackage)
 */

require_once("../../../config.php");
require_once("../../../plugins.php");

include "../user_library.php";
include "../template_library.php";
include "../file_library.php";

require_once(__DIR__ . "/qti_service.php");
require_once(__DIR__ . "/qti_convert.php");
require_once(__DIR__ . "/qti_xerte_mapper.php");
require_once(__DIR__ . "/xerte_file_ops.php");

if (empty($_SESSION['toolkits_logon_id'])) {
    die("Please login");
}

/**
 * Recursively build the array format expected by apply_filters('editor_upload_file', ...)
 */
function importqti_build_upload_filter_array(string $rootPath): array
{
    $check_file_array = array('name' => array(), 'tmp_name' => array());

    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($rootPath, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($it as $fileInfo) {
        if ($fileInfo->isFile()) {
            $check_file_array['name'][] = $fileInfo->getFilename();
            $check_file_array['tmp_name'][] = $fileInfo->getPathname();
        }
    }

    return $check_file_array;
}

/**
 * Create a new blank LO
 *
 * @return array{template_id:int, editor_size:string}
 * @throws Exception
 */
function importqti_create_blank_lo(string $templatename, string $tutorialname, int $folder_id): array
{
    global $xerte_toolkits_site;

    database_connect("QTI import create template connect", "QTI import create template fail");

    $row_template_type = db_query_one(
        "SELECT template_type_id, template_name, parent_template, template_framework
         FROM {$xerte_toolkits_site->database_table_prefix}originaltemplatesdetails
         WHERE template_name = ?",
        array($templatename)
    );

    if (!$row_template_type) {
        throw new Exception("Unknown template");
    }

    $extraflags = "";
    if ($row_template_type['template_framework'] === 'xerte') {
        if (
            ($row_template_type['parent_template'] === 'multipersp') ||
            ($row_template_type['parent_template'] === 'mediaInteractions') ||
            ($row_template_type['parent_template'] === 'Rss')
        ) {
            $extraflags = "engine=flash";
        } else {
            $extraflags = "engine=javascript";
        }
    }

    $access = "Private";
    if (isset($_SESSION['lti_enabled']) && $_SESSION['lti_enabled']) {
        $access = "Public";
    }

    $query_for_new_template =
        "INSERT INTO {$xerte_toolkits_site->database_table_prefix}templatedetails
         (creator_id, template_type_id, date_created, date_modified, number_of_uses, access_to_whom, template_name, extra_flags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    $now = date('Y-m-d H:i:s');

    $lastid = db_query($query_for_new_template, array(
        $_SESSION['toolkits_logon_id'],
        $row_template_type['template_type_id'],
        $now,
        $now,
        0,
        $access,
        htmlspecialchars(str_replace(" ", "_", $tutorialname)),
        $extraflags
    ));

    if ($lastid === false) {
        throw new Exception($_SESSION['toolkits_most_recent_error'] ?? 'db insert failed');
    }

    $res = db_query(
        "INSERT INTO {$xerte_toolkits_site->database_table_prefix}templaterights (template_id, user_id, role, folder)
         VALUES (?,?,?,?)",
        array($lastid, $_SESSION['toolkits_logon_id'], "creator", (string)$folder_id)
    );

    if ($res === false) {
        throw new Exception($_SESSION['toolkits_most_recent_error'] ?? 'rights insert failed');
    }

    $module_new_template = $xerte_toolkits_site->root_file_path
        . $xerte_toolkits_site->module_path
        . $row_template_type['template_framework']
        . "/new_template.php";

    if (!file_exists($module_new_template)) {
        throw new Exception("Module new_template.php not found: " . $module_new_template);
    }

    include $module_new_template;

    if (!function_exists('create_new_template')) {
        throw new Exception("create_new_template() not defined by module: " . $module_new_template);
    }

    create_new_template((int)$lastid, $templatename, $row_template_type['parent_template']);

    $editor_size_key = $row_template_type['template_framework'] . "_" . $row_template_type['template_name'];
    $editor_size = "";
    if (isset($xerte_toolkits_site->learning_objects->{$editor_size_key})
        && isset($xerte_toolkits_site->learning_objects->{$editor_size_key}->editor_size)) {
        $editor_size = (string)$xerte_toolkits_site->learning_objects->{$editor_size_key}->editor_size;
    }

    return array('template_id' => (int)$lastid, 'editor_size' => $editor_size);
}

/**
 * Create a per-request working directory inside import_path.
 */
function importqti_make_work_root(string $importPath): string
{
    $this_dir = rand() . "/";
    $work_root = rtrim($importPath, "/") . "/" . $this_dir;

    mkdir($work_root, 0777, true);
    chmod($work_root, 0777);

    return $work_root;
}


// Main request handler
global $xerte_toolkits_site;

// Template choice: for demo, fixed since bootstrap exports are not in scope.
$templatename = "Nottingham";

// Project name from UI; should really be receiving tutorialname but for some reason the name is in the templatename field;
$tutorialname = isset($_POST['templatename']) ? x_clean_input($_POST['templatename']) : "";

// Validate like new_template.php
if (!preg_match('/^[a-zA-Z0-9_]+$/', $templatename)) {
    die("Invalid template name");
}
if (!preg_match('/^[a-zA-Z0-9_ ]+$/', $tutorialname)) {
    die("Invalid project name");
}

database_connect("QTI import connect", "QTI import fail");

// Target folder
$root_folder_id = get_user_root_folder();
if (isset($_POST["folder_id"]) && strlen($_POST["folder_id"]) > 0) {
    $folder_id = (int)x_clean_input($_POST["folder_id"], 'numeric');
} else {
    $folder_id = (int)$root_folder_id;
}

// Upload guard
if (!isset($_FILES['filenameuploaded']) || !isset($_FILES['filenameuploaded']['name'])) {
    die("No file uploaded");
}

$filename = x_clean_input($_FILES['filenameuploaded']['name'], 'string');
if (strtolower(substr($filename, -3)) !== "zip") {
    die("Upload must be a zip.****");
}

if (!_is_writable($xerte_toolkits_site->import_path)) {
    die($xerte_toolkits_site->import_path . ": import path not writable.****");
}

$cleanup_paths = array();

try {
    // 1) Create per-request work dir
    $work_root = importqti_make_work_root($xerte_toolkits_site->import_path);
    $cleanup_paths[] = $work_root;

    // 2) Move upload to disk
    $zip_path = $work_root . time() . $filename;

    x_check_path_traversal_newpath($_FILES['filenameuploaded']['tmp_name']);
    x_check_path_traversal_newpath($zip_path);

    if (!@move_uploaded_file($_FILES['filenameuploaded']['tmp_name'], $zip_path)) {
        die("Upload failed.****");
    }
    $cleanup_paths[] = $zip_path;

    // 3) Zip container security checks (similar to import.php)
    $zip = new ZipArchive();
    if ($zip->open($zip_path) !== true) {
        die("Failed to open zip.****");
    }
    x_check_zip($zip, 'template');
    $zip->close();

    // 4) Extract to temp folder (import.php pattern)
    $extract_path = $work_root . "qti/";
    mkdir($extract_path, 0777, true);
    chmod($extract_path, 0777);
    $cleanup_paths[] = $extract_path;

    $zip = new ZipArchive();
    if ($zip->open($zip_path) !== true) {
        die("Failed to reopen zip.****");
    }
    $zip->extractTo($extract_path);
    $zip->close();

    // 5) Upload-policy filter checks
    $check_file_array = importqti_build_upload_filter_array($extract_path);
    if (!apply_filters('editor_upload_file', $check_file_array)) {
        die("Upload checks failed.****");
    }

    // 6) QTI library parse -> PHP objects (QtiPackage + AssessmentTest)
    $qti_workdir = $work_root . "qti-lib-work/";
    mkdir($qti_workdir, 0777, true);
    chmod($qti_workdir, 0777);
    $cleanup_paths[] = $qti_workdir;

    $qti = qti_zip_to_objects_and_plan($zip_path, $extract_path, $qti_workdir);

    // Objects now available for later mapping:
    $qtiPackage = $qti['package']; // Qti3\Package\Model\QtiPackage
    $qtiTest    = $qti['test'];    // AssessmentTest (model)

    //Get item references in order
    $itemRefs = qti_test_ordered_item_refs($qtiTest);

    //Create a more readable structure out of the imported test which also contains
    //the relevant fields we need to continue with the conversion
    $human = qti_build_human_structure_mcq_only($qtiTest, $extract_path);

    $qtiMapping = $qti['mapping']; // stub array for now
    // $qti['summary'] is optional for debug

    // 7) Create blank Xerte LO
    $created = importqti_create_blank_lo($templatename, $tutorialname, $folder_id);

    // 8) Mapping + adding xmls to data.xml
    // transfer media to the media folder
    $mediaDir = xerte_media_dir($xerte_toolkits_site->users_file_area_full, $created['template_id']);

    // Copy QTI media into Xerte and rewrite $human media src to media/<file>
    $mediaReport = qti_stage_media_into_xerte_and_rewrite($human, $extract_path, $mediaDir);

    // 8.1) create xwd's
    $xerteMcqs = qti_human_to_xerte_mcqs($human);
        // 8.2) Find the LO data.xml
        $dataXmlPath = xerte_find_data_xml_path(
            $xerte_toolkits_site->users_file_area_full,
            $created['template_id']
        );

        // 8.3) Append nodes into <learningObject>
        xerte_append_nodes_to_data_xml($dataXmlPath, $xerteMcqs);

    // 9) Return id + editor size (similar endpoint as new_template.php)
    echo "QTI 3.0 object has been imported sucessfully. LO ID:" . trim((string)$created['template_id']);

} catch (Exception $e) {
    echo "FAILED-" . $e->getMessage();
} finally {
    // Cleanup best-effort, reverse order
    foreach (array_reverse($cleanup_paths) as $p) {
        if (is_file($p)) {
            @unlink($p);
        } elseif (is_dir($p)) {
            delete_loop($p);
            @rmdir($p);
        }
    }
}