<?php

declare(strict_types=1);

/**
 * 1) Navigate to users_file_area_full
 * 2) Find folder whose name starts with template_id
 * 3) Return full path to data.xml inside it
 */
function xerte_find_data_xml_path(string $users_file_area_full, string|int $template_id): string
{
    $base = rtrim($users_file_area_full, "/\\");
    if (!is_dir($base)) {
        throw new RuntimeException("users_file_area_full is not a directory: $base");
    }

    $prefix = (string)$template_id;

    // Find directories whose basename starts with the template id
    $matches = glob($base . DIRECTORY_SEPARATOR . $prefix . '*', GLOB_ONLYDIR);
    if (!$matches || count($matches) === 0) {
        throw new RuntimeException("No folder starting with '$prefix' found under: $base");
    }

    // If multiple for one reason or another, prefer the newest
    usort($matches, fn($a, $b) => filemtime($b) <=> filemtime($a));
    $folder = $matches[0];

    $dataXml = $folder . DIRECTORY_SEPARATOR . 'data.xml';
    if (!is_file($dataXml)) {
        throw new RuntimeException("data.xml not found in folder: $folder");
    }

    return $dataXml;
}


/**
 * Load data.xml and append generated nodes inside existing <learningObject>.
 *
 * @param string $dataXmlPath full path to data.xml
 * @param array $generatedNodes array of either:
 *    - strings: "<mcq .../>"
 *    - or arrays with ['xml' => "<mcq .../>"] like the mapper output
 */
function xerte_append_nodes_to_data_xml(string $dataXmlPath, array $generatedNodes): void
{
    $doc = new DOMDocument();
    $doc->preserveWhiteSpace = false;
    $doc->formatOutput = true;


    // load doc
    if (!$doc->load($dataXmlPath)) {
        throw new RuntimeException("Failed to load data.xml: $dataXmlPath");
    }

    //find the LO node and its contents
    $xp = new DOMXPath($doc);
    $learningObject = $xp->query('//*[local-name()="learningObject"]')->item(0);
    if (!($learningObject instanceof DOMElement)) {
        throw new RuntimeException("No <learningObject> root node found in: $dataXmlPath");
    }

    foreach ($generatedNodes as $entry) {
        $xml = is_array($entry) ? ($entry['xml'] ?? null) : $entry;
        if (!is_string($xml) || trim($xml) === '') continue;

        // Parse the node snippet into a temporary DOM
        $tmp = new DOMDocument();
        $tmp->preserveWhiteSpace = false;

        // Ensure it's well-formed XML (single root element)
        if (!$tmp->loadXML($xml)) {
            throw new RuntimeException("Generated node is not valid XML:\n$xml");
        }

        $node = $tmp->documentElement;
        if (!($node instanceof DOMElement)) continue;

        // Import into data.xml doc and append
        $imported = $doc->importNode($node, true);
        $learningObject->appendChild($imported);
    }

    if ($doc->save($dataXmlPath) === false) {
        throw new RuntimeException("Failed to save updated data.xml: $dataXmlPath");
    }
}

//Helper which searches for the template ID in the name of the given user files, but only if its a prefix
function xerte_find_lo_folder(string $users_file_area_full, string|int $template_id): string
{
    $base = rtrim($users_file_area_full, "/\\");
    if (!is_dir($base)) {
        throw new RuntimeException("users_file_area_full is not a directory: $base");
    }

    $prefix = (string)$template_id;
    $matches = glob($base . DIRECTORY_SEPARATOR . $prefix . '*', GLOB_ONLYDIR);
    if (!$matches || count($matches) === 0) {
        throw new RuntimeException("No folder starting with '$prefix' found under: $base");
    }

    usort($matches, fn($a, $b) => filemtime($b) <=> filemtime($a));
    return $matches[0];
}

//helper to point directly towards the media dir within a USER-FILES folder
function xerte_media_dir(string $users_file_area_full, string|int $template_id): string
{
    $loFolder = xerte_find_lo_folder($users_file_area_full, $template_id);
    $mediaDir = $loFolder . DIRECTORY_SEPARATOR . 'media';

    if (!is_dir($mediaDir)) {
        if (!mkdir($mediaDir, 0775, true)) {
            throw new RuntimeException("Failed to create media dir: $mediaDir");
        }
    }

    return $mediaDir;
}

/**
 * Copies any referenced media files from the extracted QTI folder into the Xerte LO /media folder,
 * then rewrites $human media src to "media/<filename>".
 *
 * Assumptions:
 * - QTI src values are relative paths like "resources/abc.png"
 * - Those paths are relative to $extract_path
 */
function qti_stage_media_into_xerte_and_rewrite(array &$human, string $extract_path, string $xerteMediaDir): array
{
    $extract_path = rtrim($extract_path, "/\\");
    $xerteMediaDir = rtrim($xerteMediaDir, "/\\");
    $copied = [];
    $missing = [];

    $copyOne = function (string $src) use ($extract_path, $xerteMediaDir, &$copied, &$missing): ?string {
        $src = trim($src);
        if ($src === '') return null;

        // Absolute source path in extracted QTI folder
        $absSrc = $extract_path . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $src);

        // Destination file name (keep basename only)
        $filename = basename(str_replace('\\', '/', $src));
        $absDst = $xerteMediaDir . DIRECTORY_SEPARATOR . $filename;

        if (!is_file($absSrc)) {
            $missing[] = ['src' => $src, 'abs' => $absSrc];
            return null;
        }

        // Copy once
        if (!is_file($absDst)) {
            if (!copy($absSrc, $absDst)) {
                $missing[] = ['src' => $src, 'abs' => $absSrc, 'reason' => 'copy_failed'];
                return null;
            }
            $copied[] = ['from' => $absSrc, 'to' => $absDst];
        }

        // Rewrite to Xerte-local path form
        return 'media/' . $filename;
    };

    if (!isset($human['pages']) || !is_array($human['pages'])) {
        return ['copied' => $copied, 'missing' => $missing];
    }

    foreach ($human['pages'] as &$page) {
        if (!isset($page['item']) || !is_array($page['item'])) continue;

        // Item-level media
        if (isset($page['item']['media']) && is_array($page['item']['media'])) {
            foreach ($page['item']['media'] as &$m) {
                if (!is_array($m) || empty($m['src'])) continue;
                $newSrc = $copyOne((string)$m['src']);
                if ($newSrc !== null) {
                    $m['src'] = $newSrc;
                }
            }
            unset($m);
        }

        // Choice-level media for redundancy, nominally there should be no media nodes in the possible answers
        if (isset($page['item']['choices']) && is_array($page['item']['choices'])) {
            foreach ($page['item']['choices'] as &$choice) {
                if (!is_array($choice)) continue;
                if (!isset($choice['media']) || !is_array($choice['media'])) continue;

                foreach ($choice['media'] as &$m) {
                    if (!is_array($m) || empty($m['src'])) continue;
                    $newSrc = $copyOne((string)$m['src']);
                    if ($newSrc !== null) {
                        $m['src'] = $newSrc;
                    }
                }
                unset($m);
            }
            unset($choice);
        }
    }
    unset($page);

    return ['copied' => $copied, 'missing' => $missing];
}