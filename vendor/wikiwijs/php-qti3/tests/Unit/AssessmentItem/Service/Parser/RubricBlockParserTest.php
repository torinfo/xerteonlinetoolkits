<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service\Parser;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\RubricBlock\qtiUse;
use Qti3\AssessmentItem\Model\RubricBlock\RubricBlock;
use Qti3\AssessmentItem\Model\RubricBlock\View;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\AssessmentItem\Service\Parser\RubricBlockParser;
use Qti3\Shared\Model\HTMLTag;
use Qti3\Shared\Model\TextNode;

class RubricBlockParserTest extends TestCase
{
    private RubricBlockParser $parser;

    protected function setUp(): void
    {
        $this->parser = new RubricBlockParser();
    }

    private function loadElement(string $xml): DOMElement
    {
        $doc = new DOMDocument();
        $doc->loadXML($xml);
        return $doc->documentElement;
    }

    #[Test]
    public function parseWithContentAndAttributes(): void
    {
        $element = $this->loadElement('
            <qti-rubric-block use="scoring" view="scorer" class="rubric-style">
                <p>Scoring criteria</p>
            </qti-rubric-block>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(RubricBlock::class, $result);
        $this->assertSame(qtiUse::SCORING, $result->use);
        $this->assertSame(View::SCORER, $result->view);
        $this->assertSame('rubric-style', $result->class);

        $content = $result->contentBody->content->all();
        $this->assertCount(1, $content);
        $this->assertInstanceOf(HTMLTag::class, $content[0]);
        $this->assertSame('p', $content[0]->tagName());
        $this->assertInstanceOf(TextNode::class, $content[0]->children()[0]);
        $this->assertSame('Scoring criteria', $content[0]->children()[0]->content);
    }

    #[Test]
    public function parseWithNestedHtml(): void
    {
        $element = $this->loadElement('
            <qti-rubric-block use="instructions" view="candidate">
                <div>
                    <p>Nested <em>emphasis</em> text</p>
                </div>
            </qti-rubric-block>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(RubricBlock::class, $result);
        $content = $result->contentBody->content->all();
        $this->assertCount(1, $content);

        $div = $content[0];
        $this->assertInstanceOf(HTMLTag::class, $div);
        $this->assertSame('div', $div->tagName());

        $p = $div->children()[0];
        $this->assertInstanceOf(HTMLTag::class, $p);
        $this->assertSame('p', $p->tagName());

        // p has: TextNode("Nested "), HTMLTag(em), TextNode(" text")
        $this->assertCount(3, $p->children());
        $this->assertInstanceOf(TextNode::class, $p->children()[0]);
        $this->assertInstanceOf(HTMLTag::class, $p->children()[1]);
        $this->assertSame('em', $p->children()[1]->tagName());
    }

    #[Test]
    public function parseWrongTagThrows(): void
    {
        $element = $this->loadElement('<wrong-tag use="instructions" view="candidate"/>');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Expected tag "qti-rubric-block", got "wrong-tag"');

        $this->parser->parse($element);
    }
}
