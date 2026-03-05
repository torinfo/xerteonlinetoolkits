<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service\Parser;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Model\Stylesheet\Stylesheet;
use Qti3\AssessmentItem\Service\Parser\ParseError;
use Qti3\AssessmentItem\Service\Parser\StylesheetParser;

class StylesheetParserTest extends TestCase
{
    private StylesheetParser $parser;

    protected function setUp(): void
    {
        $this->parser = new StylesheetParser();
    }

    private function loadElement(string $xml): DOMElement
    {
        $doc = new DOMDocument();
        $doc->loadXML($xml);
        return $doc->documentElement;
    }

    #[Test]
    public function parseExtractsHref(): void
    {
        $element = $this->loadElement('<qti-stylesheet href="styles/custom.css"/>');

        $result = $this->parser->parse($element);

        $this->assertInstanceOf(Stylesheet::class, $result);
        $this->assertSame('styles/custom.css', $result->filePath);
    }

    #[Test]
    public function parseWrongTagThrows(): void
    {
        $element = $this->loadElement('<wrong-tag href="style.css"/>');

        $this->expectException(ParseError::class);
        $this->expectExceptionMessage('Expected tag "qti-stylesheet", got "wrong-tag"');

        $this->parser->parse($element);
    }
}
