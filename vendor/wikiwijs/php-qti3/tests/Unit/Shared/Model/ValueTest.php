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
    #[Test]
    public function stringValueSerializesCorrectly(): void
    {
        $value = new Value('test');

        $this->assertSame('test', (string) $value);
        $this->assertSame('test', (string) $value->children()[0]);
    }

    #[Test]
    public function intValueSerializesCorrectly(): void
    {
        $value = new Value(123);

        $this->assertSame('123', (string) $value);
        $this->assertSame('123', (string) $value->children()[0]);
    }

    #[Test]
    public function floatValueSerializesCorrectly(): void
    {
        $value = new Value(123.45);

        $this->assertSame('123.45', (string) $value);
        $this->assertSame('123.45', (string) $value->children()[0]);
    }

    #[Test]
    public function boolTrueSerializesAsTrue(): void
    {
        $value = new Value(true);

        $this->assertSame('true', (string) $value);
        $this->assertSame('true', (string) $value->children()[0]);
    }

    #[Test]
    public function boolFalseSerializesAsFalse(): void
    {
        $value = new Value(false);

        $this->assertSame('false', (string) $value);
        $this->assertSame('false', (string) $value->children()[0]);
    }

    #[Test]
    public function childrenReturnsArrayWithSingleTextNode(): void
    {
        $value = new Value('hello');
        $children = $value->children();

        $this->assertCount(1, $children);
        $this->assertInstanceOf(IContentNode::class, $children[0]);
        $this->assertInstanceOf(TextNode::class, $children[0]);
    }
}
