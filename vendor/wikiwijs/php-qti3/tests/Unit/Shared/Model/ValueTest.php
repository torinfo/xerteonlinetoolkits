<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model;

use Qti3\Shared\Model\IContentNode;
use Qti3\Shared\Model\TextNode;
use Qti3\Shared\Model\Value;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ValueTest extends TestCase
{
    private Value $stringValue;
    private Value $intValue;
    private Value $floatValue;
    private Value $boolValue;

    protected function setUp(): void
    {
        $this->stringValue = new Value('test');
        $this->intValue = new Value(123);
        $this->floatValue = new Value(123.45);
        $this->boolValue = new Value(true);
    }

    #[Test]
    public function valueIsConvertedToStringCorrectly(): void
    {
        $this->assertEquals('test', (string) $this->stringValue);
        $this->assertEquals('123', (string) $this->intValue);
        $this->assertEquals('123.45', (string) $this->floatValue);
        $this->assertEquals('1', (string) $this->boolValue);
    }

    #[Test]
    public function childrenReturnsArrayWithTextNode(): void
    {
        $children = $this->stringValue->children();

        $this->assertIsArray($children);
        $this->assertCount(1, $children);
        $this->assertInstanceOf(IContentNode::class, $children[0]);
        $this->assertInstanceOf(TextNode::class, $children[0]);
        $this->assertEquals('test', (string) $children[0]);
    }
}
