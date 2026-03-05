<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Shape;

use Qti3\AssessmentItem\Model\Shape\Coordinate;
use Qti3\AssessmentItem\Model\Shape\Polygon;
use Qti3\AssessmentItem\Model\Shape\ShapeName;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class PolygonTest extends TestCase
{
    private Polygon $polygon;

    protected function setUp(): void
    {
        $this->polygon = new Polygon(
            [
                ['x' => new Coordinate('418'), 'y' => new Coordinate('29')],
                ['x' => new Coordinate('40'), 'y' => new Coordinate('50')],
                ['x' => new Coordinate('60'), 'y' => new Coordinate('70')],
                ['x' => new Coordinate('418'), 'y' => new Coordinate('29')],
            ],
        );
    }

    #[Test]
    public function testToString(): void
    {
        $this->assertSame(ShapeName::POLYGON, $this->polygon->name());
        $this->assertSame('418,29,40,50,60,70,418,29', $this->polygon->coords());
    }

    #[Test]
    public function testNotEnoughCoordinates(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Polygon needs at least 4 pairs of coordinates');

        new Polygon(
            [
                ['x' => new Coordinate('418'), 'y' => new Coordinate('29')],
                ['x' => new Coordinate('40'), 'y' => new Coordinate('50')],
                ['x' => new Coordinate('418'), 'y' => new Coordinate('29')],
            ],
        );
    }

    #[Test]
    public function testFirstAndLastPairMustBeTheSame(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('First and last coordination pair must be the same');

        new Polygon(
            [
                ['x' => new Coordinate('418'), 'y' => new Coordinate('29')],
                ['x' => new Coordinate('40'), 'y' => new Coordinate('50')],
                ['x' => new Coordinate('60'), 'y' => new Coordinate('70')],
                ['x' => new Coordinate('80'), 'y' => new Coordinate('90')],
            ],
        );
    }

    #[Test]
    public function testFromString(): void
    {
        $polygon = Polygon::fromString('418,29,40,50,60,70,418,29');

        $this->assertSame('418', (string) $polygon->xyPairs[0]['x']);
        $this->assertSame('29', (string) $polygon->xyPairs[0]['y']);
        $this->assertSame('40', (string) $polygon->xyPairs[1]['x']);
        $this->assertSame('50', (string) $polygon->xyPairs[1]['y']);
        $this->assertSame('60', (string) $polygon->xyPairs[2]['x']);
        $this->assertSame('70', (string) $polygon->xyPairs[2]['y']);
        $this->assertSame('418', (string) $polygon->xyPairs[3]['x']);
        $this->assertSame('29', (string) $polygon->xyPairs[3]['y']);
    }

    #[Test]
    public function testInvalidString(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Polygon needs an even number of coordinates');

        Polygon::fromString('418,29,40,50,60');
    }
}
