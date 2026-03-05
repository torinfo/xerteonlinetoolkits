<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Shape;

use InvalidArgumentException;

class ShapeFactory
{
    public static function create(string $name, string $coords): IShapeWithCoords
    {
        return match ($name) {
            ShapeName::CIRCLE->value => Circle::fromString($coords),
            ShapeName::RECTANGLE->value => Rectangle::fromString($coords),
            ShapeName::POLYGON->value => Polygon::fromString($coords),
            ShapeName::DEFAULT->value => new DefaultShape(),
            default => throw new InvalidArgumentException('Invalid shape name: ' . $name),
        };
    }
}
