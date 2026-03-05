<?php
declare(strict_types=1);

require_once(__DIR__ . "/qti_service.php");

/**
 * Read a (possibly private/protected) property using Reflection.
 */
function qti_reflect_get(object $obj, string $prop)
{
    $rc = new ReflectionClass($obj);
    while ($rc) {
        if ($rc->hasProperty($prop)) {
            $p = $rc->getProperty($prop);
            $p->setAccessible(true);
            return $p->getValue($obj);
        }
        $rc = $rc->getParentClass();
    }
    return null;
}

/**
 * Extract ordered item references from AssessmentTest:
 * returns: [ ['id' => 'ITEM001', 'href' => 'ITEM001.xml'], ... ]
 */
function qti_test_ordered_item_refs(object $qtiTest): array
{
    $out = [];

    $testParts = qti_reflect_get($qtiTest, 'testParts');
    $testPartItems = is_object($testParts) ? qti_reflect_get($testParts, 'items') : null;
    if (!is_array($testPartItems)) return $out;

    foreach ($testPartItems as $testPart) {
        $sections = qti_reflect_get($testPart, 'sections');
        $sectionItems = is_object($sections) ? qti_reflect_get($sections, 'items') : null;
        if (!is_array($sectionItems)) continue;

        foreach ($sectionItems as $section) {
            $itemRefs = qti_reflect_get($section, 'assessmentItemRefs');
            $itemRefItems = is_object($itemRefs) ? qti_reflect_get($itemRefs, 'items') : null;
            if (!is_array($itemRefItems)) continue;

            foreach ($itemRefItems as $itemRef) {
                $href = qti_reflect_get($itemRef, 'href');

                $idObj = qti_reflect_get($itemRef, 'identifier'); // AssessmentItemId
                $idVal = is_object($idObj) ? qti_reflect_get($idObj, 'value') : null;

                if (is_string($idVal) && $idVal !== '' && is_string($href) && $href !== '') {
                    $out[] = ['id' => $idVal, 'href' => $href];
                }
            }
        }
    }

    return $out;
}

/**
 * Extract item identifiers from the AssessmentTest model in display order.
 * walk the model tree and collect any object that looks like an item-ref.
 */
function qti_test_ordered_item_identifiers(object $qtiTest): array
{
    $out = [];
    $seen = [];

    $walk = function ($node) use (&$walk, &$out, &$seen) {
        if (is_array($node)) {
            foreach ($node as $v) $walk($v);
            return;
        }
        if (!is_object($node)) return;

        // Class name contains "AssessmentItemRef" which should be common/standard in QTI models.
        $class = get_class($node);
        if (stripos($class, 'AssessmentItemRef') !== false || stripos($class, 'AssessmentItemref') !== false) {
            // Try common getter/property names for the referenced identifier
            $id = null;
            if (method_exists($node, 'getIdentifier')) $id = $node->getIdentifier();
            elseif (method_exists($node, 'getItemIdentifier')) $id = $node->getItemIdentifier();
            elseif (property_exists($node, 'identifier')) $id = $node->identifier;

            if (is_string($id) && $id !== '' && !isset($seen[$id])) {
                $seen[$id] = true;
                $out[] = $id;
            }
        }

        // Continue walking all public properties (simple + readable)
        foreach (get_object_vars($node) as $v) {
            $walk($v);
        }
    };

    $walk($qtiTest);

    return $out;
}

/**
 * Returns map: itemIdentifier => absolute path to item xml.
 * Uses imsmanifest.xml because that is the package's source of truth.
 */
