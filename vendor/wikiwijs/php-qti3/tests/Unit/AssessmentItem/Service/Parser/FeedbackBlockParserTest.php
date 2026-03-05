<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service\Parser;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\Feedback\FeedbackBlock;
use Qti3\AssessmentItem\Model\Feedback\Visibility;
use Qti3\AssessmentItem\Service\Parser\FeedbackBlockParser;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\TextNode;

class FeedbackBlockParserTest extends TestCase
{
    private FeedbackBlockParser $parser;

    protected function setUp(): void
    {
        $this->parser = new FeedbackBlockParser();
    }

    private function loadElement(string $xml): DOMElement
    {
        $doc = new DOMDocument();
        $doc->loadXML($xml);
        return $doc->documentElement;
    }

    #[Test]
    public function parseWithAllAttributes(): void
    {
        $element = $this->loadElement('
            <qti-feedback-block identifier="feedback-correct" outcome-identifier="FEEDBACKMODAL" show-hide="hide">
                <p>Well done!</p>
            </qti-feedback-block>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(FeedbackBlock::class, $result);
        $this->assertSame('feedback-correct', $result->identifier);
        $this->assertSame('FEEDBACKMODAL', $result->outcomeIdentifier);
        $this->assertSame(Visibility::HIDE, $result->showHide);

        $content = $result->contentBody->content->all();
        $this->assertCount(1, $content);
        $this->assertInstanceOf(HTMLTag::class, $content[0]);
        $this->assertSame('p', $content[0]->tagName());
        $this->assertInstanceOf(TextNode::class, $content[0]->children()[0]);
        $this->assertSame('Well done!', $content[0]->children()[0]->content);
    }

    #[Test]
    public function parseDefaults(): void
    {
        $element = $this->loadElement('
            <qti-feedback-block identifier="fb-default">
                <p>Default feedback</p>
            </qti-feedback-block>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(FeedbackBlock::class, $result);
        $this->assertSame('fb-default', $result->identifier);
        $this->assertSame('FEEDBACK', $result->outcomeIdentifier);
        $this->assertSame(Visibility::SHOW, $result->showHide);
    }

    #[Test]
    public function parseWrongTagThrows(): void
    {
        $element = $this->loadElement('<wrong-tag identifier="fb1"/>');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Expected tag "qti-feedback-block", got "wrong-tag"');

        $this->parser->parse($element);
    }
}
