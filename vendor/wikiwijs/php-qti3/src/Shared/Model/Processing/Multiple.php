<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Multiple extends AbstractQtiExpression
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

    /**
     * @return array<int,mixed>
     */
    public function evaluate(ItemState $state): array
    {
        $result = [];

        foreach ($this->elements as $element) {
            $elementValue = $element->evaluate($state);

            if (is_array($elementValue)) {
                $result = array_merge($result, $elementValue);
            } else {
                $result[] = $elementValue;
            }
        }

        // Ensure the array has integer keys
        $intKeyedResult = [];
        foreach ($result as $value) {
            $intKeyedResult[] = $value;
        }
        return $intKeyedResult;
    }

    public function getBaseType(ItemState $state): BaseType
    {
        if (count($this->elements) === 0) {
            return BaseType::STRING;
        }
        return $this->elements[0]->getBaseType($state);
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::MULTIPLE;
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
