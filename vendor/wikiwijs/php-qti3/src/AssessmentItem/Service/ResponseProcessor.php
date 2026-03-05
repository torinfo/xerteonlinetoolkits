<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Service;

use Qti3\AssessmentItem\Model\AssessmentItem;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclaration;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclarationCollection;
use Qti3\AssessmentItem\Service\Parser\OutcomeDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\AssessmentItem\Service\Parser\ResponseDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ResponseProcessingParser;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclaration;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\AssessmentItem\Model\State\OutcomeSet;
use Qti3\AssessmentItem\Model\State\ResponseSet;
use DOMDocument;
use DOMElement;
use DOMNodeList;
use DOMXPath;

class ResponseProcessor
{
    public function __construct(
        private readonly ResponseDeclarationParser $responseDeclarationParser,
        private readonly OutcomeDeclarationParser $outcomeDeclarationParser,
        private readonly ResponseProcessingParser $responseProcessingParser,
        private readonly AssessmentItemDeterminator $assessmentItemDeterminator,
    ) {}

    public function initItemState(string $itemXml): ItemState
    {
        $xmlDocument = new DOMDocument();
        $xmlDocument->loadXML($itemXml);

        $responseDeclarationTags = $xmlDocument->getElementsByTagName(ResponseDeclaration::qtiTagName());
        $responseDeclarations = new ResponseDeclarationCollection();

        foreach ($responseDeclarationTags as $responseDeclarationTag) {
            $responseDeclarations->add($this->responseDeclarationParser->parse($responseDeclarationTag));
        }

        $outcomeDeclarationTags = $xmlDocument->getElementsByTagName(OutcomeDeclaration::qtiTagName());
        $outcomeDeclarations = new OutcomeDeclarationCollection();

        foreach ($outcomeDeclarationTags as $outcomeDeclarationTag) {
            $outcomeDeclarations->add($this->outcomeDeclarationParser->parse($outcomeDeclarationTag));
        }

        $responseProcessingTag = $xmlDocument->getElementsByTagName(ResponseProcessing::qtiTagName())->item(0);

        if ($responseProcessingTag) {
            $responseProcessing = $this->responseProcessingParser->parse($responseProcessingTag);
        } else {
            $responseProcessing = new ResponseProcessing([]);
        }

        /** @var DOMElement $item */
        $item = $xmlDocument->getElementsByTagName(AssessmentItem::qtiTagName())->item(0);
        $adaptive = $item->getAttribute('adaptive') === 'true';

        $itemState = new ItemState(
            new ResponseSet(
                $responseDeclarations,
            ),
            new OutcomeSet(
                $outcomeDeclarations,
            ),
            $responseProcessing,
            $adaptive,
        );

        $this->validateItem($xmlDocument, $itemState);

        return $itemState;
    }

    /**
     * @param array<string,string|int|float|bool|array<int,string|int|float|bool>|null> $responses
     */
    public function processResponses(ItemState $itemState, array $responses): void
    {
        $itemState->outcomeSet->set('completionStatus', 'unknown');
        $itemState->responseSet->setResponses($responses);

        $itemState->responseProcessing->processResponses(
            $itemState,
        );

        if ($itemState->adaptive) {
            if ($itemState->outcomeSet->getOutcomeValue('completionStatus') === 'unknown') {
                $itemState->outcomeSet->set('completionStatus', 'incomplete');
            }
        } elseif (count($itemState->responseProcessing->children()) > 0) {
            $itemState->outcomeSet->set('completionStatus', 'completed');
        }
    }

    private function validateItem(DOMDocument $document, ItemState $itemState): void
    {
        $isQuestion = $this->assessmentItemDeterminator->determineType($document) === 'question';
        $hasInteraction = $this->xpathExists($document, '//ns:qti-item-body//*[starts-with(name(), "qti-") and substring(name(), string-length(name()) - 11) = "-interaction"]');

        if ($isQuestion && !$hasInteraction) {
            throw new ParseError('Missing a qti interaction in item-body');
        }

        $hasInteractionNotText = $this->xpathExists($document, '//ns:qti-item-body//*[starts-with(name(), "qti-") and substring(name(), string-length(name()) - 11) = "-interaction" and name() != "qti-extended-text-interaction"]');
        $hasProcessingScore = $this->xpathExists($document, '//ns:qti-response-processing//ns:qti-set-outcome-value[@identifier="SCORE"]');
        $processingTemplate = $this->xpathExists($document, '//ns:qti-response-processing[string-length(@template) > 2]');

        if ($isQuestion && $hasInteractionNotText && !$hasProcessingScore && !$processingTemplate) {
            throw new ParseError('Missing `set-outcome-value` with identifier `SCORE` in `response-processing`');
        }

        if (
            $isQuestion
            && !$this->assessmentItemDeterminator->determineManualScoring($document)
        ) {
            $maxScore = $itemState->outcomeSet->getOutcomeValue('MAXSCORE');

            if (!is_numeric($maxScore) || (float) $maxScore < 0) {
                throw new ParseError('Missing default value for MAXSCORE outcome declaration');
            }
        }
    }

    private function xpathExists(DOMDocument $document, string $path): bool
    {
        if ($document->documentElement === null) {
            return false; // @codeCoverageIgnore
        }

        $xpath = new DOMXPath($document);
        $xpath->registerNamespace('ns', $document->documentElement->getAttribute('xmlns'));
        $result = $xpath->query($path);

        if (!$result instanceof DOMNodeList) {
            return false; // @codeCoverageIgnore
        }

        return (bool) $result->length;
    }
}
