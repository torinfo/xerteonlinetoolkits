<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Feedback;

use Qti3\AssessmentItem\Model\Feedback\FeedbackInline;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class FeedbackInlineTest extends TestCase
{
    private FeedbackInline $feedbackInline;

    protected function setUp(): void
    {
        parent::setUp();

        $this->feedbackInline = new FeedbackInline(
            identifier: 'OK',
            content: new ContentNodeCollection([new TextNode('Hierbij onze feedback')]),
        );
    }

    #[Test]
    public function aFeedbackInlineCanBeCreated(): void
    {
        $attributes = [
            'outcome-identifier' => 'FEEDBACK',
            'show-hide' => 'show',
            'identifier' => 'OK',
        ];

        $this->assertCount(1, $this->feedbackInline->children());
        $this->assertEquals($attributes, $this->feedbackInline->attributes());
    }
}
