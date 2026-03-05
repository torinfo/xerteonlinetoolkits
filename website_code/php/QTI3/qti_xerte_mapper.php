<?php

declare(strict_types=1);

/**
 * Create a Xerte-style linkID, nominally this should not cause errors since the chance of overlap of IDs is miniscule
 * Xerte examples look like "PG1772094605046".
 */
function xerte_link_id(string $prefix = 'PG'): string
{
    // milliseconds-ish + small random suffix
    $ms = (int)floor(microtime(true) * 1000);
    return $prefix . $ms . random_int(100, 999);
}

/**
 * Xerte stores instruction HTML inside an attribute, with < > " escaped.
 * Your example also includes a trailing newline entity &#10;.
 */
function xerte_encode_instruction_html(string $html): string
{
    $enc = htmlspecialchars($html, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    // Match your sample style: newline as entity
    $enc = str_replace("\n", "&#10;", $enc);
    // Many Xerte exports end with "&#10;" even if only one line
    if (!str_ends_with($enc, "&#10;")) {
        $enc .= "&#10;";
    }
    return $enc;
}

/**
 * Build instruction HTML that displays a single image
 * We put the image into mcq/@instruction; Xerte expects FileLocation concatenation syntax in the attribute.
 */
function xerte_instruction_img(string $filename): string
{
    // match FileLocation + 'media/NAME' pattern
    $src = "FileLocation + 'media/" . $filename . "'";
    return "<p><img alt=\"\" height=\"100%\" src=\"{$src}\" width=\"100%\" /></p>\n";
}

/**
 * Map one of the QTI "page" entries (from $human['pages'][...]) to Xerte <mcq> XML.
 * Returns NULL if page is not a QTI choice interaction.
 */
function qti_page_to_xerte_mcq_xml(array $page): ?string
{
    $item = $page['item'] ?? null;
    if (!is_array($item)) return null;

    if (($item['interaction'] ?? null) !== 'qti-choice-interaction') {
        return null;
    }

    $prompt = trim((string)($item['prompt'] ?? ''));
    $choices = $item['choices'] ?? [];
    if (!is_array($choices) || count($choices) === 0) {
        return null;
    }

    $correctCount = 0;
    foreach ($choices as $c) {
        if (!empty($c['correct'])) $correctCount++;
    }

    $type = ($correctCount > 1) ? 'Multiple Answer' : 'Single Answer';
    $answerType = ($correctCount > 1) ? 'checkbox' : 'radio';

    // Instruction: first item-level image, if present
    $instructionAttr = '';
    $media = $item['media'] ?? [];
    if (is_array($media) && count($media) > 0 && !empty($media[0]['src'])) {
        $src = (string)$media[0]['src'];
        $filename = basename(str_replace('\\', '/', $src));
        $instructionAttr = xerte_instruction_img($filename);
    }

    $doc = new DOMDocument('1.0', 'UTF-8');
    $doc->formatOutput = false;

    $mcq = $doc->createElement('mcq');
    $name = $item['item_title'] ?? '';
    if ($name === '') $name = $page['id'] ?? 'Enter Page Title';

    // --- Required-ish / common attributes ---
    $mcq->setAttribute('linkID', xerte_link_id('PG'));
    $mcq->setAttribute('name', $name);
    $mcq->setAttribute('instruction', $instructionAttr); // empty string is fine
    $mcq->setAttribute('prompt', $prompt);
    $mcq->setAttribute('type', $type);
    $mcq->setAttribute('answerType', $answerType);

    // --- Default UI/behaviour attributes lifte from English XWD ---
    //TODO: Eventually, this should load the XWDs based on the node type and fill them in based on the langauge of the user/LO
    $mcq->setAttribute('panelWidth', 'Medium');
    $mcq->setAttribute('panelWidthCustom', '50');
    $mcq->setAttribute('panelHeight', 'fill');
    $mcq->setAttribute('align', 'Left');
    $mcq->setAttribute('panelStyle', 'false');
    $mcq->setAttribute('removeTxt', 'false');
    $mcq->setAttribute('feedbackLabel', 'Feedback');

    $mcq->setAttribute('singleRight', 'Your answer is correct!');
    $mcq->setAttribute('singleWrong', 'Your answer is incorrect');
    $mcq->setAttribute('multiRight', 'You have selected all the correct answers');
    $mcq->setAttribute('multiWrong', 'You have not selected the correct combination of answers');
    $mcq->setAttribute('checkBtnTxt', 'Check');

    foreach ($choices as $c) {
        $id = trim((string)($c['id'] ?? ''));
        $text = trim((string)($c['text'] ?? ''));
        $correct = !empty($c['correct']) ? 'true' : 'false';

        $opt = $doc->createElement('option');
        $opt->setAttribute('linkID', xerte_link_id('PG'));
        $opt->setAttribute('name', $id !== '' ? $id : 'Answer');
        $opt->setAttribute('text', $text);
        $opt->setAttribute('feedback', '');
        $opt->setAttribute('correct', $correct);

        $mcq->appendChild($opt);
    }

    $doc->appendChild($mcq);
    return $doc->saveXML($mcq);
}

/**
 * Map an entire $human structure into a list of Xerte interaction XML strings.
 */
function qti_human_to_xerte_mcqs(array $human): array
{
    $out = [];
    $pages = $human['pages'] ?? [];
    if (!is_array($pages)) return $out;

    foreach ($pages as $page) {
        $xml = qti_page_to_xerte_mcq_xml($page);
        if ($xml !== null) {
            $out[] = [
                'page_id' => $page['id'] ?? null,
                'xerte_type' => 'mcq',
                'xml' => $xml,
            ];
        }
    }
    return $out;
}