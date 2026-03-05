<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Shape;

use InvalidArgumentException;

class Rectangle implements IShapeWithCoords
{
    public function __construct(
        public Coordinate $x1,
        public Coordinate $y1,
        public Coordinate $x2,
        public Coordinate $y2,
    ) {}

    public static function fromString(string $coords): self
    {
        $parts = explode(',', $coords);

        if (count($parts) !== 4) {
            throw new InvalidArgumentException('Rectangle needs 4 coordinates');
        }

        return new self(
            new Coordinate($parts[0]),
            new Coordinate($parts[1]),
            new Coordinate($parts[2]),
            new Coordinate($parts[3]),
        );
    }

    public function name(): ShapeName
    {
        return ShapeName::RECTANGLE;
    }

    public function coords(): string
    {
        return "{$this->x1},{$this->y1},{$this->x2},{$this->y2}";
    }
}
