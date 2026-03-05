<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Shape;

use Qti3\AssessmentItem\Model\Shape\Coordinate;
use Qti3\AssessmentItem\Model\Shape\Rectangle;
use Qti3\AssessmentItem\Model\Shape\ShapeName;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class RectangleTest extends TestCase
{
    private Rectangle $rectangle;

    protected function setUp(): void
    {
        $this->rectangle = new Rectangle(
            new Coordinate('418'),
            new Coordinate('29'),
            new Coordinate('40'),
            new Coordinate('50'),
        );
    }

    #[Test]
    public function testToString(): void
    {
        $this->assertSame(ShapeName::RECTANGLE, $this->rectangle->name());
        $this->assertSame('418,29,40,50', $this->rectangle->coords());
    }

    #[Test]
    public function testFromString(): void
    {
        $rectangle = Rectangle::fromString('418,29,40,50');

        $this->assertSame('418', (string) $rectangle->x1);
        $this->assertSame('29', (string) $rectangle->y1);
        $this->assertSame('40', (string) $rectangle->x2);
        $this->assertSame('50', (string) $rectangle->y2);
    }

    #[Test]
    public function testInvalidString(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Rectangle needs 4 coordinates');

        Rectangle::fromString('418,29,40');
    }
}
