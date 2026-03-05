<?php

declare(strict_types=1);

namespace Qti3\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;
use InvalidArgumentException;

class Correct extends AbstractQtiExpression
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
        return $state->responseSet->getCorrectResponse($this->identifier);
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return $state->responseSet->responseDeclarations->getByIdentifier($this->identifier)->baseType;
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return $state->responseSet->responseDeclarations->getByIdentifier($this->identifier)->cardinality;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        $errors = new StringCollection();

        if (!$itemState->responseSet->responseDeclarations->getIdentifiers()->has($this->identifier)) {
            $errors->add('Identifier ' . $this->identifier . ' not found for `qti-correct`');
        } else {
            try {
                $itemState->responseSet->getCorrectResponse($this->identifier);
            } catch (InvalidArgumentException $error) {
                $errors->add($error->getMessage());
            }
        }

        return $errors;
    }
}
