<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\Section;

use Qti3\AssessmentTest\Model\Section\Ordering;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OrderingTest extends TestCase
{
    private Ordering $ordering;

    protected function setUp(): void
    {
        $this->ordering = new Ordering(true);
    }

    #[Test]
    public function testAttributes(): void
    {
        $this->assertEquals([
            'shuffle' => 'true',
        ], $this->ordering->attributes());
    }
}
