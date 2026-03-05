<?php

declare(strict_types=1);

namespace Qti3\Tests\Integration;

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\AssessmentItem;
use Qti3\AssessmentItem\Model\Interaction\ChoiceInteraction\ChoiceInteraction;
use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\MatchInteraction;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseCondition;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;

#[Group('integration')]
class ItemParserIntegrationTest extends TestCase
{
    use QtiClientTestCaseTrait;

    protected function setUp(): void
    {
        $this->setUpQtiClientTestCase();
    }

    protected function tearDown(): void
    {
        $this->tearDownQtiClientTestCase();
    }

    private function parseFixture(string $filename): AssessmentItem
    {
        $xml = file_get_contents(__DIR__ . '/../Unit/AssessmentItem/Service/resources/' . $filename);
        $client = $this->createClient();
        $dom = $client->getXmlReader()->read($xml);
        return $client->getAssessmentItemParser()->parse($dom->documentElement);
    }

    /**
     * simple-choice-processing.xml: a real single-choice item with a stylesheet,
     * custom response processing, and multiple outcome declarations.
     */
    public function testParseSimpleChoiceItemFromFixture(): void
    {
        $item = $this->parseFixture('simple-choice-processing.xml');

        $this->assertInstanceOf(AssessmentItem::class, $item);
        $this->assertSame('Meerkeuze', $item->title);

        // Response declaration
        $this->assertCount(1, $item->responseDeclarations);
        $rd = $item->responseDeclarations->all()[0];
        $this->assertSame('RESPONSE', $rd->identifier);
        $this->assertSame(Cardinality::SINGLE, $rd->cardinality);
        $this->assertSame(BaseType::IDENTIFIER, $rd->baseType);
        $this->assertSame('CHOICE1', (string) $rd->correctResponse->values[0]);

        // Outcome declarations: SCORE, MAXSCORE, FEEDBACK
        $this->assertCount(3, $item->outcomeDeclarations);

        // Item body: single choice interaction
        $body = $item->itemBody->content->all();
        $this->assertCount(1, $body);
        $interaction = $body[0];
        $this->assertInstanceOf(ChoiceInteraction::class, $interaction);
        $this->assertSame('RESPONSE', $interaction->responseIdentifier);
        $this->assertFalse($interaction->shuffle);
        $this->assertSame(1, $interaction->maxChoices);
        $this->assertCount(2, $interaction->choices);
        $this->assertNotNull($interaction->prompt);

        // Custom response processing with two conditions
        $this->assertNotNull($item->responseProcessing);
        $this->assertCount(2, $item->responseProcessing->elements);
        $this->assertInstanceOf(ResponseCondition::class, $item->responseProcessing->elements[0]);
        $this->assertInstanceOf(ResponseCondition::class, $item->responseProcessing->elements[1]);
    }

    /**
     * gap-match-no-processing.xml: a real match interaction item with a mapping
     * on the response declaration and an empty response processing element.
     */
    public function testParseMatchInteractionItemFromFixture(): void
    {
        $item = $this->parseFixture('gap-match-no-processing.xml');

        $this->assertInstanceOf(AssessmentItem::class, $item);
        $this->assertSame('Celleer', $item->title);

        // Response declaration with correct response and mapping
        $this->assertCount(1, $item->responseDeclarations);
        $rd = $item->responseDeclarations->all()[0];
        $this->assertSame('RESPONSE', $rd->identifier);
        $this->assertSame(Cardinality::MULTIPLE, $rd->cardinality);
        $this->assertSame(BaseType::DIRECTED_PAIR, $rd->baseType);
        $this->assertCount(7, $rd->correctResponse->values);
        $this->assertNotNull($rd->mapping);
        $this->assertCount(7, $rd->mapping->entries);

        // Outcome declarations: SCORE, MAXSCORE, FEEDBACK
        $this->assertCount(3, $item->outcomeDeclarations);

        // Item body: div + match interaction
        $body = $item->itemBody->content->all();
        $this->assertCount(2, $body);
        $interaction = $body[1];
        $this->assertInstanceOf(MatchInteraction::class, $interaction);
        $this->assertSame('RESPONSE', $interaction->responseIdentifier);
        $this->assertTrue($interaction->shuffle);
        $this->assertCount(7, $interaction->simpleMatchSet1->choices);
        $this->assertCount(7, $interaction->simpleMatchSet2->choices);

        // Response processing with a single condition (intentionally non-empty so the
        // AssessmentItemDeterminator classifies this item as type "question").
        $this->assertNotNull($item->responseProcessing);
        $this->assertInstanceOf(ResponseProcessing::class, $item->responseProcessing);
        $this->assertCount(1, $item->responseProcessing->elements);
        $this->assertInstanceOf(ResponseCondition::class, $item->responseProcessing->elements[0]);
    }

    /**
     * item001.xml: a real item with a match interaction, mapping on the response
     * declaration, feedback blocks with <qti-content-body> wrappers, and complex
     * multi-condition custom response processing.
     *
     * NOTE: parsing fails at the item-body level because FeedbackBlockParser
     * passes <qti-content-body> to HTMLTag, which rejects it as an invalid tag
     * name. This is tracked in GitHub issue #4. Once that bug is fixed this test
     * should be expanded to also assert on item body and response processing.
     */
    public function testParseItemWithFeedbackBlocksFailsDueToContentBodyBug(): void
    {
        $this->markTestIncomplete(
            'Blocked by bug #4: FeedbackBlockParser cannot handle <qti-content-body> wrapper.'
        );
    }
}
