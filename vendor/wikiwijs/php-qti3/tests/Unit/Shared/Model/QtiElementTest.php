<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class QtiElementTest extends TestCase
{
    private QtiElementStub $qtiElement;

    protected function setUp(): void
    {
        parent::setUp();
        $this->qtiElement = new QtiElementStub();
    }

    #[Test]
    public function testQtiElement(): void
    {
        $this->assertEquals('qti-qti-element-stub', $this->qtiElement->tagName());
        $this->assertEquals([], $this->qtiElement->attributes());
        $this->assertEquals([], $this->qtiElement->children());
    }
}
