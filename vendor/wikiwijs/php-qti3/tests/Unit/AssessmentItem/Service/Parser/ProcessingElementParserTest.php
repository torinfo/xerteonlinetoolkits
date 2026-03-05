<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service\Parser;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\ResponseProcessing\MapResponse;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseCondition;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\AssessmentItem\Service\Parser\ProcessingElementParser;
use Qti3\AssessmentItem\Service\Parser\QtiExpressionParser;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\Correct;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\qtiMatch;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;

class ProcessingElementParserTest extends TestCase
{
    private ProcessingElementParser $parser;

    protected function setUp(): void
    {
        $this->parser = new ProcessingElementParser(new QtiExpressionParser());
    }

    private function loadElement(string $xml): DOMElement
    {
        $doc = new DOMDocument();
        $doc->loadXML($xml);
        return $doc->documentElement;
    }

    #[Test]
    public function parseSetOutcomeValue(): void
    {
        $element = $this->loadElement('
            <qti-set-outcome-value identifier="SCORE">
                <qti-base-value base-type="float">1</qti-base-value>
            </qti-set-outcome-value>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(SetOutcomeValue::class, $result);
        $this->assertSame('SCORE', $result->identifier);
        $this->assertInstanceOf(BaseValue::class, $result->value);
        $this->assertSame(BaseType::FLOAT, $result->value->baseType);
        $this->assertSame('1', $result->value->value);
    }

    #[Test]
    public function parseResponseConditionWithIfAndElse(): void
    {
        $element = $this->loadElement('
            <qti-response-condition>
                <qti-response-if>
                    <qti-match>
                        <qti-variable identifier="RESPONSE"/>
                        <qti-correct identifier="RESPONSE"/>
                    </qti-match>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">1</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-if>
                <qti-response-else>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">0</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-else>
            </qti-response-condition>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(ResponseCondition::class, $result);

        // if condition: qti-match(variable, correct)
        $this->assertInstanceOf(qtiMatch::class, $result->if->condition);
        $this->assertInstanceOf(Variable::class, $result->if->condition->expression1);
        $this->assertSame('RESPONSE', $result->if->condition->expression1->identifier);
        $this->assertInstanceOf(Correct::class, $result->if->condition->expression2);
        $this->assertSame('RESPONSE', $result->if->condition->expression2->identifier);

        // if body: set SCORE = 1
        $this->assertCount(1, $result->if->processingElements);
        $this->assertInstanceOf(SetOutcomeValue::class, $result->if->processingElements[0]);
        $this->assertSame('SCORE', $result->if->processingElements[0]->identifier);

        // else body: set SCORE = 0
        $this->assertNotNull($result->else);
        $this->assertCount(1, $result->else->processingElements);
        $this->assertInstanceOf(SetOutcomeValue::class, $result->else->processingElements[0]);
        $this->assertSame('SCORE', $result->else->processingElements[0]->identifier);

        // no else-ifs
        $this->assertCount(0, $result->elseIfs);
    }

    #[Test]
    public function parseResponseConditionWithElseIf(): void
    {
        $element = $this->loadElement('
            <qti-response-condition>
                <qti-response-if>
                    <qti-is-null>
                        <qti-variable identifier="RESPONSE"/>
                    </qti-is-null>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">0</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-if>
                <qti-response-else-if>
                    <qti-match>
                        <qti-variable identifier="RESPONSE"/>
                        <qti-correct identifier="RESPONSE"/>
                    </qti-match>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">1</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-else-if>
                <qti-response-else>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">0</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-else>
            </qti-response-condition>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(ResponseCondition::class, $result);
        $this->assertInstanceOf(IsNull::class, $result->if->condition);
        $this->assertCount(1, $result->elseIfs);
        $this->assertInstanceOf(qtiMatch::class, $result->elseIfs[0]->condition);
        $this->assertNotNull($result->else);
    }

    #[Test]
    public function parseResponseConditionWithMapResponseInElse(): void
    {
        $element = $this->loadElement('
            <qti-response-condition>
                <qti-response-if>
                    <qti-is-null>
                        <qti-variable identifier="RESPONSE"/>
                    </qti-is-null>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">0</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-if>
                <qti-response-else>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-map-response identifier="RESPONSE"/>
                    </qti-set-outcome-value>
                </qti-response-else>
            </qti-response-condition>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(ResponseCondition::class, $result);
        $this->assertNotNull($result->else);
        $elseSet = $result->else->processingElements[0];
        $this->assertInstanceOf(SetOutcomeValue::class, $elseSet);
        $this->assertInstanceOf(MapResponse::class, $elseSet->value);
        $this->assertSame('RESPONSE', $elseSet->value->identifier);
    }

    #[Test]
    public function parseElseIfAfterElseThrows(): void
    {
        $element = $this->loadElement('
            <qti-response-condition>
                <qti-response-if>
                    <qti-variable identifier="RESPONSE"/>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">1</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-if>
                <qti-response-else>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">0</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-else>
                <qti-response-else-if>
                    <qti-variable identifier="RESPONSE"/>
                    <qti-set-outcome-value identifier="SCORE">
                        <qti-base-value base-type="float">0</qti-base-value>
                    </qti-set-outcome-value>
                </qti-response-else-if>
            </qti-response-condition>
        ');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Unexpected else if');

        $this->parser->parse($element);
    }

    #[Test]
    public function parseUnknownTagThrows(): void
    {
        $element = $this->loadElement('<qti-unknown-element/>');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Unknown processing element qti-unknown-element');

        $this->parser->parse($element);
    }
}
