<?php
declare(strict_types=1);

function qti_export_mkdir(string $path): void
{
    if (!is_dir($path) && !mkdir($path, 0775, true)) {
        throw new RuntimeException("Failed to create dir: $path");
    }
}

function qti_export_write_file(string $path, string $contents): void
{
    if (file_put_contents($path, $contents) === false) {
        throw new RuntimeException("Failed to write file: $path");
    }
}


function qti_export_zip_folder(string $sourceDir, string $zipPath): void
{
    $sourceDir = rtrim($sourceDir, "/\\");
    $zip = new ZipArchive();
    if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
        throw new RuntimeException("Failed to open zip for writing: $zipPath");
    }

    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($sourceDir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($it as $file) {
        /** @var SplFileInfo $file */
        $abs = $file->getPathname();
        $rel = substr($abs, strlen($sourceDir) + 1);
        $rel = str_replace('\\', '/', $rel);

        if ($file->isDir()) {
            $zip->addEmptyDir($rel);
        } else {
            $zip->addFile($abs, $rel);
        }
    }

    $zip->close();
}

/**
 * Extract media filenames from Xerte 'instruction' attribute:
 * looks for "media/FILENAME.ext" inside the instruction string.
 *
 * Works whether instruction is raw HTML or escaped HTML.
 */
