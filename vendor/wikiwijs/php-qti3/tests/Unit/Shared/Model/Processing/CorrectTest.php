<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model\Processing;

use Qti3\Shared\Model\Processing\Correct;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class CorrectTest extends TestCase
{
    private Correct $correct;

    protected function setUp(): void
    {
        $this->correct = new Correct('correct');
    }

    #[Test]
    public function testCorrect(): void
    {
        $this->assertEquals(
            [
                'identifier' => 'correct',
            ],
            $this->correct->attributes(),
        );
    }
}
