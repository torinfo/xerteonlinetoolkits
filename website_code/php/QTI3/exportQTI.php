<?php
require_once("../../../config.php");
require_once("../user_library.php");

require_once(__DIR__ . "/xerte_file_ops.php");
require_once(__DIR__ . "/qti_export_min.php");
require_once(__DIR__ . "/qti_service.php"); // (NEW) QTI client for validation + zip writing

require_once(__DIR__ . "/../template_status.php");

$prefix = $xerte_toolkits_site->database_table_prefix;

// Input and permission check wrappers
function require_int_query_param(string $name): int {
    if (!isset($_GET[$name]) || !is_numeric($_GET[$name])) {
        http_response_code(400);
        exit("Invalid {$name}");
    }
    return (int)$_GET[$name];
}

function require_export_permission(int $template_id): void {
    $proceed = false;
    if (is_template_exportable($template_id)) {
        $proceed = true;
    } else if (is_user_creator_or_coauthor($template_id) || is_user_permitted("projectadmin")) {
        $proceed = true;
    }
    if (!$proceed) {
        http_response_code(403);
        exit("Not permitted");
    }
}

function collect_generated_item_ids(string $pkgDir): array {
    $itemIds = [];
    foreach (glob($pkgDir . DIRECTORY_SEPARATOR . 'ITEM*.xml') as $path) {
        $itemIds[] = basename($path, '.xml');
    }
    sort($itemIds, SORT_NATURAL);
    return $itemIds;
}

//Loading a template for processing
function load_template_row_or_404(int $template_id, string $prefix): array {
    $query = "select {$prefix}templatedetails.template_name, {$prefix}templaterights.template_id,
                     {$prefix}logindetails.username
              from {$prefix}templaterights, {$prefix}logindetails, {$prefix}templatedetails
              where {$prefix}templaterights.template_id = {$prefix}templatedetails.template_id
                and {$prefix}templatedetails.creator_id = {$prefix}logindetails.login_id
                and {$prefix}templaterights.template_id = ?
                and role = ?";
    $row = db_query_one($query, array($template_id, 'creator'));
    if (!$row) {
        http_response_code(404);
        exit("Template not found");
    }
    return $row;
}

function safe_download_name(string $templateName, int $template_id): string {
    $base = preg_replace('/[^a-zA-Z0-9_\-]+/', '_', $templateName);
    return $base . '_' . $template_id . '_qti.zip';
}

// A temporary directory is created to store the QTI folder structure, which later gets zipped, after which the temp dir is deleted
function make_temp_dir(string $prefix = 'qtiExport_'): string {
    $dir = rtrim(sys_get_temp_dir(), '/\\') . DIRECTORY_SEPARATOR . $prefix . bin2hex(random_bytes(8));
    if (!mkdir($dir, 0700, true)) {
        http_response_code(500);
        exit("Failed to create temp dir");
    }
    return $dir;
}

// Delete a directory, starting with the contents within and move its way upwards
function rrmdir(string $dir): void {
    if (!is_dir($dir)) return;
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($it as $f) {
        $path = $f->getPathname();
        $f->isDir() ? @rmdir($path) : @unlink($path);
    }
    @rmdir($dir);
}

/** ---------- Main ---------- */
$template_id = require_int_query_param('template_id');
require_export_permission($template_id);
$row = load_template_row_or_404($template_id, $prefix);

$loFolder = xerte_find_lo_folder($xerte_toolkits_site->users_file_area_full, $template_id);

$dataXmlPath = $loFolder . DIRECTORY_SEPARATOR . "data.xml";
$loMediaDir  = $loFolder . DIRECTORY_SEPARATOR . "media";
if (!is_file($dataXmlPath)) {
    http_response_code(500);
    exit("data.xml not found");
}

// Build package in temp dir + zip it

// Base temp dir for both package folder and client workspace
$baseDir = make_temp_dir('qtiExport_');

// QTI package folder we generate
$pkgDir = $baseDir . DIRECTORY_SEPARATOR . 'pkg';
mkdir($pkgDir, 0700, true);

// Client workspace folder (Flysystem root + downloader dir)
$clientDir = $baseDir . DIRECTORY_SEPARATOR . 'client';
mkdir($clientDir, 0700, true);

