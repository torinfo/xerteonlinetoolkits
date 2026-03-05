<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service\Parser;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction\ChoiceInteraction;
use Qti3\AssessmentItem\Model\Interaction\ExtendedTextInteraction\ExtendedTextInteraction;
use Qti3\AssessmentItem\Model\Interaction\GapMatchInteraction\GapMatchInteraction;
use Qti3\AssessmentItem\Model\Interaction\HotspotInteraction\HotspotInteraction;
use Qti3\AssessmentItem\Model\Interaction\HottextInteraction\HottextInteraction;
use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\MatchInteraction;
use Qti3\AssessmentItem\Model\Interaction\OrderInteraction\OrderInteraction;
use Qti3\AssessmentItem\Model\Interaction\OrderInteraction\Orientation;
use Qti3\AssessmentItem\Model\Interaction\SelectPointInteraction\SelectPointInteraction;
use Qti3\AssessmentItem\Model\Interaction\TextEntryInteraction\TextEntryInteraction;
use Qti3\AssessmentItem\Model\Shape\ShapeName;
use Qti3\AssessmentItem\Service\Parser\InteractionParser;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\Shared\Model\TextNode;

class InteractionParserTest extends TestCase
{
    private InteractionParser $parser;

    protected function setUp(): void
    {
        $this->parser = new InteractionParser();
    }

    private function loadElement(string $xml): DOMElement
    {
        $doc = new DOMDocument();
        $doc->loadXML($xml);
        return $doc->documentElement;
    }

