<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\AssessmentItem\Service\ValueConverter;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\TextNode;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class BaseValue extends AbstractQtiExpression
{
    public function __construct(
        public readonly BaseType $baseType,
        public readonly string|int|float|bool $value,
    ) {}

    public function attributes(): array
    {
        return [
            'base-type' => $this->baseType->value,
        ];
    }

    public function children(): array
    {
        return [
            new TextNode(
                is_bool($this->value) ?
                    ($this->value ? 'true' : 'false')
                    : (string) $this->value,
            ),
        ];
    }

    public function evaluate(ItemState $state): string|int|float|bool|null
    {
        return ValueConverter::convertSingle($this->value, $this->baseType);
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return $this->baseType;
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::SINGLE;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        return new StringCollection();
    }
}
