<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseDeclaration;

use Qti3\AssessmentItem\Model\ResponseDeclaration\AreaMapEntry;
use Qti3\AssessmentItem\Model\Shape\Rectangle;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class AreaMapEntryTest extends TestCase
{
    private AreaMapEntry $areaMapEntry;

    protected function setUp(): void
    {
        $this->areaMapEntry = new AreaMapEntry(
            shape: Rectangle::fromString('0,0,100,100'),
            mappedValue: 1,
        );
    }

    #[Test]
    public function testAttributes(): void
    {
        $expectedAttributes = [
            'shape' => 'rect',
            'coords' => '0,0,100,100',
            'mapped-value' => 1,
        ];

        $this->assertEquals($expectedAttributes, $this->areaMapEntry->attributes());
    }

    #[Test]
    public function testChildren(): void
    {
        $expectedChildren = [];

        $this->assertEquals($expectedChildren, $this->areaMapEntry->children());
    }
}