function qti_manifest_item_file_map(string $extractPath): array
{
    $manifestPath = rtrim($extractPath, "/") . "/imsmanifest.xml";
    if (!file_exists($manifestPath)) {
        throw new RuntimeException("imsmanifest.xml missing at $manifestPath");
    }

    $doc = new DOMDocument();
    if (!$doc->load($manifestPath)) {
        throw new RuntimeException("Failed to load imsmanifest.xml");
    }

    $xp = new DOMXPath($doc);

    // Namespace-agnostic: find all <resource identifier="..."><file href="...xml"/></resource>
    $resources = $xp->query('//*[local-name()="resource"]');

    $map = [];
    foreach ($resources as $res) {
        /** @var DOMElement $res */
        $identifier = $res->getAttribute('identifier');
        if ($identifier === '') continue;

        $file = $xp->query('.//*[local-name()="file"][@href]', $res)->item(0);
        if (!$file) continue;

        /** @var DOMElement $file */
        $href = $file->getAttribute('href');
        if ($href === '' || !preg_match('/\.xml$/i', $href)) continue;

        $abs = rtrim($extractPath, "/") . "/" . ltrim($href, "/");
        if (file_exists($abs)) {
            $map[$identifier] = $abs;
        }
    }

    return $map;
}

/**
 * Summarize a single item XML into a human-readable array.
 * Uses the QTI library parser, then extracts a clean view.
 */
function qti_summarize_item_xml(string $itemXmlPath, \Qti3\QtiClient $client): array
{
    $dom = new DOMDocument();
    if (!$dom->load($itemXmlPath)) {
        throw new RuntimeException("Failed to load item XML: $itemXmlPath");
    }

    // Parse the assessment
    $parser = $client->getAssessmentItemParser();
    $itemModel = $parser->parse($dom);

    // Qti3\AssessmentItem\Model\AssessmentItem :contentReference[oaicite:3]{index=3}

    // Extracted from dom for readability but should probably be replaced with model getters eventually
    //TODO: Replace with model getters?
    $xp = new DOMXPath($dom);

    // Detect interaction type (first interaction in itemBody)
    $interactionType = null;
    $itemBodyNodes = $xp->query('//*[local-name()="itemBody" or local-name()="item-body"]//*');
    foreach ($itemBodyNodes as $n) {
        if (!($n instanceof DOMElement)) continue;
        $ln = $n->localName ?? '';
        if ($ln && preg_match('/Interaction$/', $ln)) {
            $interactionType = $ln;
            break;
        }
    }

    $summary = [
        'path' => $itemXmlPath,
        'interaction_type' => $interactionType,
        'prompt' => null,
        'media' => [],
        'choices' => [],
    ];

    // Media references (limited for now): images + objects with data/src
    foreach ($xp->query('//*[local-name()="img"][@src]') as $img) {
        /** @var DOMElement $img */
        $summary['media'][] = ['type' => 'img', 'src' => $img->getAttribute('src')];
    }

    // MCQ extraction if choiceInteraction
    $choice = $xp->query('//*[local-name()="choiceInteraction" or local-name()="choice-interaction"]')->item(0);
    if ($choice instanceof DOMElement) {
        $promptNode = $xp->query('.//*[local-name()="prompt"]', $choice)->item(0);
        $summary['prompt'] = $promptNode ? trim($promptNode->textContent) : null;

        $responseId = $choice->getAttribute('responseIdentifier') ?: null;

        // choices
        $choices = [];
        foreach ($xp->query('.//*[local-name()="simpleChoice" or local-name()="simple-choice"]', $choice) as $c) {
            /** @var DOMElement $c */
            $id = $c->getAttribute('identifier');
            $choices[$id] = trim($c->textContent);
        }

        // correct ids
        $valueNodes = $responseId
            ? $xp->query('//*[local-name()="responseDeclaration" and @identifier="'.$responseId.'"]//*[local-name()="correctResponse"]//*[local-name()="value"]')
            : $xp->query('//*[local-name()="responseDeclaration"]//*[local-name()="correctResponse"]//*[local-name()="value"]');

        $correctIds = [];
        foreach ($valueNodes as $v) $correctIds[] = trim($v->textContent);
        $correctIds = array_values(array_unique(array_filter($correctIds)));

        // build choice list with correctness
        foreach ($choices as $id => $text) {
            $summary['choices'][] = [
                'id' => $id,
                'text' => $text,
                'correct' => in_array($id, $correctIds, true),
            ];
        }

        $summary['mcq'] = [
            'choice_count' => count($choices),
            'correct_count' => count($correctIds),
            'mode' => (count($correctIds) > 1) ? 'multiple' : 'single',
        ];
    }

    return $summary;
}


