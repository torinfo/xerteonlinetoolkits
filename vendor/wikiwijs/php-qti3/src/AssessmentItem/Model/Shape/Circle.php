<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Shape;

use InvalidArgumentException;

class Circle implements IShapeWithCoords
{
    public function __construct(
        public Coordinate $x,
        public Coordinate $y,
        public Coordinate $r,
    ) {}

    public static function fromString(string $coords): self
    {
        $parts = explode(',', $coords);

        if (count($parts) !== 3) {
            throw new InvalidArgumentException('Circle needs 3 coordinates');
        }

        return new self(
            new Coordinate($parts[0]),
            new Coordinate($parts[1]),
            new Coordinate($parts[2]),
        );
    }

    public function name(): ShapeName
    {
        return ShapeName::CIRCLE;
    }

    public function coords(): string
    {
        return "{$this->x},{$this->y},{$this->r}";
    }
}
