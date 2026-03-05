<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\PackageFile;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Shared\Xml\Reader\XmlReader;
use DOMDocument;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class XmlFileTest extends TestCase
{
    private MemoryFileContent $content;
    private XmlReader $xmlReader;

    protected function setUp(): void
    {
        $this->content = new MemoryFileContent('content');
        $this->xmlReader = new XmlReader();
    }

    #[Test]
    public function aXmlFilenameCanBeGiven(): void
    {
        $xmlFile = new XmlFile('test.xml', $this->content, $this->xmlReader);

        $this->assertEquals('test.xml', $xmlFile->getFilepath());
    }

    #[Test]
    public function aNonXmlFilenameThrowsException(): void
    {
        $this->expectException(InvalidArgumentException::class);

        new XmlFile('test.tst', $this->content, $this->xmlReader);
    }

    #[Test]
    public function aTextWithSpecialCharactersWillBeConvertedToXmlEntities(): void
    {
        $xmlDocument = new DOMDocument();
        $node = $xmlDocument->createElement('test');
        $node->textContent = 'x < y & y > z & "z ≥ w" & \' w ≤ x \'';
        $xmlDocument->append($node);
        $xmlFile = new XmlFile('test.xml', new MemoryFileContent($xmlDocument->saveXML()), $this->xmlReader);

        $this->assertStringContainsString(
            'x &lt; y &amp; y &gt; z &amp; "z &#x2265; w" &amp; \' w &#x2264; x \'',
            (string) $xmlFile,
        );
    }
}
