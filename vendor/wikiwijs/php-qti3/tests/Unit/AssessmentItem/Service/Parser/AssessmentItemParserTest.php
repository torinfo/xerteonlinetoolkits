<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service\Parser;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\AssessmentItem;
use Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction\ChoiceInteraction;
use Qti3\AssessmentItem\Model\Stylesheet\Stylesheet;
use Qti3\AssessmentItem\Service\Parser\AssessmentItemParser;
use Qti3\AssessmentItem\Service\Parser\FeedbackBlockParser;
use Qti3\AssessmentItem\Service\Parser\InteractionParser;
use Qti3\AssessmentItem\Service\Parser\ItemBodyParser;
use Qti3\AssessmentItem\Service\Parser\OutcomeDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\AssessmentItem\Service\Parser\ProcessingElementParser;
use Qti3\AssessmentItem\Service\Parser\QtiExpressionParser;
use Qti3\AssessmentItem\Service\Parser\ResponseDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ResponseProcessingParser;
use Qti3\AssessmentItem\Service\Parser\RubricBlockParser;
use Qti3\AssessmentItem\Service\Parser\ModalFeedbackParser;
use Qti3\AssessmentItem\Service\Parser\StylesheetParser;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;

class AssessmentItemParserTest extends TestCase
{
    private AssessmentItemParser $parser;

    protected function setUp(): void
    {
        $this->parser = new AssessmentItemParser(
            new ResponseDeclarationParser(),
            new OutcomeDeclarationParser(),
            new ItemBodyParser(
                new InteractionParser(),
                new RubricBlockParser(),
                new FeedbackBlockParser(),
            ),
            new ResponseProcessingParser(
                new ProcessingElementParser(
                    new QtiExpressionParser(),
                ),
            ),
            new StylesheetParser(),
            new ModalFeedbackParser(new StylesheetParser()),
        );
    }

    private function loadElement(string $xml): DOMElement
    {
        $doc = new DOMDocument();
        $doc->loadXML($xml);
        return $doc->documentElement;
    }

    #[Test]
    public function parseFullItem(): void
    {
        $element = $this->loadElement('
            <qti-assessment-item identifier="item-full" title="Full Item">
                <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
                    <qti-correct-response>
                        <qti-value>A</qti-value>
                    </qti-correct-response>
                </qti-response-declaration>
                <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
                <qti-stylesheet href="style.css"/>
                <qti-item-body>
                    <div>Question text</div>
                    <qti-choice-interaction response-identifier="RESPONSE">
                        <qti-simple-choice identifier="A">Answer A</qti-simple-choice>
                    </qti-choice-interaction>
                </qti-item-body>
                <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"/>
            </qti-assessment-item>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(AssessmentItem::class, $result);
        $this->assertSame('item-full', (string) $result->identifier);
        $this->assertSame('Full Item', $result->title);

        $this->assertCount(1, $result->responseDeclarations);
        $responseDecl = $result->responseDeclarations->all()[0];
        $this->assertSame('RESPONSE', $responseDecl->identifier);
        $this->assertSame(Cardinality::SINGLE, $responseDecl->cardinality);
        $this->assertSame(BaseType::IDENTIFIER, $responseDecl->baseType);

        $this->assertCount(1, $result->outcomeDeclarations);
        $this->assertSame('SCORE', $result->outcomeDeclarations->all()[0]->identifier);

        $this->assertCount(2, $result->itemBody->content);
        $interaction = $result->itemBody->content->all()[1];
        $this->assertInstanceOf(ChoiceInteraction::class, $interaction);

        $this->assertNotNull($result->responseProcessing);
    }

    #[Test]
    public function parseMissingItemBodyThrows(): void
    {
        $element = $this->loadElement('
            <qti-assessment-item identifier="item-no-body" title="No Body">
                <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/>
            </qti-assessment-item>
        ');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('AssessmentItem must contain an itemBody');

        $this->parser->parse($element);
    }

    #[Test]
    public function parseMinimalItem(): void
    {
        $element = $this->loadElement('
            <qti-assessment-item identifier="item-minimal">
                <qti-item-body>
                    <div>Minimal content</div>
                </qti-item-body>
            </qti-assessment-item>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(AssessmentItem::class, $result);
        $this->assertSame('item-minimal', (string) $result->identifier);
        $this->assertSame('', $result->title);
        $this->assertCount(0, $result->responseDeclarations);
        $this->assertCount(0, $result->outcomeDeclarations);
        $this->assertNull($result->responseProcessing);
        $this->assertCount(1, $result->itemBody->content);
    }

    #[Test]
    public function parseMissingIdentifierGeneratesOne(): void
    {
        $element = $this->loadElement('
            <qti-assessment-item>
                <qti-item-body>
                    <div>Content</div>
                </qti-item-body>
            </qti-assessment-item>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(AssessmentItem::class, $result);
        $this->assertStringStartsWith('item-', (string) $result->identifier);
    }

    #[Test]
    public function parseWrongTagThrows(): void
    {
        $element = $this->loadElement('<wrong-tag/>');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Expected tag "qti-assessment-item", got "wrong-tag"');

        $this->parser->parse($element);
    }
}
