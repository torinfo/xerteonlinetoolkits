<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model\Processing;

use Qti3\Shared\Model\Processing\Correct;
use Qti3\Shared\Model\Processing\Member;
use Qti3\Shared\Model\Processing\Variable;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MemberTest extends TestCase
{
    private Member $member;

    protected function setUp(): void
    {
        $variable = new Variable('variable');
        $set = new Correct('set');

        $this->member = new Member($variable, $set);
    }

    #[Test]
    public function testMember(): void
    {
        $this->assertEquals(
            [
                new Variable('variable'),
                new Correct('set'),
            ],
            $this->member->children(),
        );
    }
}
