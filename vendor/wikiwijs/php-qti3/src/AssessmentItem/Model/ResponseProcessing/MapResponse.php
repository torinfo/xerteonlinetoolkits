<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\ResponseProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\Processing\AbstractQtiExpression;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\Shared\Collection\StringCollection;

class MapResponse extends AbstractQtiExpression
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

    public function evaluate(ItemState $state): float
    {
        return $state->responseSet->mapResponse($this->identifier);
    }

    public function getBaseType(ItemState $state): BaseType
    {
        return BaseType::FLOAT;
    }

    public function getCardinality(ItemState $state): Cardinality
    {
        return Cardinality::SINGLE;
    }

    public function validate(ItemState $itemState): StringCollection
    {
        $errors = new StringCollection();

        if (!$itemState->responseSet->responseDeclarations->getIdentifiers()->has($this->identifier)) {
            $errors->add('Identifier ' . $this->identifier . ' not found for `qti-map-response`');
        }

        return $errors;
    }
}
