<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model\Processing;

use Qti3\Shared\Model\Processing\Multiple;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MultipleTest extends TestCase
{
    private Multiple $multiple;

    protected function setUp(): void
    {
        $this->multiple = new Multiple([]);
    }

    #[Test]
    public function testChildren(): void
    {
        $this->assertEquals([], $this->multiple->children());
    }
}
