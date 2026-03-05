<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Member extends AbstractQtiExpression
{
    public function __construct(
        public readonly AbstractQtiExpression $needle,
        public readonly AbstractQtiExpression $haystack,
    ) {}

    public function children(): array
    {
        return [
            $this->needle,
            $this->haystack,
        ];
    }

    public function evaluate(ItemState $state): bool
    {
        $haystackValue = $this->haystack->evaluateArray($state);

        return in_array(
            $this->needle->evaluate($state),
            $haystackValue,
        );
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
        return $this->needle->validate($itemState)->mergeWith($this->haystack->validate($itemState));
    }
}
