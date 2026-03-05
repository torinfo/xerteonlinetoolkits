<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Subtract extends AbstractQtiExpression
{
    public function __construct(
        private readonly AbstractQtiExpression $minuend,
        private readonly AbstractQtiExpression $subtrahend,
    ) {}

    public function children(): array
    {
        return [$this->minuend, $this->subtrahend];
    }

    public function evaluate(ItemState $state): float|int
    {
        $minuend = $this->minuend->evaluateNumber($state);
        $subtrahend = $this->subtrahend->evaluateNumber($state);

        return $minuend - $subtrahend;
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return BaseType::FLOAT;
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::SINGLE;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        return $this->minuend->validate($itemState)->mergeWith($this->subtrahend->validate($itemState));
    }
}
