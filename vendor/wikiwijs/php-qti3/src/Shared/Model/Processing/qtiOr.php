<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class qtiOr extends AbstractQtiExpression
{
    /**
     * @param array<int,AbstractQtiExpression> $elements
     */
    public function __construct(
        public readonly array $elements,
    ) {}

    public static function qtiTagName(): string
    {
        return 'qti-or'; // Or is a reserved keyword in PHP
    }

    public function children(): array
    {
        return $this->elements;
    }

    public function evaluate(ItemState $state): bool
    {
        return array_reduce(
            $this->elements,
            function(bool $carry, AbstractQtiExpression $element) use ($state): bool {
                $value = $element->evaluateBoolean($state);

                return $carry || $value;
            },
            false,
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
        $errors = new StringCollection();
        foreach ($this->elements as $element) {
            $errors = $errors->mergeWith($element->validate($itemState));
        }

        return $errors;
    }
}
