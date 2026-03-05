<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Shape;

class DefaultShape implements IShapeWithCoords
{
    public function name(): ShapeName
    {
        return ShapeName::DEFAULT;
    }

    public function coords(): string
    {
        return '';
    }
}
