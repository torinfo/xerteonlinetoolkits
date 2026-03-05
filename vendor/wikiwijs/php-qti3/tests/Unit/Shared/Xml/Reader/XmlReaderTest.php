<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Xml\Reader;

use DOMDocument;
use Qti3\Shared\Xml\Reader\XmlParsingException;
use Qti3\Shared\Xml\Reader\XmlReader;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class XmlReaderTest extends TestCase
{
    private XmlReader $xmlReader;

    protected function setUp(): void
    {
        $this->xmlReader = new XmlReader();
    }

    #[Test]
    public function readWithValidXmlReturnsDomDocument(): void
    {
        $xml = '<?xml version="1.0" encoding="UTF-8"?><root><child>text</child></root>';

        $result = $this->xmlReader->read($xml);

        $this->assertInstanceOf(DOMDocument::class, $result);
        $this->assertEquals('root', $result->documentElement->tagName);
    }

    #[Test]
    public function readWithInvalidXmlThrowsXmlParsingException(): void
    {
        $this->expectException(XmlParsingException::class);

        $this->xmlReader->read('<invalid><');
    }

    #[Test]
    public function readWithDtdThrowsXmlParsingException(): void
    {
        $this->expectException(XmlParsingException::class);
        $this->expectExceptionMessage('Document types are not allowed.');

        $xml = '<?xml version="1.0"?><!DOCTYPE foo SYSTEM "http://example.com/foo.dtd"><root/>';

        $this->xmlReader->read($xml);
    }
}
