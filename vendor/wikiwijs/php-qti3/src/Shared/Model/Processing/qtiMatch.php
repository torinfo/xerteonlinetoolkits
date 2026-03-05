<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class qtiMatch extends AbstractQtiExpression
{
    public function __construct(
        public readonly AbstractQtiExpression $expression1,
        public readonly AbstractQtiExpression $expression2,
    ) {}

    public static function qtiTagName(): string
    {
        return 'qti-match'; // Match is a reserved keyword in PHP
    }

    public function children(): array
    {
        return [
            $this->expression1,
            $this->expression2,
        ];
    }

    public function evaluate(ItemState $state): bool
    {
        $value1 = $this->expression1->evaluate($state);
        $value2 = $this->expression2->evaluate($state);

        if ($this->expression1->getBaseType($state) !== $this->expression2->getBaseType($state)) {
            return false;
        }
        if ($this->expression1->getCardinality($state) !== $this->expression2->getCardinality($state)) {
            return false;
        }
        if ($this->expression1->getCardinality($state) === Cardinality::MULTIPLE) {
            /** @var array<int,mixed> $value1 */
            /** @var array<int,mixed> $value2 */
            if (count($value1) !== count($value2)) {
                return false;
            }
            foreach ($value1 as $value) {
                if (!in_array($value, $value2, true)) {
                    return false;
                }
            }
            return true;
        }
        if ($this->expression1->getCardinality($state) === Cardinality::ORDERED) {
            /** @var array<int,mixed> $value1 */
            /** @var array<int,mixed> $value2 */
            if (count($value1) !== count($value2)) {
                return false;
            }
            foreach ($value1 as $key => $value) {
                if ($value !== $value2[$key]) {
                    return false;
                }
            }
            return true;
        }

        return $value1 === $value2;
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
        return $this->expression1->validate($itemState)->mergeWith($this->expression2->validate($itemState));
    }
}
