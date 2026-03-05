<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model;

use Qti3\Shared\Model\DefaultValue;
use Qti3\Shared\Model\IContentNode;
use Qti3\Shared\Model\Value;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class DefaultValueTest extends TestCase
{
    private DefaultValue $defaultValue;
    private Value $value;

    protected function setUp(): void
    {
        $this->value = new Value('test');
        $this->defaultValue = new DefaultValue($this->value);
    }

    #[Test]
    public function constructorInitializesValueCorrectly(): void
    {
        $this->assertSame($this->value, $this->defaultValue->value);
    }

    #[Test]
    public function childrenReturnsArrayWithValue(): void
    {
        $children = $this->defaultValue->children();

        $this->assertIsArray($children);
        $this->assertCount(1, $children);
        $this->assertInstanceOf(IContentNode::class, $children[0]);
        $this->assertSame($this->value, $children[0]);
    }
}