//Return absolute paths to all QTI item XML files found in imsmanifest.xml to avoid guessing filenames
function qti_list_item_xml_paths_from_manifest(string $extractPath): array
{
    $manifestPath = rtrim($extractPath, "/") . "/imsmanifest.xml";
    if (!file_exists($manifestPath)) {
        throw new Exception("imsmanifest.xml missing at: " . $manifestPath);
    }

    $doc = new DOMDocument();
    $doc->preserveWhiteSpace = false;
    $doc->load($manifestPath);

    $xp = new DOMXPath($doc);

    // NOTE: manifests are namespaced; use local-name() to be namespace-agnostic
    // We pick resources that "look like" QTI item resources.
    //
    // Many QTI packages use one of these patterns:
    //  - @type contains "imsqti_item"
    //  - href ends with ".xml"
    //  - resource contains a <file href="...item.xml" />
    //
    // We take all <resource> that has a <file href="*.xml"> and dedupe if needed.
    $fileNodes = $xp->query('//*[local-name()="resource"]/*[local-name()="file"][@href]');

    $paths = [];
    foreach ($fileNodes as $fileNode) {
        /** @var DOMElement $fileNode */
        $href = $fileNode->getAttribute("href");
        if ($href === '') continue;

        // Keep only xml files (common for items, tests, etc.)
        if (!preg_match('/\.xml$/i', $href)) continue;

        // Resolve relative to extract root
        $candidate = rtrim($extractPath, "/") . "/" . ltrim($href, "/");

        // Normalize simple ../ etc (best-effort)
        $candidate = str_replace(["\\", "//"], ["/", "/"], $candidate);

        if (file_exists($candidate) && is_file($candidate)) {
            $paths[] = $candidate;
        }
    }

    // Dedupe + stable ordering
    $paths = array_values(array_unique($paths));
    sort($paths);

    return $paths;
}

/**
 * Detect the primary interaction type in an assessmentItem.
 * Returns strings like:
 *  - "choiceInteraction"
 *  - "textEntryInteraction"
 *  - "hottextInteraction"
 * or null if none found.
 *
 */
function qti_detect_interaction_type(DOMDocument $doc): ?string
{
    $xp = new DOMXPath($doc);

    // Look inside itemBody for any element whose local-name ends with "Interaction"
    // or "-interaction" (hyphenated variants).
    $nodes = $xp->query('//*[local-name()="itemBody" or local-name()="item-body"]//*[matches(local-name(), "Interaction$") or contains(local-name(), "-interaction")]');

    // DOMXPath in PHP does NOT support matches() in XPath 1.0 apparently
    // so we do a simpler query + filter in PHP:
    $nodes = $xp->query('//*[local-name()="itemBody" or local-name()="item-body"]//*');

    foreach ($nodes as $n) {
        /** @var DOMElement $n */
        if (!($n instanceof DOMElement)) continue;
        $ln = $n->localName ?? '';
        if ($ln === '') continue;

        // Common interaction element names in QTI:
        // choiceInteraction, textEntryInteraction, extendedTextInteraction, matchInteraction, orderInteraction, hotspotInteraction...
        if (preg_match('/Interaction$/', $ln)) {
            return $ln;
        }

        // Hyphenated (depending on upstream serialization)
        if (strpos($ln, '-interaction') !== false) {
            return $ln;
        }
    }

    return null;
}

