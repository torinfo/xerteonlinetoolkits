<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\ExtendedTextInteraction;

use Qti3\AssessmentItem\Model\Interaction\ExtendedTextInteraction\ExtendedTextInteraction;
use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ExtendedTextInteractionTest extends TestCase
{
    #[Test]
    public function attributesReturnsCorrectArrayWithDefaultResponseIdentifier(): void
    {
        $interaction = new ExtendedTextInteraction();

        $this->assertEquals(
            ['response-identifier' => 'RESPONSE'],
            $interaction->attributes(),
        );
    }

    #[Test]
    public function attributesReturnsCorrectArrayWithCustomResponseIdentifier(): void
    {
        $interaction = new ExtendedTextInteraction(responseIdentifier: 'CUSTOM_RESPONSE');

        $this->assertEquals(
            ['response-identifier' => 'CUSTOM_RESPONSE'],
            $interaction->attributes(),
        );
    }

    #[Test]
    public function childrenReturnsArrayWithNullPrompt(): void
    {
        $interaction = new ExtendedTextInteraction();

        $this->assertEquals([null], $interaction->children());
    }

    #[Test]
    public function childrenReturnsArrayWithPromptInstance(): void
    {
        $prompt = new Prompt(new ContentNodeCollection([new TextNode('Enter your answer')]));
        $interaction = new ExtendedTextInteraction(prompt: $prompt);

        $children = $interaction->children();

        $this->assertCount(1, $children);
        $this->assertSame($prompt, $children[0]);
    }
}
