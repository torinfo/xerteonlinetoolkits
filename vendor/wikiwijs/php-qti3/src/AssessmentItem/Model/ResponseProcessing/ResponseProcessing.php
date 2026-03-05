<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\ResponseProcessing;

use Qti3\Shared\Model\Processing\IProcessingElement;
use Qti3\Shared\Model\QtiElement;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class ResponseProcessing extends QtiElement
{
    /**
     * @param array<int,IProcessingElement> $elements
     */
    public function __construct(
        public readonly array $elements,
    ) {}

    /**
     * Template for response processing similar to https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml
     */
    public static function matchCorrect(
        float $scoreCorrect = 1.0,
        float $scoreIncorrect = 0.0,
    ): self {
        return new self([ResponseCondition::matchCorrect($scoreCorrect, $scoreIncorrect)]);
    }

    /**
     * Template for response processing equal to https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response.xml
     */
    public static function mapResponse(): self
    {
        return new self(
            [ResponseCondition::mapResponse()],
        );
    }

    /**
     * Template for response processing equal to https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/map_response_point.xml
     */
    public static function mapResponsePoint(): self
    {
        return new self(
            [ResponseCondition::mapResponsePoint()],
        );
    }

    public function children(): array
    {
        return $this->elements;
    }

    public function processResponses(ItemState $state): void
    {
        foreach ($this->elements as $element) {
            $element->processResponses($state);
        }
    }

    public function validate(ItemState $itemState): StringCollection
    {
        $errors = new StringCollection();

        foreach ($this->elements as $element) {
            $errors = $errors->mergeWith($element->validate($itemState));
        }

        return $errors;
    }
}