function qti_zip_to_objects_and_plan(string $zipPath, string $extractPath, string $workDir): array
{
    // Basic structure check -- require imsmanifest.xml somewhere near root
    // TODO: Adjust this to be more robust, depending on structure of received QTI packages?
    $manifest = rtrim($extractPath, "/") . "/imsmanifest.xml";
    if (!file_exists($manifest)) {
        // Some packages may not use imsmanifest.xml, though that's out of scope for now
        throw new Exception("QTI structure check failed: imsmanifest.xml missing");
    }

    // Parse zip to package object
    $package = qti_read_package_from_zip($zipPath, $workDir);

    // Build test from package
    $client = qti_get_client($workDir);
    $test = $client->getTestBuilder()->buildFromPackage($package);

    $summary = [
        'manifest' => 'imsmanifest.xml',
        'parsed' => true,
        'test_built' => true,
    ];

    // Mapping stub for later
    $mapping = [
        'pages' => [],
        'media' => [],
        'notes' => 'Mapping not implemented yet',
    ];

    return [
        'package' => $package,
        'test' => $test,
        'summary' => $summary,
        'mapping' => $mapping,
    ];
}

function qti_extract_mcq_from_item_dom(DOMDocument $doc): array
{
    $xp = new DOMXPath($doc);

    // Find choiceInteraction(s)
    $choiceInteractions = $xp->query('//*[local-name()="choiceInteraction" or local-name()="choice-interaction"]');
    if ($choiceInteractions->length === 0) {
        return ['is_mcq' => false];
    }

    /** @var DOMElement $ci */
    $ci = $choiceInteractions->item(0);

    // Prompt text
    $promptNode = $xp->query('.//*[local-name()="prompt"]', $ci)->item(0);
    $prompt = $promptNode ? trim($promptNode->textContent) : '';

    // If no prompt, take a best-effort question text from itemBody (excluding choices)
    if ($prompt === '') {
        $itemBody = $xp->query('//*[local-name()="itemBody" or local-name()="item-body"]')->item(0);
        $prompt = $itemBody ? trim($itemBody->textContent) : '';
    }

    // Determine single vs multiple response (maxChoices is common)
    $maxChoices = $ci->hasAttribute('maxChoices') ? (int)$ci->getAttribute('maxChoices') : 1;
    $mcq_mode = ($maxChoices > 1) ? 'multiple' : 'single';

    // Choices
    $choiceNodes = $xp->query('.//*[local-name()="simpleChoice" or local-name()="simple-choice"]', $ci);
    $choices = [];
    foreach ($choiceNodes as $n) {
        /** @var DOMElement $n */
        $id = $n->getAttribute('identifier');
        $choices[$id] = trim($n->textContent);
    }

    // Response identifier (often responseIdentifier="RESPONSE")
    $responseId = $ci->hasAttribute('responseIdentifier') ? $ci->getAttribute('responseIdentifier') : null;

    // Correct responses: responseDeclaration/correctResponse/value
    if ($responseId) {
        $valueNodes = $xp->query(
            '//*[local-name()="responseDeclaration" and @identifier="'.$responseId.'"]' .
            '//*[local-name()="correctResponse"]//*[local-name()="value"]'
        );
    } else {
        $valueNodes = $xp->query('//*[local-name()="responseDeclaration"]//*[local-name()="correctResponse"]//*[local-name()="value"]');
    }

    $correctIds = [];
    foreach ($valueNodes as $vn) {
        $correctIds[] = trim($vn->textContent);
    }
    $correctIds = array_values(array_unique(array_filter($correctIds)));

    // Build correct/incorrect lists (id + text)
    $correctChoices = [];
    $incorrectChoices = [];

    foreach ($choices as $id => $text) {
        if (in_array($id, $correctIds, true)) {
            $correctChoices[] = ['id' => $id, 'text' => $text];
        } else {
            $incorrectChoices[] = ['id' => $id, 'text' => $text];
        }
    }

    return [
        'is_mcq' => true,
        'interaction' => 'choiceInteraction',
        'mode' => $mcq_mode, // 'single' or 'multiple'
        'prompt' => $prompt,

        'choice_count' => count($choices),
        'choices' => array_map(fn($id, $text) => ['id' => $id, 'text' => $text], array_keys($choices), $choices),

        'correct_ids' => $correctIds,
        'correct_count' => count($correctChoices),
        'correct_choices' => $correctChoices,

        'incorrect_count' => count($incorrectChoices),
        'incorrect_choices' => $incorrectChoices,
    ];
}

