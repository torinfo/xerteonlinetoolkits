<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class IsNull extends AbstractQtiExpression
{
    public function __construct(
        public readonly Variable $variable,
    ) {}

    public function children(): array
    {
        return [
            $this->variable,
        ];
    }

    public function evaluate(ItemState $state): bool
    {
        return $this->variable->evaluate($state) === null;
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
        return $this->variable->validate($itemState);
    }
}
