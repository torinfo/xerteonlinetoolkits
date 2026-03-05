<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Contains extends AbstractQtiExpression
{
    public function __construct(
        private readonly AbstractQtiExpression $container,
        private readonly AbstractQtiExpression $contains,
    ) {}

    public function children(): array
    {
        return [$this->container, $this->contains];
    }

    public function evaluate(ItemState $state): bool
    {
        $container = $this->container->evaluateArray($state);
        $contains = $this->contains->evaluateArray($state);

        return array_all($contains, fn($item): bool => in_array($item, $container));
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
        return $this->container->validate($itemState)->mergeWith($this->contains->validate($itemState));
    }
}