function qti_build_human_structure_mcq_only(object $qtiTest, string $extract_path): array
{
    $refs = qti_test_ordered_item_refs($qtiTest); // the working reflection function

    $pages = [];
    foreach ($refs as $ref) {
        $abs = rtrim($extract_path, '/') . '/' . ltrim($ref['href'], '/');

        $pages[] = [
            'id'   => $ref['id'],
            'href' => $ref['href'],
            'item' => qti_extract_choice_interaction_from_item($abs),
        ];
    }

    return [
        'page_count' => count($pages),
        'pages' => $pages,
    ];
}

function qti_extract_choice_interaction_from_item(string $absItemPath): array
{
    $dom = new DOMDocument();
    if (!$dom->load($absItemPath)) {
        return ['path' => $absItemPath, 'error' => 'Failed to load XML'];
    }
    $xp = new DOMXPath($dom);

    $root = $dom->documentElement; // <qti-assessment-item>
    $itemTitle = ($root instanceof DOMElement) ? trim($root->getAttribute('title')) : '';
    $itemIdent = ($root instanceof DOMElement) ? trim($root->getAttribute('identifier')) : '';

    // Helper: extract media nodes under a context node
    $extractMedia = function (?DOMNode $ctx) use ($xp, $absItemPath): array {
        if (!$ctx) return [];

        $media = [];

        // <img src="...">
        foreach ($xp->query('.//*[local-name()="img"][@src]', $ctx) as $img) {
            /** @var DOMElement $img */
            $src = $img->getAttribute('src');
            $media[] = [
                'type' => 'img',
                'src'  => $src,
                'abs'  => rtrim(dirname($absItemPath), '/\\') . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $src),
            ];
        }

        // If needed  in the future we can add similar blocks for <audio>, <video>, <object>, etc.
        return $media;
    };

    // Item-level media: everything in item body
    $itemBody = $xp->query('//*[local-name()="qti-item-body" or local-name()="itemBody" or local-name()="item-body"]')->item(0);

    // Find qti-choice-interaction (QTI 3.0) or camelCase fallback
    $ci = $xp->query('//*[local-name()="qti-choice-interaction" or local-name()="choiceInteraction"]')->item(0);
    if (!($ci instanceof DOMElement)) {
        $names = [];
        foreach ($xp->query('//*[contains(local-name(), "interaction")]') as $n) {
            if ($n instanceof DOMElement) $names[] = $n->localName;
        }
        $names = array_values(array_unique($names));

        return [
            'path' => $absItemPath,
            'interaction' => $names[0] ?? null,
            'note' => 'Not a choice interaction',
            'found' => $names,
            'media' => $extractMedia($itemBody),
        ];
    }

    // Prompt text + prompt media
    $promptNode = $xp->query('.//*[local-name()="qti-prompt" or local-name()="prompt"]', $ci)->item(0);
    $prompt = $promptNode ? qti_prompt_to_xerte_html($promptNode) : null;
    $promptMedia = $extractMedia($promptNode);

    // Choices
    $choiceNodes = $xp->query('.//*[local-name()="qti-simple-choice" or local-name()="simpleChoice"]', $ci);
    $choices = [];
    foreach ($choiceNodes as $c) {
        /** @var DOMElement $c */
        $id = $c->getAttribute('identifier');
        $choices[$id] = [
            'text' => trim($c->textContent),
            'media' => $extractMedia($c),
        ];
    }

    // Correct ids (Nominally for QTI 3.0 but has QTI 2.0 fallback too)
    $responseId = $ci->getAttribute('responseIdentifier') ?: $ci->getAttribute('response-identifier') ?: null;

    if ($responseId) {
        $valueNodes = $xp->query(
            '//*[local-name()="qti-response-declaration" or local-name()="responseDeclaration"][@identifier="'.$responseId.'"]' .
            '//*[local-name()="qti-correct-response" or local-name()="correctResponse" or local-name()="correct-response"]' .
            '//*[local-name()="qti-value" or local-name()="value"]'
        );
    } else {
        $valueNodes = $xp->query(
            '//*[local-name()="qti-response-declaration" or local-name()="responseDeclaration"]' .
            '//*[local-name()="qti-correct-response" or local-name()="correctResponse" or local-name()="correct-response"]' .
            '//*[local-name()="qti-value" or local-name()="value"]'
        );
    }

    $correctIds = [];
    foreach ($valueNodes as $v) $correctIds[] = trim($v->textContent);
    $correctIds = array_values(array_unique(array_filter($correctIds)));

    $outChoices = [];
    foreach ($choices as $id => $payload) {
        if ($id === '') continue;
        $outChoices[] = [
            'id' => $id,
            'text' => $payload['text'],
            'correct' => in_array($id, $correctIds, true),
            'media' => $payload['media'],
        ];
    }

    // Item media = media in item body, plus prompt media
    $itemMedia = array_merge($extractMedia($itemBody), $promptMedia);
    // simple dedupe by type+src
    $seen = [];
    $dedup = [];
    foreach ($itemMedia as $m) {
        $k = ($m['type'] ?? '') . '|' . ($m['src'] ?? '');
        if (!isset($seen[$k])) { $seen[$k] = true; $dedup[] = $m; }
    }

    return [
        'path' => $absItemPath,
        'interaction' => 'qti-choice-interaction',
        'prompt' => $prompt,
        'media' => $dedup,
        'choices' => $outChoices,
        'mode' => (count($correctIds) > 1) ? 'multiple' : 'single',
        'item_title' => $itemTitle,
        'item_identifier' => $itemIdent,
    ];
}

