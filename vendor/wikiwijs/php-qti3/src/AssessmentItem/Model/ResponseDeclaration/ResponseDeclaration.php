<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\ResponseDeclaration;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\QtiElement;

class ResponseDeclaration extends QtiElement
{
    public function __construct(
        public readonly BaseType $baseType,
        public readonly Cardinality $cardinality = Cardinality::SINGLE,
        public readonly string $identifier = 'RESPONSE',
        public readonly ?CorrectResponse $correctResponse = null,
        public readonly ?Mapping $mapping = null,
        public readonly ?AreaMapping $areaMapping = null,
    ) {}

    public function attributes(): array
    {
        return [
            'identifier' => $this->identifier,
            'cardinality' => $this->cardinality->value,
            'base-type' => $this->baseType->value,
        ];
    }

    public function children(): array
    {
        return [
            $this->correctResponse,
            $this->mapping,
            $this->areaMapping,
        ];
    }
}