    #[Test]
    public function parseChoiceInteraction(): void
    {
        $element = $this->loadElement('
            <qti-choice-interaction response-identifier="RESPONSE_1" shuffle="true" max-choices="2">
                <qti-simple-choice identifier="A">Answer A</qti-simple-choice>
                <qti-simple-choice identifier="B">Answer B</qti-simple-choice>
                <qti-simple-choice identifier="C">Answer C</qti-simple-choice>
            </qti-choice-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(ChoiceInteraction::class, $result);
        $this->assertSame('RESPONSE_1', $result->responseIdentifier);
        $this->assertTrue($result->shuffle);
        $this->assertSame(2, $result->maxChoices);
        $this->assertCount(3, $result->choices);
        $this->assertSame('A', $result->choices[0]->identifier);
        $this->assertSame('B', $result->choices[1]->identifier);
        $this->assertSame('C', $result->choices[2]->identifier);
        $this->assertInstanceOf(TextNode::class, $result->choices[0]->content->all()[0]);
        $this->assertSame('Answer A', $result->choices[0]->content->all()[0]->content);
    }

    #[Test]
    public function parseChoiceInteractionWithPrompt(): void
    {
        $element = $this->loadElement('
            <qti-choice-interaction response-identifier="RESPONSE">
                <qti-prompt>Choose the correct answer</qti-prompt>
                <qti-simple-choice identifier="A">Answer A</qti-simple-choice>
            </qti-choice-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(ChoiceInteraction::class, $result);
        $this->assertNotNull($result->prompt);
        $this->assertSame('Choose the correct answer', $result->prompt->content->all()[0]->content);
        $this->assertCount(1, $result->choices);
    }

    #[Test]
    public function parseChoiceInteractionDefaults(): void
    {
        $element = $this->loadElement('
            <qti-choice-interaction>
                <qti-simple-choice identifier="A">Answer</qti-simple-choice>
            </qti-choice-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(ChoiceInteraction::class, $result);
        $this->assertSame('RESPONSE', $result->responseIdentifier);
        $this->assertFalse($result->shuffle);
        $this->assertSame(1, $result->maxChoices);
    }

    #[Test]
    public function parseTextEntryInteraction(): void
    {
        $element = $this->loadElement('
            <qti-text-entry-interaction response-identifier="RESPONSE_TEXT"/>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(TextEntryInteraction::class, $result);
        $this->assertSame('RESPONSE_TEXT', $result->responseIdentifier);
    }

    #[Test]
    public function parseExtendedTextInteraction(): void
    {
        $element = $this->loadElement('
            <qti-extended-text-interaction response-identifier="RESPONSE_EXT">
                <qti-prompt>Write your essay</qti-prompt>
            </qti-extended-text-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(ExtendedTextInteraction::class, $result);
        $this->assertSame('RESPONSE_EXT', $result->responseIdentifier);
        $this->assertNotNull($result->prompt);
        $this->assertSame('Write your essay', $result->prompt->content->all()[0]->content);
    }

    #[Test]
    public function parseGapMatchInteraction(): void
    {
        $element = $this->loadElement('
            <qti-gap-match-interaction response-identifier="RESPONSE_GAP" shuffle="true" max-associations="3" min-associations="1">
                <p>Fill in the blanks.</p>
            </qti-gap-match-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(GapMatchInteraction::class, $result);
        $this->assertSame('RESPONSE_GAP', $result->responseIdentifier);
        $this->assertTrue($result->shuffle);
        $this->assertSame(3, $result->maxAssociations);
        $this->assertSame(1, $result->minAssociations);
        $this->assertGreaterThan(0, count($result->content));
    }

    #[Test]
    public function parseHotspotInteraction(): void
    {
        $element = $this->loadElement('
            <qti-hotspot-interaction response-identifier="RESPONSE_HS" max-choices="2">
                <img src="map.png" alt="A map"/>
                <qti-hotspot-choice identifier="hs1" shape="rect" coords="0,0,100,100"/>
                <qti-hotspot-choice identifier="hs2" shape="circle" coords="200,200,50"/>
            </qti-hotspot-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(HotspotInteraction::class, $result);
        $this->assertSame('RESPONSE_HS', $result->responseIdentifier);
        $this->assertSame(2, $result->maxChoices);
        $this->assertSame('img', $result->image->tagName());
        $this->assertCount(2, $result->choices);
        $this->assertSame('hs1', $result->choices[0]->identifier);
        $this->assertSame(ShapeName::RECTANGLE, $result->choices[0]->shape->name());
        $this->assertSame('hs2', $result->choices[1]->identifier);
        $this->assertSame(ShapeName::CIRCLE, $result->choices[1]->shape->name());
    }

    #[Test]
    public function parseHotspotInteractionWithoutImage(): void
    {
        // Blocked by bug #6: the missing-image fallback creates new HTMLTag('img', [], [])
        // which immediately throws InvalidArgumentException because img requires alt+src.
        // Once fixed, the fallback should throw a descriptive ParseError instead, and this
        // test should assert that ParseError is thrown with a meaningful message.
        $this->markTestIncomplete(
            'Blocked by bug #6: missing-image fallback crashes with InvalidArgumentException ' .
            'instead of throwing a descriptive ParseError.'
        );
    }

    #[Test]
    public function parseHottextInteraction(): void
    {
        $element = $this->loadElement('
            <qti-hottext-interaction response-identifier="RESPONSE_HT" max-choices="2">
                <p>The cat sat on the mat.</p>
            </qti-hottext-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(HottextInteraction::class, $result);
        $this->assertSame('RESPONSE_HT', $result->responseIdentifier);
        $this->assertSame(2, $result->maxChoices);
        $this->assertGreaterThan(0, count($result->content));
    }

    #[Test]
    public function parseMatchInteraction(): void
    {
        $element = $this->loadElement('
            <qti-match-interaction response-identifier="RESPONSE_MATCH" shuffle="true" max-associations="4" class="matrix">
                <qti-simple-match-set>
                    <qti-simple-associable-choice identifier="S1">Source 1</qti-simple-associable-choice>
                    <qti-simple-associable-choice identifier="S2">Source 2</qti-simple-associable-choice>
                </qti-simple-match-set>
                <qti-simple-match-set>
                    <qti-simple-associable-choice identifier="T1">Target 1</qti-simple-associable-choice>
                    <qti-simple-associable-choice identifier="T2">Target 2</qti-simple-associable-choice>
                </qti-simple-match-set>
            </qti-match-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(MatchInteraction::class, $result);
        $this->assertSame('RESPONSE_MATCH', $result->responseIdentifier);
        $this->assertTrue($result->shuffle);
        $this->assertSame(4, $result->maxAssociations);
        $this->assertSame('matrix', $result->class);

        $this->assertCount(2, $result->simpleMatchSet1->choices);
        $this->assertSame('S1', $result->simpleMatchSet1->choices[0]->identifier);
        $this->assertSame('S2', $result->simpleMatchSet1->choices[1]->identifier);

        $this->assertCount(2, $result->simpleMatchSet2->choices);
        $this->assertSame('T1', $result->simpleMatchSet2->choices[0]->identifier);
        $this->assertSame('T2', $result->simpleMatchSet2->choices[1]->identifier);

        $content = $result->simpleMatchSet1->choices[0]->content->all();
        $this->assertInstanceOf(TextNode::class, $content[0]);
        $this->assertSame('Source 1', $content[0]->content);
    }

    #[Test]
    public function parseOrderInteraction(): void
    {
        $element = $this->loadElement('
            <qti-order-interaction response-identifier="RESPONSE_ORDER" shuffle="true" orientation="horizontal">
                <qti-simple-choice identifier="O1">First</qti-simple-choice>
                <qti-simple-choice identifier="O2">Second</qti-simple-choice>
                <qti-simple-choice identifier="O3">Third</qti-simple-choice>
            </qti-order-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(OrderInteraction::class, $result);
        $this->assertSame('RESPONSE_ORDER', $result->responseIdentifier);
        $this->assertTrue($result->shuffle);
        $this->assertSame(Orientation::HORIZONTAL, $result->orientation);
        $this->assertCount(3, $result->choices);
        $this->assertSame('O1', $result->choices[0]->identifier);
        $this->assertSame('O2', $result->choices[1]->identifier);
        $this->assertSame('O3', $result->choices[2]->identifier);
    }

    #[Test]
    public function parseSelectPointInteraction(): void
    {
        $element = $this->loadElement('
            <qti-select-point-interaction response-identifier="RESPONSE_SP" max-choices="3">
                <qti-prompt>Select points on the image</qti-prompt>
                <img src="diagram.png" alt="A diagram"/>
            </qti-select-point-interaction>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(SelectPointInteraction::class, $result);
        $this->assertSame('RESPONSE_SP', $result->responseIdentifier);
        $this->assertSame(3, $result->maxChoices);
        $this->assertNotNull($result->prompt);
        $this->assertSame('Select points on the image', $result->prompt->content->all()[0]->content);
        $this->assertSame('img', $result->image->tagName());
    }

    #[Test]
    public function parseUnsupportedInteractionThrows(): void
    {
        $element = $this->loadElement('<qti-unknown-interaction/>');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Unsupported interaction: qti-unknown-interaction');

        $this->parser->parse($element);
    }
}
