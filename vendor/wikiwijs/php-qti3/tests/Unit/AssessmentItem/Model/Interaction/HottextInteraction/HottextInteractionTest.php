<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\HottextInteraction;

use Qti3\AssessmentItem\Model\Interaction\HottextInteraction\HottextInteraction;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class HottextInteractionTest extends TestCase
{
    private HottextInteraction $hottextInteraction;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hottextInteraction = new HottextInteraction(
            maxChoices: 1,
            content: new ContentNodeCollection([new TextNode('Textnode')]),
        );
    }

    #[Test]
    public function testAttributes(): void
    {
        $expectedAttributes = [
            'max-choices' => '1',
            'response-identifier' => 'RESPONSE',
        ];

        $this->assertSame($expectedAttributes, $this->hottextInteraction->attributes());
    }

    #[Test]
    public function testChildren(): void
    {
        $expectedChildren = [
            ...$this->hottextInteraction->content->all(),
        ];

        $this->assertSame($expectedChildren, $this->hottextInteraction->children());
    }
}
