<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Shape;

use Qti3\AssessmentItem\Model\Shape\Circle;
use Qti3\AssessmentItem\Model\Shape\Coordinate;
use Qti3\AssessmentItem\Model\Shape\ShapeName;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class CircleTest extends TestCase
{
    private Circle $circle;

    protected function setUp(): void
    {
        $this->circle = new Circle(new Coordinate('418'), new Coordinate('29'), new Coordinate('40'));
    }

    #[Test]
    public function testToString(): void
    {
        $this->assertSame(ShapeName::CIRCLE, $this->circle->name());
        $this->assertSame('418,29,40', $this->circle->coords());
    }

    #[Test]
    public function testFromString(): void
    {
        $circleCoords = Circle::fromString('418,29,40');

        $this->assertSame('418', (string) $circleCoords->x);
        $this->assertSame('29', (string) $circleCoords->y);
        $this->assertSame('40', (string) $circleCoords->r);
    }

    #[Test]
    public function testInvalidString(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Circle needs 3 coordinates');

        Circle::fromString('418,29');
    }
}