$zipPath = tempnam(sys_get_temp_dir(), 'qtiZip_');
if ($zipPath === false) {
    rrmdir($pkgDir);
    http_response_code(500);
    exit("Failed to create temp zip");
}
@unlink($zipPath); // tempnam creates an empty file; ZipArchive wants to create/overwrite

try {
    // Build QTI folder structure only
    export_xerte_lo_to_qti_folder_mcq_only(
        $dataXmlPath,
        $loMediaDir,
        $pkgDir,
        $row['template_name'] ?? 'Exported Test',
        'nl-NL'
    );

    $qtiClient = qti_get_client($baseDir);

    if (!file_exists($pkgDir . '/assessmentTest.xml')) {
        throw new Exception("Missing assessmentTest.xml");
    }

    $itemIds = collect_generated_item_ids($pkgDir);
    if (count($itemIds) === 0) {
        throw new Exception("No generated item XML files found");
    }

// Parse test XML into library model
    $testDoc = new DOMDocument();
    $testDoc->preserveWhiteSpace = false;
    if (!$testDoc->load($pkgDir . '/assessmentTest.xml')) {
        throw new Exception("Failed to load assessmentTest.xml");
    }
    $test = $qtiClient->getAssessmentTestParser()->parse($testDoc->documentElement);

// Parse item XMLs into library models
    $items = [];
    foreach ($itemIds as $itemId) {
        $itemPath = $pkgDir . DIRECTORY_SEPARATOR . $itemId . '.xml';

        $itemDoc = new DOMDocument();
        $itemDoc->preserveWhiteSpace = false;
        if (!$itemDoc->load($itemPath)) {
            throw new Exception("Failed to load {$itemId}.xml");
        }

        $items[] = $qtiClient->getAssessmentItemParser()->parse($itemDoc->documentElement);;
    }

    $rootResourcesDir = $baseDir . DIRECTORY_SEPARATOR . 'resources';
    if (!is_dir($rootResourcesDir)) {
        mkdir($rootResourcesDir, 0700, true);
    }

    foreach (glob($pkgDir . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . '*') as $src) {
        $dst = $rootResourcesDir . DIRECTORY_SEPARATOR . basename($src);
        if (!is_file($dst)) {
            copy($src, $dst);
        }
    }

// Build package from parsed models
    //$qtiPackage = $qtiClient->getQtiPackageBuilder()->buildForTest($test, $items);

    $oldCwd = getcwd();
    chdir($baseDir);

    try {
        $qtiPackage = $qtiClient->getQtiPackageBuilder()->buildForTest($test, $items);
    } finally {
        chdir($oldCwd);
    }

// Optional: still check test is buildable from package
    $qtiClient->getTestBuilder()->buildFromPackage($qtiPackage);

    $validator = $qtiClient->getQtiPackageValidator();
    $errors = $validator->validate($qtiPackage);

// You may want to fail fast here during development
    if ($errors->count() > 0) {
        throw new Exception("QTI validation errors:\n" . implode("\n", iterator_to_array($errors)));
    }

    $writer = $qtiClient->getZipPackageFactory()->getWriter($zipPath);
    $writer->write($qtiPackage);

    /*
// Use library to read (validate) folder
    $qtiClient = qti_get_client($baseDir); // client root is the base dir

    $qtiPackageReader = $qtiClient->getQtiPackageReader();

    // Sanity check: required files exist, else something went wrong
    if (!file_exists($pkgDir . '/imsmanifest.xml')) throw new Exception("Missing imsmanifest.xml");
    if (!file_exists($pkgDir . '/assessmentTest.xml')) throw new Exception("Missing assessmentTest.xml");

    $qtiPackage = $qtiPackageReader->fromFilesystem('pkg'); // read folder inside client root

// ensure test is buildable from package
    $qtiClient->getTestBuilder()->buildFromPackage($qtiPackage);

    $validator = $qtiClient->getQtiPackageValidator();
    $errors = $validator->validate($qtiPackage);

// Use library to write zip from package
    $writer = $qtiClient->getZipPackageFactory()->getWriter($zipPath);*/
    //$writer->write($qtiPackage);

    $downloadName = safe_download_name((string)$row['template_name'], $template_id);

    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Length: ' . filesize($zipPath));
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');

    readfile($zipPath);
} finally {
    @unlink($zipPath);
    rrmdir($baseDir);
}

exit;