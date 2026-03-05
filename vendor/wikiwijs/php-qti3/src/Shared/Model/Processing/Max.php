<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Max extends AbstractQtiExpression
{
    /**
     * @param array<int,AbstractQtiExpression> $expressions
     */
    public function __construct(
        private readonly array $expressions,
    ) {}

    public function children(): array
    {
        return $this->expressions;
    }

    public function evaluate(ItemState $state): float|int
    {
        if (count($this->expressions) === 0) {
            return 0;
        }

        $values = array_map(
            fn(AbstractQtiExpression $element): float|int => $element->evaluateNumber($state),
            $this->expressions,
        );

        return max($values);
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
        foreach ($this->expressions as $expression) {
            $errors = $errors->mergeWith($expression->validate($itemState));
        }

        return $errors;
    }
}
