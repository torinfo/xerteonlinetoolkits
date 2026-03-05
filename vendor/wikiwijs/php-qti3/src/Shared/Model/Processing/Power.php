<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Power extends AbstractQtiExpression
{
    public function __construct(
        private readonly AbstractQtiExpression $base,
        private readonly AbstractQtiExpression $exponent,
    ) {}

    public function children(): array
    {
        return [$this->base, $this->exponent];
    }

    public function evaluate(ItemState $state): float|int
    {
        $base = $this->base->evaluateNumber($state);
        $exponent = $this->exponent->evaluateNumber($state);

        return $base ** $exponent;
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return $this->base->getBaseType($state);
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::SINGLE;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        return $this->base->validate($itemState)->mergeWith($this->exponent->validate($itemState));
    }
}
