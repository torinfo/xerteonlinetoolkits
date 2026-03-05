<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Shape;

use InvalidArgumentException;

class Polygon implements IShapeWithCoords
{
    /**
     * @param array<array{x: Coordinate, y: Coordinate}> $xyPairs
     */
    public function __construct(
        public array $xyPairs,
    ) {
        if (count($xyPairs) < 4) {
            throw new InvalidArgumentException('Polygon needs at least 4 pairs of coordinates');
        }

        // First and last pair must be the same
        if ($this->comparePairs($xyPairs[0], $xyPairs[count($xyPairs) - 1]) === false) {
            throw new InvalidArgumentException('First and last coordination pair must be the same');
        }
    }

    public static function fromString(string $coords): self
    {
        $parts = explode(',', $coords);

        if (count($parts) % 2 !== 0) {
            throw new InvalidArgumentException('Polygon needs an even number of coordinates');
        }

        return new self(
            array_map(
                fn($i): array => [
                    'x' => new Coordinate($parts[$i]),
                    'y' => new Coordinate($parts[$i + 1]),
                ],
                range(0, count($parts) - 1, 2),
            ),
        );
    }

    public function name(): ShapeName
    {
        return ShapeName::POLYGON;
    }

    public function coords(): string
    {
        return implode(',', array_map(
            fn($pair): string => "{$pair['x']},{$pair['y']}",
            $this->xyPairs,
        ));
    }

    /**
     * @param array{x: Coordinate, y: Coordinate} $pair1
     * @param array{x: Coordinate, y: Coordinate} $pair2
     */
    private function comparePairs(array $pair1, array $pair2): bool
    {
        return (string) $pair1['x'] === (string) $pair2['x'] && (string) $pair1['y'] === (string) $pair2['y'];
    }
}
