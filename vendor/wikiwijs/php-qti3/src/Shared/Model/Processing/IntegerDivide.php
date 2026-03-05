<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class IntegerDivide extends AbstractQtiExpression
{
    public function __construct(
        private readonly AbstractQtiExpression $numerator,
        private readonly AbstractQtiExpression $denominator,
    ) {}

    public function children(): array
    {
        return [$this->numerator, $this->denominator];
    }

    public function evaluate(ItemState $state): int
    {
        $numerator = $this->numerator->evaluateNumber($state);
        $denominator = $this->denominator->evaluateNumber($state);

        if ($denominator == 0) {
            return 0; // Handle division by zero
        }

        return intval($numerator / $denominator);
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return BaseType::INTEGER;
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::SINGLE;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        return $this->numerator->validate($itemState)->mergeWith($this->denominator->validate($itemState));
    }
}