function xerte_instruction_media_filenames(string $instruction): array
{
    $out = [];

    // instruction may contain &quot; etc.; decode first to simplify
    $decoded = html_entity_decode($instruction, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    // capture media/<filename>
    if (preg_match_all('~media/([^"\'>\s]+)~', $decoded, $m)) {
        foreach ($m[1] as $fn) {
            $fn = basename(str_replace('\\', '/', $fn));
            if ($fn !== '') $out[$fn] = true;
        }
    }

    return array_keys($out);
}

/**
 * Xerte -> internal MCQ model
 *
 * Reads data.xml and returns MCQs in order.
 */
function xerte_read_mcqs_from_data_xml(string $dataXmlPath): array
{
    $doc = new DOMDocument();
    $doc->preserveWhiteSpace = false;
    if (!$doc->load($dataXmlPath)) {
        throw new RuntimeException("Failed to load Xerte data.xml: $dataXmlPath");
    }
    $xp = new DOMXPath($doc);

    $mcqs = [];
    foreach ($xp->query('//*[local-name()="mcq"]') as $mcqNode) {
        /** @var DOMElement $mcqNode */
        $prompt = $mcqNode->getAttribute('prompt');
        $instruction = $mcqNode->getAttribute('instruction');
        $mediaFiles = xerte_instruction_media_filenames($instruction);

        $choices = [];
        foreach ($xp->query('./*[local-name()="option"]', $mcqNode) as $optNode) {
            /** @var DOMElement $optNode */
            $choices[] = [
                'text' => $optNode->getAttribute('text'),
                'correct' => strtolower($optNode->getAttribute('correct')) === 'true',
            ];
        }

        // Keep prompt as HTML-ish text if it already contains entities
        $mcqs[] = [
            'prompt_html' => $prompt,
            'choices' => $choices,
            'media' => $mediaFiles,
        ];
    }

    return $mcqs;
}

/**
 * Rather minimal QTI xml writers, based solely on provided QTI examples
 */

function qti_write_assessment_test(string $path, array $itemIds, string $title = 'Exported Test', string $lang = 'en'): void
{
    $doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = true;

    $ns = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";
    $xsi = "http://www.w3.org/2001/XMLSchema-instance";

    $root = $doc->createElementNS($ns, 'qti-assessment-test');
    $root->setAttribute('identifier', 'TEST1');
    $root->setAttribute('title', $title);
    $root->setAttribute('xml:lang', $lang);
    $root->setAttributeNS('http://www.w3.org/2000/xmlns/' ,'xmlns:xsi', $xsi);
    $root->setAttributeNS($xsi, 'xsi:schemaLocation',
        $ns . ' https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd'
    );

    // Minimal SCORE/MAXSCORE declarations which are nominally optional but common enough
    $score = $doc->createElement('qti-outcome-declaration');
    $score->setAttribute('identifier', 'SCORE');
    $score->setAttribute('cardinality', 'single');
    $score->setAttribute('base-type', 'float');
    $dv = $doc->createElement('qti-default-value');
    $dv->appendChild($doc->createElement('qti-value', '0'));
    $score->appendChild($dv);

    $max = $doc->createElement('qti-outcome-declaration');
    $max->setAttribute('identifier', 'MAXSCORE');
    $max->setAttribute('cardinality', 'single');
    $max->setAttribute('base-type', 'float');
    $dv2 = $doc->createElement('qti-default-value');
    $dv2->appendChild($doc->createElement('qti-value', '0'));
    $max->appendChild($dv2);

    $root->appendChild($score);
    $root->appendChild($max);

    $testPart = $doc->createElement('qti-test-part');
    $testPart->setAttribute('identifier', 'TEST-PART');
    $testPart->setAttribute('navigation-mode', 'linear');
    $testPart->setAttribute('submission-mode', 'individual');

    $section = $doc->createElement('qti-assessment-section');
    $section->setAttribute('identifier', 'SECTION');
    $section->setAttribute('title', 'Section');
    $section->setAttribute('visible', 'true');

    foreach ($itemIds as $id) {
        $ref = $doc->createElement('qti-assessment-item-ref');
        $ref->setAttribute('identifier', $id);
        $ref->setAttribute('href', $id . '.xml');
        $section->appendChild($ref);
    }

    $testPart->appendChild($section);
    $root->appendChild($testPart);
    $doc->appendChild($root);

    qti_export_write_file($path, $doc->saveXML());
}

function qti_write_item_mcq(
    string $path,
    string $itemId,
    string $promptHtml,
    array $choices,
    array $correctIds,
    string $lang = 'en',
    //array $mediaFilenames = []
    array $itemMediaSourcePaths = []
): void {
    $doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = true;

    $ns = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";
    $xsi = "http://www.w3.org/2001/XMLSchema-instance";

    $root = $doc->createElementNS($ns, 'qti-assessment-item');
    $root->setAttribute('identifier', $itemId);
    $root->setAttribute('title', $itemId);
    $root->setAttribute('adaptive', 'false');
    $root->setAttribute('time-dependent', 'false');
    $root->setAttribute('xml:lang', $lang);
    $root->setAttributeNS('http://www.w3.org/2000/xmlns/' ,'xmlns:xsi', $xsi);
    $root->setAttributeNS($xsi, 'xsi:schemaLocation',
        $ns . ' https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd'
    );

    $isMultiple = count($correctIds) > 1;

    // response declaration
    $rd = $doc->createElement('qti-response-declaration');
    $rd->setAttribute('identifier', 'RESPONSE');
    $rd->setAttribute('cardinality', $isMultiple ? 'multiple' : 'single');
    $rd->setAttribute('base-type', 'identifier');

    $cr = $doc->createElement('qti-correct-response');
    foreach ($correctIds as $cid) {
        $cr->appendChild($doc->createElement('qti-value', $cid));
    }
    $rd->appendChild($cr);
    $root->appendChild($rd);

    // outcome declarations (minimal)
    $score = $doc->createElement('qti-outcome-declaration');
    $score->setAttribute('identifier', 'SCORE');
    $score->setAttribute('base-type', 'float');
    $score->setAttribute('cardinality', 'single');
    $score->setAttribute('normal-maximum', '1.0');
    $dv = $doc->createElement('qti-default-value');
    $dv->appendChild($doc->createElement('qti-value', '0'));
    $score->appendChild($dv);
    $root->appendChild($score);

    $max = $doc->createElement('qti-outcome-declaration');
    $max->setAttribute('identifier', 'MAXSCORE');
    $max->setAttribute('base-type', 'float');
    $max->setAttribute('cardinality', 'single');
    $dv2 = $doc->createElement('qti-default-value');
    $dv2->appendChild($doc->createElement('qti-value', '1'));
    $max->appendChild($dv2);
    $root->appendChild($max);

    // item body + choice interaction
    $body = $doc->createElement('qti-item-body');

    $ci = $doc->createElement('qti-choice-interaction');
    $ci->setAttribute('response-identifier', 'RESPONSE');
    $ci->setAttribute('shuffle', 'false');
    $maxChoices = $isMultiple ? max(1, count($correctIds)) : 1;
    $ci->setAttribute('max-choices', (string)$maxChoices);

    $prompt = $doc->createElement('qti-prompt');

    // promptHtml might include entities like &#xA0; etc. We handle this with the append func.
    // Insert as text first, then add images as separate <img> nodes.

    qti_append_xerte_prompt_html($doc, $prompt, $promptHtml);

    // If there are images, append <img src="resources/FILENAME" />
    //foreach ($mediaFilenames as $fn) {
    foreach ($itemMediaSourcePaths as $srcPath) {
        $img = $doc->createElement('img');
        //$img->setAttribute('src', 'resources/' . $fn);
        $img->setAttribute('src', $srcPath);
        $img->setAttribute('alt', '');
        $prompt->appendChild($doc->createTextNode(' '));
        $prompt->appendChild($img);
    }

    $ci->appendChild($prompt);

    // choices
    foreach ($choices as $choice) {
        $sc = $doc->createElement('qti-simple-choice');
        $sc->setAttribute('identifier', $choice['id']);
        $sc->appendChild($doc->createTextNode((string)$choice['text']));
        $ci->appendChild($sc);
    }

    $body->appendChild($ci);
    $root->appendChild($body);

    // response processing:
    // - include the simple "match correct" processing for single-answer items
    // - for multiple-answer items, we skip processing (still exports correctness via correctResponse) //TODO: skipping this for now
    //if (!$isMultiple) {
        $rp = $doc->createElement('qti-response-processing');
        $cond = $doc->createElement('qti-response-condition');

        $rif = $doc->createElement('qti-response-if');
        $match = $doc->createElement('qti-match');
        $var = $doc->createElement('qti-variable');
        $var->setAttribute('identifier', 'RESPONSE');
        $cor = $doc->createElement('qti-correct');
        $cor->setAttribute('identifier', 'RESPONSE');
        $match->appendChild($var);
        $match->appendChild($cor);
        $rif->appendChild($match);

        $set1 = $doc->createElement('qti-set-outcome-value');
        $set1->setAttribute('identifier', 'SCORE');
        $bv1 = $doc->createElement('qti-base-value', '1');
        $bv1->setAttribute('base-type', 'float');
        $set1->appendChild($bv1);
        $rif->appendChild($set1);

        $rel = $doc->createElement('qti-response-else');
        $set0 = $doc->createElement('qti-set-outcome-value');
        $set0->setAttribute('identifier', 'SCORE');
        $bv0 = $doc->createElement('qti-base-value', '0');
        $bv0->setAttribute('base-type', 'float');
        $set0->appendChild($bv0);
        $rel->appendChild($set0);

        $cond->appendChild($rif);
        $cond->appendChild($rel);
        $rp->appendChild($cond);
        $root->appendChild($rp);
    //}

    $doc->appendChild($root);
    qti_export_write_file($path, $doc->saveXML());
}

function qti_write_imsmanifest(
    string $path,
    array $itemIds,
    array $itemMediaMap,
    string $testHref = 'assessmentTest.xml'
): void {
    $doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = true;

    $ns  = 'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1';
    $xsi = 'http://www.w3.org/2001/XMLSchema-instance';

    $root = $doc->createElementNS($ns, 'manifest');
    $root->setAttribute('identifier', 'MANIFEST1');
    $root->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xsi', $xsi);
    $root->setAttributeNS(
        $xsi,
        'xsi:schemaLocation',
        'https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd ' .
        'https://purl.imsglobal.org/spec/md/v1p3/schema/xsd/imsmd_loose_v1p3p2.xsd ' .
        $ns . ' ' .
        'https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqtiv3p0_imscpv1p2_v1p0.xsd'
    );

    $metadata = $doc->createElement('metadata');
    $metadata->appendChild($doc->createElement('schema', 'QTI Package'));
    $metadata->appendChild($doc->createElement('schemaversion', '3.0.0'));
    $root->appendChild($metadata);

    $root->appendChild($doc->createElement('organizations'));

    $resources = $doc->createElement('resources');

    // assign RESOURCE001, RESOURCE002, ... per distinct media file
    $mediaResourceIds = [];
    $mediaCounter = 1;

    foreach ($itemMediaMap as $itemId => $mediaFiles) {
        foreach ($mediaFiles as $fn) {
            if (!isset($mediaResourceIds[$fn])) {
                $mediaResourceIds[$fn] = 'RESOURCE' . str_pad((string)$mediaCounter, 3, '0', STR_PAD_LEFT);
                $mediaCounter++;
            }
        }
    }

    // TEST resource
    $resTest = $doc->createElement('resource');
    $resTest->setAttribute('identifier', 'TEST');
    $resTest->setAttribute('type', 'imsqti_test_xmlv3p0');
    $resTest->setAttribute('href', $testHref);
    $resTest->appendChild($doc->createElement('metadata'));

    $file = $doc->createElement('file');
    $file->setAttribute('href', $testHref);
    $resTest->appendChild($file);

    foreach ($itemIds as $itemId) {
        $dep = $doc->createElement('dependency');
        $dep->setAttribute('identifierref', $itemId);
        $resTest->appendChild($dep);
    }

    $resources->appendChild($resTest);

    // item resources
    foreach ($itemIds as $itemId) {
        $href = $itemId . '.xml';

        $res = $doc->createElement('resource');
        $res->setAttribute('identifier', $itemId);
        $res->setAttribute('type', 'imsqti_item_xmlv3p0');
        $res->setAttribute('href', $href);
        $res->appendChild($doc->createElement('metadata'));

        $file = $doc->createElement('file');
        $file->setAttribute('href', $href);
        $res->appendChild($file);

        foreach (($itemMediaMap[$itemId] ?? []) as $fn) {
            $dep = $doc->createElement('dependency');
            $dep->setAttribute('identifierref', $mediaResourceIds[$fn]);
            $res->appendChild($dep);
        }

        $resources->appendChild($res);
    }

    // media resources
    foreach ($mediaResourceIds as $fn => $resourceId) {
        $href = 'resources/' . $fn;

        $res = $doc->createElement('resource');
        $res->setAttribute('identifier', $resourceId);
        $res->setAttribute('type', 'webcontent');
        $res->setAttribute('href', $href);
        $res->appendChild($doc->createElement('metadata'));

        $file = $doc->createElement('file');
        $file->setAttribute('href', $href);
        $res->appendChild($file);

        $resources->appendChild($res);
    }

    $root->appendChild($resources);
    $doc->appendChild($root);

    qti_export_write_file($path, $doc->saveXML());
}

function qti_append_xerte_prompt_html(DOMDocument $doc, DOMElement $qtiPrompt, string $xertePromptAttr): void
{
    // Decode attribute (&lt;...&gt;, &#10;, &amp;nbsp;, etc.)
    $html = html_entity_decode($xertePromptAttr, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    // Remove outer <p>...</p> if present
    $html = preg_replace('~^\s*<p>\s*~i', '', $html);
    $html = preg_replace('~\s*</p>\s*$~i', '', $html);

    // IMPORTANT: remove literal newlines from the HTML string.
    // Xerte seems to include &#10; for readability, but <br/> carries the actual meaning and otherwise we're doubling up on newlines
    $html = str_replace(["\r\n", "\r", "\n"], '', $html);

    // Convert <br> variants to a newline token
    $html = preg_replace('~<br\s*/?>~i', "\n", $html);

    // Convert &nbsp; to real NBSP
    $html = str_replace('&nbsp;', "\xC2\xA0", $html);

    // Split into lines and append text + <br/>
    $lines = explode("\n", $html);

    $first = true;
    foreach ($lines as $line) {
        if (!$first) {
            $qtiPrompt->appendChild($doc->createElement('br'));
        }
        $first = false;

        // Strip any remaining tags (minimal)
        $line = strip_tags($line);

        if ($line !== '') {
            $qtiPrompt->appendChild($doc->createTextNode($line));
        }
    }
}

function export_xerte_lo_to_qti_folder_mcq_only(
    string $dataXmlPath,
    string $loMediaDir,
    string $workDir,
    string $title = 'Exported Test',
    string $lang = 'en'
): void {
    qti_export_mkdir($workDir);
    qti_export_mkdir($workDir . DIRECTORY_SEPARATOR . 'resources');

    $mcqs = xerte_read_mcqs_from_data_xml($dataXmlPath);

    $itemIds = [];
    $itemMediaMap = [];
    $itemMediaSourcePaths = [];

    $i = 1;
    foreach ($mcqs as $mcq) {
        $itemId = sprintf('ITEM%03d', $i++);
        $itemIds[] = $itemId;

        // Build choices + correct ids
        $choices = [];
        $correctIds = [];
        $n = 1;

        foreach (($mcq['choices'] ?? []) as $opt) {
            $choiceId = 'CHOICE' . $n++;

            $choices[] = [
                'id'   => $choiceId,
                'text' => (string)($opt['text'] ?? ''),
            ];

            if (!empty($opt['correct'])) {
                $correctIds[] = $choiceId;
            }
        }

        // Media used by this specific item
        $itemMedia = [];
        $mediaFiles = $mcq['media'] ?? [];

        if (is_array($mediaFiles)) {
            foreach ($mediaFiles as $fn) {
                $fn = basename(str_replace('\\', '/', (string)$fn));
                if ($fn === '') {
                    continue;
                }

                $src = rtrim($loMediaDir, "/\\") . DIRECTORY_SEPARATOR . $fn;
                $itemMediaSourcePaths[] = $src;
                $dst = $workDir . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . $fn;

                if (!is_file($src)) {
                    throw new RuntimeException("Referenced media file not found: $src");
                }

                if (!is_file($dst)) {
                    if (!copy($src, $dst)) {
                        throw new RuntimeException("Failed copying media: $src -> $dst");
                    }
                }

                $itemMedia[$fn] = true;
            }
        }

        $itemMediaMap[$itemId] = array_keys($itemMedia);

        // Write item XML
        qti_write_item_mcq(
            $workDir . DIRECTORY_SEPARATOR . $itemId . '.xml',
            $itemId,
            (string)($mcq['prompt_html'] ?? ''),
            $choices,
            $correctIds,
            $lang,
            //$itemMediaMap[$itemId],
            $itemMediaSourcePaths
        );
    }

    // Write test XML
    qti_write_assessment_test(
        $workDir . DIRECTORY_SEPARATOR . 'assessmentTest.xml',
        $itemIds,
        $title,
        $lang
    );

    // Write manifest XML using item -> media dependency map
    qti_write_imsmanifest(
        $workDir . DIRECTORY_SEPARATOR . 'imsmanifest.xml',
        $itemIds,
        $itemMediaMap,
        'assessmentTest.xml'
    );
}