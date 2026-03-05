<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\MatchInteraction;

use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\SimpleAssociableChoice;
use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\SimpleMatchSet;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class SimpleMatchSetTest extends TestCase
{
    private SimpleMatchSet $simpleMatchSet;
    private SimpleAssociableChoice $choice1;
    private SimpleAssociableChoice $choice2;

    protected function setUp(): void
    {
        $this->choice1 = $this->createMock(SimpleAssociableChoice::class);
        $this->choice2 = $this->createMock(SimpleAssociableChoice::class);
        $this->simpleMatchSet = new SimpleMatchSet([$this->choice1, $this->choice2]);
    }

    #[Test]
    public function testChildren(): void
    {
        $expectedChoices = [$this->choice1, $this->choice2];

        $this->assertSame($expectedChoices, $this->simpleMatchSet->children());
    }
}
