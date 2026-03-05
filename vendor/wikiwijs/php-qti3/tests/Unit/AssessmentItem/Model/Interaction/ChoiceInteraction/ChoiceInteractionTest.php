<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\ChoiceInteraction;

use Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction\ChoiceInteraction;
use Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction\SimpleChoice;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ChoiceInteractionTest extends TestCase
{
    private ChoiceInteraction $choiceInteraction;

    protected function setUp(): void
    {
        parent::setUp();

        $this->choiceInteraction = new ChoiceInteraction(
            [
                new SimpleChoice('A', new ContentNodeCollection([new TextNode('Antwoord 1')])),
                new SimpleChoice('B', new ContentNodeCollection([new TextNode('Antwoord 2')])),
            ],
        );
    }

    #[Test]
    public function aChoiceInteractionCanBeCreated(): void
    {
        $this->assertInstanceOf(ChoiceInteraction::class, $this->choiceInteraction);
        $this->assertEquals('RESPONSE', $this->choiceInteraction->attributes()['response-identifier']);
        $this->assertCount(3, $this->choiceInteraction->children());
        $this->assertEquals('A', $this->choiceInteraction->children()[1]->attributes()['identifier']);
        $this->assertInstanceOf(TextNode::class, $this->choiceInteraction->children()[1]->children()[0]);
    }
}
