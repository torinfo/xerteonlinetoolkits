<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Shape;

use Qti3\AssessmentItem\Model\Shape\Circle;
use Qti3\AssessmentItem\Model\Shape\DefaultShape;
use Qti3\AssessmentItem\Model\Shape\Polygon;
use Qti3\AssessmentItem\Model\Shape\Rectangle;
use Qti3\AssessmentItem\Model\Shape\ShapeFactory;
use Qti3\AssessmentItem\Model\Shape\ShapeName;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ShapeFactoryTest extends TestCase
{
    #[Test]
    public function testCreateCircle(): void
    {
        $shape = ShapeFactory::create(ShapeName::CIRCLE->value, '10,20,30');
        $this->assertInstanceOf(Circle::class, $shape);
        $this->assertSame('10,20,30', $shape->coords());
        $this->assertEquals(ShapeName::CIRCLE, $shape->name());
    }

    #[Test]
    public function testCreateRectangle(): void
    {
        $shape = ShapeFactory::create(ShapeName::RECTANGLE->value, '1,2,3,4');
        $this->assertInstanceOf(Rectangle::class, $shape);
        $this->assertSame('1,2,3,4', $shape->coords());
        $this->assertEquals(ShapeName::RECTANGLE, $shape->name());
    }

    #[Test]
    public function testCreatePolygon(): void
    {
        // Polygon expects at least 4 pairs and the first and last must be equal.
        $coords = '0,0,10,0,10,10,0,0'; // two pairs (0,0), (10,0), (10,10), (0,0)
        $shape = ShapeFactory::create(ShapeName::POLYGON->value, $coords);
        $this->assertInstanceOf(Polygon::class, $shape);
        $this->assertSame($coords, $shape->coords());
        $this->assertEquals(ShapeName::POLYGON, $shape->name());
    }

    #[Test]
    public function testCreateDefault(): void
    {
        $shape = ShapeFactory::create(ShapeName::DEFAULT->value, '');
        $this->assertInstanceOf(DefaultShape::class, $shape);
        $this->assertEquals(ShapeName::DEFAULT, $shape->name());
        $this->assertEquals('', $shape->coords());
    }

    #[Test]
    public function testInvalidShapeThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Invalid shape name: foo');
        ShapeFactory::create('foo', '1,2,3');
    }
}
