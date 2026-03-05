<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Shape;

interface IShapeWithCoords
{
    public function name(): ShapeName;

    public function coords(): string;
}
