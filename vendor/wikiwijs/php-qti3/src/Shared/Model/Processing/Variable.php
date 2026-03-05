<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class Variable extends AbstractQtiExpression
{
    public function __construct(
        public readonly string $identifier,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
        ];
    }

    public function evaluate(ItemState $state): mixed
    {
        return $state->getValue($this->identifier);
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return $state->getBaseType($this->identifier);
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return $state->getCardinality($this->identifier);
    }

    public function validate(ItemState $itemState): StringCollection
    {
        $errors = new StringCollection();

        if (!$itemState->getIdentifiers()->has($this->identifier)) {
            $errors->add('Identifier ' . $this->identifier . ' not found for `qti-variable`');
        }

        return $errors;
    }
}
