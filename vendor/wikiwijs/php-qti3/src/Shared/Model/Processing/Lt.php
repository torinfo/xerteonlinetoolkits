<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Lt extends AbstractQtiExpression
{
    public function __construct(
        public readonly AbstractQtiExpression $element1,
        public readonly AbstractQtiExpression $element2,
    ) {}

    public function children(): array
    {
        return [
            $this->element1,
            $this->element2,
        ];
    }

    public function evaluate(ItemState $state): bool
    {
        $value1 = $this->element1->evaluateNumber($state);
        $value2 = $this->element2->evaluateNumber($state);

        return $value1 < $value2;
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
        return $this->element1->validate($itemState)->mergeWith($this->element2->validate($itemState));
    }
}
