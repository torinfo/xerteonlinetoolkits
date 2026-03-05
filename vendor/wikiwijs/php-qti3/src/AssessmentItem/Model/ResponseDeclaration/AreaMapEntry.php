<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\ResponseDeclaration;

use Qti3\AssessmentItem\Model\Shape\IShapeWithCoords;
use Qti3\Shared\Model\QtiElement;

class AreaMapEntry extends QtiElement
{
    public function __construct(
        public IShapeWithCoords $shape,
        public readonly float $mappedValue,
    ) {}

    public function attributes(): array
    {
        return [
            'shape' => $this->shape->name()->value,
            'coords' => $this->shape->coords(),
            'mapped-value' => (string) $this->mappedValue,
        ];
    }
}
