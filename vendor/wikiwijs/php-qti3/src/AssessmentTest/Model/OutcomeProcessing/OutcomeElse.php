<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\QtiElement;

class OutcomeElse extends QtiElement
{
    public function __construct(
        public readonly SetOutcomeValue $setOutcomeValue,
    ) {}

    public function children(): array
    {
        return [
            $this->setOutcomeValue,
        ];
    }
}
