<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseDeclaration;

use Qti3\AssessmentItem\Model\ResponseDeclaration\MapEntry;
use Qti3\AssessmentItem\Model\ResponseDeclaration\Mapping;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MappingTest extends TestCase
{
    private MapEntry $mapEntry;
    private Mapping $mapping;

    protected function setUp(): void
    {
        $this->mapEntry = new MapEntry('key', 1);
        $this->mapping = new Mapping([$this->mapEntry], 0, 1, 2);
    }

    #[Test]
    public function testAttributes(): void
    {
        $expectedAttributes = [
            'default-value' => '0',
            'lower-bound' => '1',
            'upper-bound' => '2',
        ];

        $this->assertEquals($expectedAttributes, $this->mapping->attributes());
    }

    #[Test]
    public function testChildren(): void
    {
        $expectedChildren = [$this->mapEntry];

        $this->assertEquals($expectedChildren, $this->mapping->children());
    }

    #[Test]
    public function testEvaluate(): void
    {
        $mapping = new Mapping([
            new MapEntry('A', 2),
            new MapEntry('B', 1),
            new MapEntry('C', -1),
            new MapEntry('D', 0),
        ], -2, 0, 3);

        $this->assertEquals(3, $mapping->evaluate(['A', 'B']));
        $this->assertEquals(2, $mapping->evaluate(['A', 'B', 'C']));
        $this->assertEquals(1, $mapping->evaluate(['A', 'B', 'E']));
        $this->assertEquals(0, $mapping->evaluate(['C', 'E']));
        $this->assertEquals(0, $mapping->evaluate(null));
        $this->assertEquals(0, $mapping->evaluate([]));
        $this->assertEquals(2, $mapping->evaluate('A'));
    }
}
