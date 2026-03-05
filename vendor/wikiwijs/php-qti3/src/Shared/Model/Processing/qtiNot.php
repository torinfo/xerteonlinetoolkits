<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class qtiNot extends AbstractQtiExpression
{
    public function __construct(
        private readonly AbstractQtiExpression $expression,
    ) {}

    public static function qtiTagName(): string
    {
        return 'qti-not'; // Not is a reserved keyword in PHP
    }

    public function children(): array
    {
        return [$this->expression];
    }

    public function evaluate(ItemState $state): bool
    {
        $value = $this->expression->evaluateBoolean($state);

        return !$value;
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
        return $this->expression->validate($itemState);
    }
}
