<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service\Parser;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\ResponseProcessing\MapResponse;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\AssessmentItem\Service\Parser\QtiExpressionParser;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\Correct;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\qtiMatch;
use Qti3\Shared\Model\Processing\Variable;

class QtiExpressionParserTest extends TestCase
{
    private QtiExpressionParser $parser;

    protected function setUp(): void
    {
        $this->parser = new QtiExpressionParser();
    }

    private function loadElement(string $xml): DOMElement
    {
        $doc = new DOMDocument();
        $doc->loadXML($xml);
        return $doc->documentElement;
    }

    #[Test]
    public function parseVariable(): void
    {
        $element = $this->loadElement('<qti-variable identifier="RESPONSE"/>');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(Variable::class, $result);
        $this->assertSame('RESPONSE', $result->identifier);
    }

    #[Test]
    public function parseCorrect(): void
    {
        $element = $this->loadElement('<qti-correct identifier="RESPONSE"/>');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(Correct::class, $result);
        $this->assertSame('RESPONSE', $result->identifier);
    }

    #[Test]
    public function parseBaseValue(): void
    {
        $element = $this->loadElement('<qti-base-value base-type="float">1.5</qti-base-value>');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(BaseValue::class, $result);
        $this->assertSame(BaseType::FLOAT, $result->baseType);
        $this->assertSame('1.5', $result->value);
    }

    #[Test]
    public function parseMatch(): void
    {
        $element = $this->loadElement('
            <qti-match>
                <qti-variable identifier="RESPONSE"/>
                <qti-correct identifier="RESPONSE"/>
            </qti-match>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(qtiMatch::class, $result);
        $this->assertInstanceOf(Variable::class, $result->expression1);
        $this->assertSame('RESPONSE', $result->expression1->identifier);
        $this->assertInstanceOf(Correct::class, $result->expression2);
        $this->assertSame('RESPONSE', $result->expression2->identifier);
    }

    #[Test]
    public function parseIsNull(): void
    {
        $element = $this->loadElement('
            <qti-is-null>
                <qti-variable identifier="RESPONSE"/>
            </qti-is-null>
        ');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(IsNull::class, $result);
        $this->assertInstanceOf(Variable::class, $result->variable);
        $this->assertSame('RESPONSE', $result->variable->identifier);
    }

    #[Test]
    public function parseMapResponse(): void
    {
        $element = $this->loadElement('<qti-map-response identifier="RESPONSE"/>');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(MapResponse::class, $result);
        $this->assertSame('RESPONSE', $result->identifier);
    }

    #[Test]
    public function parseUnknownTagThrows(): void
    {
        $element = $this->loadElement('<qti-unknown-expression/>');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Unknown qti expression tag qti-unknown-expression');

        $this->parser->parse($element);
    }
}
