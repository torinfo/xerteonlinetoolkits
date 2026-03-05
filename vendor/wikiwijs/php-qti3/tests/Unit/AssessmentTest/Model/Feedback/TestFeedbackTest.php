<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\Feedback;

use Qti3\AssessmentTest\Model\Feedback\TestFeedback;
use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class TestFeedbackTest extends TestCase
{
    private TestFeedback $testFeedback;

    protected function setUp(): void
    {
        $this->testFeedback = new TestFeedback(
            'feedback',
            'outcomeIdentifier',
            new ContentBody(new ContentNodeCollection([
                new TextNode('test'),
            ])),
        );
    }

    #[Test]
    public function testAttributes(): void
    {
        $this->assertEquals([
            'identifier' => 'feedback',
            'outcome-identifier' => 'outcomeIdentifier',
            'show-hide' => 'show',
            'access' => 'atEnd',
        ], $this->testFeedback->attributes());
    }

    #[Test]
    public function testChildren(): void
    {
        $this->assertInstanceOf(ContentBody::class, $this->testFeedback->children()[0]);
    }
}
