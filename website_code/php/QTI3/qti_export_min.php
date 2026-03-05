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

    $ns = "http://www.imsglobal.org/xsd/imsqti_assessmenttest_v3p0";
    $xsi = "http://www.w3.org/2001/XMLSchema-instance";

    $root = $doc->createElementNS($ns, 'qti-assessment-test');
    $root->setAttribute('identifier', 'TEST1');
    $root->setAttribute('title', $title);
    $root->setAttribute('xml:lang', $lang);
    $root->setAttributeNS('http://www.w3.org/2000/xmlns/' ,'xmlns:xsi', $xsi);
    $root->setAttributeNS($xsi, 'xsi:schemaLocation',
        $ns . ' https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asst_v3p0_v1p0.xsd'
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
    array $mediaFilenames = []
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
    $ci->setAttribute('max-choices', $isMultiple ? (string)count($choices) : '1');

    $prompt = $doc->createElement('qti-prompt');

    // promptHtml might include entities like &#xA0; etc. We handle this with the append func.
    // Insert as text first, then add images as separate <img> nodes.
    //$prompt->appendChild($doc->createTextNode($promptHtml));

    qti_append_xerte_prompt_html($doc, $prompt, $promptHtml);

    // If there are images, append <img src="resources/FILENAME" />
    foreach ($mediaFilenames as $fn) {
        $img = $doc->createElement('img');
        $img->setAttribute('src', 'resources/' . $fn);
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
    // - for multiple-answer items, we skip processing (still exports correctness via correctResponse)
    if (!$isMultiple) {
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
    }

    $doc->appendChild($root);
    qti_export_write_file($path, $doc->saveXML());
}

function qti_write_imsmanifest(string $path, array $itemIds, array $mediaFiles, string $testHref = 'assessmentTest.xml'): void
{
    $doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = true;

    $ns = "http://www.imsglobal.org/xsd/imscp_v1p1";
    $xsi = "http://www.w3.org/2001/XMLSchema-instance";

    $root = $doc->createElementNS($ns, 'manifest');
    $root->setAttribute('identifier', 'MANIFEST1');
    $root->setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xsi', $xsi);
    $root->setAttributeNS($xsi, 'xsi:schemaLocation',
        $ns . ' http://www.imsglobal.org/xsd/imscp_v1p1.xsd'
    );

    $orgs = $doc->createElement('organizations');
    $orgs->setAttribute('default', 'ORG1');
    $org = $doc->createElement('organization');
    $org->setAttribute('identifier', 'ORG1');

    $item = $doc->createElement('item');
    $item->setAttribute('identifier', 'TEST_ITEM');
    $item->setAttribute('identifierref', 'RES_TEST');
    $title = $doc->createElement('title', 'Exported Test');

    $item->appendChild($title);
    $org->appendChild($item);
    $orgs->appendChild($org);
    $root->appendChild($orgs);

    $resources = $doc->createElement('resources');

    // Test resource
    $resTest = $doc->createElement('resource');
    $resTest->setAttribute('identifier', 'RES_TEST');
    $resTest->setAttribute('type', 'imsqti_test_xmlv3p0');
    $resTest->setAttribute('href', $testHref);
    $resTest->appendChild($doc->createElement('file'))->setAttribute('href', $testHref);
    $resources->appendChild($resTest);

    // Item resources
    foreach ($itemIds as $id) {
        $href = $id . '.xml';
        $res = $doc->createElement('resource');
        $res->setAttribute('identifier', 'RES_' . $id);
        $res->setAttribute('type', 'imsqti_item_xmlv3p0');
        $res->setAttribute('href', $href);

        $file = $doc->createElement('file');
        $file->setAttribute('href', $href);
        $res->appendChild($file);

        $resources->appendChild($res);
    }

    // Media resource (simple: one bucket)
    if (count($mediaFiles) > 0) {
        $resMedia = $doc->createElement('resource');
        $resMedia->setAttribute('identifier', 'RES_MEDIA');
        $resMedia->setAttribute('type', 'webcontent');

        foreach ($mediaFiles as $fn) {
            $file = $doc->createElement('file');
            $file->setAttribute('href', 'resources/' . $fn);
            $resMedia->appendChild($file);
        }

        $resources->appendChild($resMedia);
    }

    $root->appendChild($resources);
    $doc->appendChild($root);

    qti_export_write_file($path, $doc->saveXML());
}

/**
 * One-call export: Xerte LO -> QTI zip (MCQ-only)
 *
 * @param string $dataXmlPath path to Xerte data.xml
 * @param string $loMediaDir  path to the Xerte LO "media" folder
 * @param string $outZipPath  where to write the QTI zip
 * @param string $workDir     temp folder to build package (will be created)
 */
function export_xerte_lo_to_qti_zip_mcq_only(
    string $dataXmlPath,
    string $loMediaDir,
    string $outZipPath,
    string $workDir,
    string $title = 'Exported Test',
    string $lang = 'en'
): void {
    qti_export_mkdir($workDir);
    qti_export_mkdir($workDir . DIRECTORY_SEPARATOR . 'resources');

    $mcqs = xerte_read_mcqs_from_data_xml($dataXmlPath);

    $itemIds = [];
    $allMedia = [];

    $i = 1;
    foreach ($mcqs as $mcq) {
        $itemId = sprintf('ITEM%03d', $i++);
        $itemIds[] = $itemId;

        // Build choices + correct ids
        $choices = [];
        $correctIds = [];
        $n = 1;
        foreach ($mcq['choices'] as $opt) {
            $cid = 'CHOICE' . $n++;
            $choices[] = ['id' => $cid, 'text' => (string)$opt['text']];
            if (!empty($opt['correct'])) $correctIds[] = $cid;
        }

        // Media: copy LO/media/FN into package/resources/FN
        $mediaFiles = $mcq['media'] ?? [];
        if (is_array($mediaFiles)) {
            foreach ($mediaFiles as $fn) {
                $fn = basename(str_replace('\\', '/', (string)$fn));
                if ($fn === '') continue;

                $src = rtrim($loMediaDir, "/\\") . DIRECTORY_SEPARATOR . $fn;
                $dst = $workDir . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . $fn;

                if (is_file($src) && !is_file($dst)) {
                    if (!copy($src, $dst)) {
                        throw new RuntimeException("Failed copying media: $src -> $dst");
                    }
                }
                $allMedia[$fn] = true;
            }
        }

        // Write item
        qti_write_item_mcq(
            $workDir . DIRECTORY_SEPARATOR . $itemId . '.xml',
            $itemId,
            (string)($mcq['prompt_html'] ?? ''),
            $choices,
            $correctIds,
            $lang,
            is_array($mediaFiles) ? $mediaFiles : []
        );
    }

    // Write test + manifest
    qti_write_assessment_test($workDir . DIRECTORY_SEPARATOR . 'assessmentTest.xml', $itemIds, $title, $lang);
    qti_write_imsmanifest($workDir . DIRECTORY_SEPARATOR . 'imsmanifest.xml', $itemIds, array_keys($allMedia), 'assessmentTest.xml');

    // Zip
    qti_export_zip_folder($workDir, $outZipPath);
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