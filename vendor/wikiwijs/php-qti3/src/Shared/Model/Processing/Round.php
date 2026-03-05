<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Round extends AbstractQtiExpression
{
    public function __construct(
        private readonly AbstractQtiExpression $expression,
        private readonly string $roundingMode = 'nearest',
    ) {}

    public function children(): array
    {
        return [$this->expression];
    }

    public function evaluate(ItemState $state): int|float
    {
        $value = $this->expression->evaluateNumber($state);

        return match ($this->roundingMode) {
            'floor' => floor($value),
            'ceiling' => ceil($value),
            default => round($value),
        };
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
        return $this->expression->validate($itemState);
    }
}
