<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Product extends AbstractQtiExpression
{
    /**
     * @param array<int,AbstractQtiExpression> $elements
     */
    public function __construct(
        public readonly array $elements,
    ) {}

    public function children(): array
    {
        return $this->elements;
    }

    public function evaluate(ItemState $state): int|float
    {
        return array_reduce(
            $this->elements,
            function(int|float $carry, AbstractQtiExpression $element) use ($state): int|float {
                $value = $element->evaluateNumber($state);

                return $carry * $value;
            },
            1,
        );
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
        $errors = new StringCollection();
        foreach ($this->elements as $element) {
            $errors = $errors->mergeWith($element->validate($itemState));
        }

        return $errors;
    }
}
