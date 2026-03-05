<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service;

use Qti3\AssessmentItem\Model\Interaction\ExtendedTextInteraction\ExtendedTextInteraction;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;
use DOMDocument;

class AssessmentItemDeterminator
{
    public function determineType(DOMDocument $itemXml): string
    {
        $hasResponseProcessing = false;
        $responseProcessingNodes = $itemXml->getElementsByTagName(ResponseProcessing::qtiTagName());
        foreach ($responseProcessingNodes as $node) {
            if ($node->hasAttributes()) {
                $hasResponseProcessing = true;
                break;
            }
            foreach ($node->childNodes as $child) {
                if ($child->nodeType === XML_ELEMENT_NODE) {
                    $hasResponseProcessing = true;
                    break 2;
                }
            }
        }

        $hasExtendedTextInteraction = $itemXml->getElementsByTagName(ExtendedTextInteraction::qtiTagName())->length > 0;

        if ($hasResponseProcessing || $hasExtendedTextInteraction) {
            return 'question';
        }

        return 'info';
    }

    public function determineManualScoring(DOMDocument $itemXml): bool
    {
        $hasExtendedTextInteraction = $itemXml->getElementsByTagName(ExtendedTextInteraction::qtiTagName())->length > 0;

        return $hasExtendedTextInteraction;
    }

    public function determineTitle(DOMDocument $itemXml): string
    {
        return $itemXml->documentElement?->getAttribute('title') ?? '';
    }
}
