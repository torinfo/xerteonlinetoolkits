<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\QtiElement;

class OutcomeProcessing extends QtiElement
{
    /**
     * @param array<int,IOutcomeProcessingElement> $elements
     */
    public function __construct(
        public readonly array $elements,
    ) {}

    public function children(): array
    {
        return $this->elements;
    }
}
