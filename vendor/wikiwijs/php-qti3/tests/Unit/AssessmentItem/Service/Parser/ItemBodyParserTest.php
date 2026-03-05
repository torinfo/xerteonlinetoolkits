<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service\Parser;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\Feedback\FeedbackBlock;
use Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction\ChoiceInteraction;
use Qti3\AssessmentItem\Model\ItemBody;
use Qti3\AssessmentItem\Model\RubricBlock\RubricBlock;
use Qti3\AssessmentItem\Service\Parser\FeedbackBlockParser;
use Qti3\AssessmentItem\Service\Parser\InteractionParser;
use Qti3\AssessmentItem\Service\Parser\ItemBodyParser;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\AssessmentItem\Service\Parser\RubricBlockParser;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\TextNode;

class ItemBodyParserTest extends TestCase
{
    private ItemBodyParser $parser;

    protected function setUp(): void
    {
        $this->parser = new ItemBodyParser(
            new InteractionParser(),
            new RubricBlockParser(),
            new FeedbackBlockParser(),
        );
    }

    private function loadElement(string $xml): DOMElement
    {
        $doc = new DOMDocument();
        $doc->loadXML($xml);
        return $doc->documentElement;
    }

    #[Test]
    public function parseWithHtmlContent(): void
    {
        $element = $this->loadElement('
            <qti-item-body>
                <p>A paragraph</p>
                <div>A division</div>
            </qti-item-body>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(ItemBody::class, $result);
        $this->assertCount(2, $result->content);

        $p = $result->content->all()[0];
        $this->assertInstanceOf(HTMLTag::class, $p);
        $this->assertSame('p', $p->tagName());
        $this->assertInstanceOf(TextNode::class, $p->children()[0]);
        $this->assertSame('A paragraph', $p->children()[0]->content);

        $div = $result->content->all()[1];
        $this->assertInstanceOf(HTMLTag::class, $div);
        $this->assertSame('div', $div->tagName());
        $this->assertSame('A division', $div->children()[0]->content);
    }

    #[Test]
    public function parseWithInteraction(): void
    {
        $element = $this->loadElement('
            <qti-item-body>
                <qti-choice-interaction response-identifier="RESPONSE">
                    <qti-simple-choice identifier="A">Answer</qti-simple-choice>
                </qti-choice-interaction>
            </qti-item-body>
        ');

        $result = $this->parser->parse($element);

        $this->assertCount(1, $result->content);
        $this->assertInstanceOf(ChoiceInteraction::class, $result->content->all()[0]);
        $this->assertSame('RESPONSE', $result->content->all()[0]->responseIdentifier);
    }

    #[Test]
    public function parseWithRubricBlock(): void
    {
        $element = $this->loadElement('
            <qti-item-body>
                <qti-rubric-block use="instructions" view="candidate">
                    <p>Instructions here</p>
                </qti-rubric-block>
            </qti-item-body>
        ');

        $result = $this->parser->parse($element);

        $this->assertCount(1, $result->content);
        $this->assertInstanceOf(RubricBlock::class, $result->content->all()[0]);
    }

    #[Test]
    public function parseWithFeedbackBlock(): void
    {
        $element = $this->loadElement('
            <qti-item-body>
                <qti-feedback-block identifier="fb1" outcome-identifier="FEEDBACK" show-hide="show">
                    <p>Feedback content</p>
                </qti-feedback-block>
            </qti-item-body>
        ');

        $result = $this->parser->parse($element);

        $this->assertCount(1, $result->content);
        $this->assertInstanceOf(FeedbackBlock::class, $result->content->all()[0]);
    }

    #[Test]
    public function parseIgnoresWhitespaceTextNodes(): void
    {
        $element = $this->loadElement('
            <qti-item-body>
                <p>Content</p>
            </qti-item-body>
        ');

        $result = $this->parser->parse($element);

        // Only the <p> element should be parsed, whitespace text nodes should be ignored
        $this->assertCount(1, $result->content);
        $this->assertInstanceOf(HTMLTag::class, $result->content->all()[0]);
    }

    #[Test]
    public function parseWrongTagThrows(): void
    {
        $element = $this->loadElement('<wrong-tag><div>Content</div></wrong-tag>');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Expected tag "qti-item-body", got "wrong-tag"');

        $this->parser->parse($element);
    }
}
