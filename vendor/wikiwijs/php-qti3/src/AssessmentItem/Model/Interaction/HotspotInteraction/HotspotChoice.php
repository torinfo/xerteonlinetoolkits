<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\HotspotInteraction;

use Qti3\AssessmentItem\Model\Shape\IShapeWithCoords;
use Qti3\Shared\Model\QtiElement;

class HotspotChoice extends QtiElement
{
    public function __construct(
        public IShapeWithCoords $shape,
        public string $identifier,
    ) {}

    public function attributes(): array
    {
        return [
            'shape' => $this->shape->name()->value,
            'coords' => (string) $this->shape->coords(),
            'identifier' => $this->identifier,
        ];
    }
}
