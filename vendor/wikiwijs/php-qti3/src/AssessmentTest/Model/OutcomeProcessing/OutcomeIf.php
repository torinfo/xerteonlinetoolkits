<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\Processing\AbstractQtiExpression;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\QtiElement;

class OutcomeIf extends QtiElement
{
    public function __construct(
        public readonly AbstractQtiExpression $condition,
        public readonly SetOutcomeValue $setOutcomeValue,
    ) {}

    public function children(): array
    {
        return [
            $this->condition,
            $this->setOutcomeValue,
        ];
    }
}
