<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\SelectPointInteraction;

use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\AssessmentItem\Model\Interaction\SelectPointInteraction\SelectPointInteraction;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class SelectPointInteractionTest extends TestCase
{
    private SelectPointInteraction $interaction;
    private Prompt $prompt;
    private HTMLTag $image;

    protected function setUp(): void
    {
        parent::setUp();

        $this->prompt = new Prompt(new ContentNodeCollection([new TextNode('test-prompt')]));
        $this->image = new HTMLTag('img', ['src' => 'test-image', 'alt' => 'test-alt']);

        $this->interaction = new SelectPointInteraction(
            image: $this->image,
            maxChoices: 1,
            prompt: $this->prompt,
            responseIdentifier: 'RESPONSE',
        );
    }

    #[Test]
    public function testAttributesAndChildren(): void
    {
        $this->assertEquals(
            [
                'max-choices' => '1',
                'response-identifier' => 'RESPONSE',
            ],
            $this->interaction->attributes(),
        );

        $this->assertEquals(
            [
                $this->prompt,
                $this->image,
            ],
            $this->interaction->children(),
        );
    }
}
