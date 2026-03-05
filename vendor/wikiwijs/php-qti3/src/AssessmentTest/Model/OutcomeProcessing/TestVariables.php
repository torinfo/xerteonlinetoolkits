<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\Processing\AbstractQtiExpression;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class TestVariables extends AbstractQtiExpression
{
    public function __construct(
        public readonly string $variableIdentifier,
        public readonly ?string $includeCategory = null,
    ) {}

    public function attributes(): array
    {
        return [
            'variable-identifier' => $this->variableIdentifier,
            'include-category' => $this->includeCategory,
        ];
    }

    // @codeCoverageIgnoreStart
    public function evaluate(ItemState $state): mixed
    {
        return null;
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return BaseType::STRING;
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::SINGLE;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        // TODO: Implement validate() method.

        return new StringCollection();
    }
    // @codeCoverageIgnoreEnd
}
