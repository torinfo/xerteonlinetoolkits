<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\QtiElement;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;
use InvalidArgumentException;

abstract class AbstractQtiExpression extends QtiElement
{
    abstract public function evaluate(ItemState $state): mixed;

    abstract public function getBaseType(ItemState $state): BaseType;

    abstract public function getCardinality(ItemState $state): Cardinality;

    abstract public function validate(ItemState $itemState): StringCollection;

    public function evaluateBoolean(ItemState $state): bool
    {
        $value = $this->evaluate($state);
        if (!is_bool($value)) {
            throw new InvalidArgumentException('Element is not boolean');
        }

        return $value;
    }

    public function evaluateNumber(ItemState $state): float|int
    {
        $value = $this->evaluate($state);
        if (!is_numeric($value)) {
            throw new InvalidArgumentException('Element is not numeric');
        }

        return is_string($value) ? (float) $value : $value;
    }

    /**
     * @return array<int, mixed>
     */
    public function evaluateArray(ItemState $state): array
    {
        $value = $this->evaluate($state);
        if (!is_array($value)) {
            throw new InvalidArgumentException('Element is not an array');
        }

        // Ensure the array has integer keys
        $intKeyedResult = [];
        foreach ($value as $item) {
            $intKeyedResult[] = $item;
        }
        return $intKeyedResult;
    }

    public function evaluateString(ItemState $state): string
    {
        $value = $this->evaluate($state);
        if (!is_string($value)) {
            throw new InvalidArgumentException('Element is not a string');
        }

        return $value;
    }
}