function qti_node_text_with_linebreaks(?DOMNode $node): string
{
    if (!$node) return '';

    $out = '';

    foreach ($node->childNodes as $child) {
        if ($child->nodeType === XML_TEXT_NODE || $child->nodeType === XML_CDATA_SECTION_NODE) {
            $out .= $child->nodeValue;
            continue;
        }

        if ($child instanceof DOMElement) {
            $ln = strtolower($child->localName ?? '');

            // Treat <br/> (and variants) as newline
            if ($ln === 'br') {
                $out .= "\n";
                continue;
            }

            // Recurse into elements like <strong>, <em>, etc.
            $out .= qti_node_text_with_linebreaks($child);
        }
    }

    // Normalize whitespace a bit
    $out = str_replace("\r\n", "\n", $out);
    $out = preg_replace("/[ \t]+/", " ", $out);      // collapse spaces
    $out = preg_replace("/\n{3,}/", "\n\n", $out);   // collapse excessive blank lines
    return trim($out);
}

function qti_prompt_to_xerte_html(?DOMNode $promptNode): string
{
    if (!$promptNode) return '';

    // Extract text with \n where <br/> exists
    $text = qti_node_text_with_linebreaks($promptNode);

    // Split into lines
    $lines = preg_split("/\n/", $text);

    // Trim end spaces on each line, but DO NOT remove NBSP characters
    $lines = array_map(function ($l) {
        // trim normal whitespace but keep NBSP (\xC2\xA0) intact by temporarily protecting it
        $l = str_replace("\xC2\xA0", "__NBSP__", $l);
        $l = trim($l);
        return str_replace("__NBSP__", "\xC2\xA0", $l);
    }, $lines);

    // Drop leading/trailing empty lines
    while (count($lines) > 0 && $lines[0] === '') array_shift($lines);
    while (count($lines) > 0 && $lines[count($lines)-1] === '') array_pop($lines);

    // Build <p> ... </p> with <br /> between lines.
    // IMPORTANT: escape only the visible text, but do not turn NBSP into "&nbsp;".
    $html = '<p>';
    for ($i = 0; $i < count($lines); $i++) {
        if ($i > 0) {
            $html .= '<br />' . "\n";
        }

        $line = $lines[$i];

        // If the line is empty, keep it empty: Xerte will render it as a blank line because of <br />
        if ($line === '') {
            continue;
        }

        // Escape HTML special chars in the text. This will keep the NBSP character as-is.
        $html .= htmlspecialchars($line, ENT_NOQUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
    $html .= '</p>' . "\n";

    return $html;
}