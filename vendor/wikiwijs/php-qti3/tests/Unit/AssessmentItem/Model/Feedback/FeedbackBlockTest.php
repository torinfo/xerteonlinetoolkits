<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Feedback;

use Qti3\AssessmentItem\Model\Feedback\FeedbackBlock;
use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class FeedbackBlockTest extends TestCase
{
    private FeedbackBlock $feedbackBlock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->feedbackBlock = new FeedbackBlock(
            identifier: 'OK',
            contentBody: new ContentBody(new ContentNodeCollection([new TextNode('Hierbij onze feedback')])),
        );
    }

    #[Test]
    public function aFeedbackBlockCanBeCreated(): void
    {
        $attributes = [
            'outcome-identifier' => 'FEEDBACK',
            'show-hide' => 'show',
            'identifier' => 'OK',
        ];

        $this->assertCount(1, $this->feedbackBlock->children());
        $this->assertEquals($attributes, $this->feedbackBlock->attributes());
    }
}
