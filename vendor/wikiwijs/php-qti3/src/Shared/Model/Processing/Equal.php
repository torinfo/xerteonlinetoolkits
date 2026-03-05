<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Equal extends AbstractQtiExpression
{
    public function __construct(
        public readonly AbstractQtiExpression $expression1,
        public readonly AbstractQtiExpression $expression2,
    ) {}

    public function children(): array
    {
        return [
            $this->expression1,
            $this->expression2,
        ];
    }

    public function evaluate(ItemState $state): bool
    {
        $value1 = $this->expression1->evaluateNumber($state);
        $value2 = $this->expression2->evaluateNumber($state);

        return (float) $value1 === (float) $value2;
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return BaseType::BOOLEAN;
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::SINGLE;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        return $this->expression1->validate($itemState)->mergeWith($this->expression2->validate($itemState));
    }
}
