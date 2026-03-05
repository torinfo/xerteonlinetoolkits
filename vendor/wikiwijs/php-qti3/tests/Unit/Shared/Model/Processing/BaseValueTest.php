<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model\Processing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class BaseValueTest extends TestCase
{
    private BaseValue $baseValueString;
    private BaseValue $baseValueBool;

    protected function setUp(): void
    {
        $this->baseValueString = new BaseValue(BaseType::STRING, 'baseValue');
        $this->baseValueBool = new BaseValue(BaseType::BOOLEAN, true);
    }

    #[Test]
    public function testBaseValue(): void
    {
        $this->assertEquals(
            [
                'base-type' => 'string',
            ],
            $this->baseValueString->attributes(),
        );
        $this->assertInstanceOf(TextNode::class, $this->baseValueString->children()[0]);
    }

    #[Test]
    public function testBaseValueWithBool(): void
    {
        $this->assertEquals(
            [
                'base-type' => 'boolean',
            ],
            $this->baseValueBool->attributes(),
        );
        $this->assertInstanceOf(TextNode::class, $this->baseValueBool->children()[0]);
        $this->assertEquals('true', $this->baseValueBool->children()[0]->content);
    }
}
