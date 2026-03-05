<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\MatchInteraction;

use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\MatchInteraction;
use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\SimpleMatchSet;
use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MatchInteractionTest extends TestCase
{
    private SimpleMatchSet $simpleMatchSet1;
    private SimpleMatchSet $simpleMatchSet2;
    private MatchInteraction $matchInteraction;

    protected function setUp(): void
    {
        parent::setUp();

        $this->simpleMatchSet1 = $this->createMock(SimpleMatchSet::class);
        $this->simpleMatchSet2 = $this->createMock(SimpleMatchSet::class);

        $this->matchInteraction = new MatchInteraction(
            simpleMatchSet1: $this->simpleMatchSet1,
            simpleMatchSet2: $this->simpleMatchSet2,
            prompt: new Prompt(new ContentNodeCollection([new TextNode('Prompt')])),
            responseIdentifier: 'RESPONSE',
            shuffle: true,
            maxAssociations: 5,
        );
    }

    #[Test]
    public function testAttributes(): void
    {

        $expectedAttributes = [
            'response-identifier' => 'RESPONSE',
            'shuffle' => 'true',
            'max-associations' => '5',
            'class' => null,
        ];

        $this->assertSame($expectedAttributes, $this->matchInteraction->attributes());
    }

    #[Test]
    public function testChildren(): void
    {
        $matchInteraction = new MatchInteraction($this->simpleMatchSet1, $this->simpleMatchSet2);

        $expectedChildren = [
            null,
            $this->simpleMatchSet1,
            $this->simpleMatchSet2,
        ];

        $this->assertSame($expectedChildren, $matchInteraction->children());
    }
}
