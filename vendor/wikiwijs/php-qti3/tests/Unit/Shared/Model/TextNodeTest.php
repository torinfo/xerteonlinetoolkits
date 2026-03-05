<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model;

use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class TextNodeTest extends TestCase
{
    private TextNode $htmlText;

    protected function setUp(): void
    {
        $this->htmlText = new TextNode('<p>Test</p>');
    }

    #[Test]
    public function aHTMLTextCanBeCasedToString(): void
    {
        $this->assertEquals('<p>Test</p>', $this->htmlText->__toString());
    }

    #[Test]
    public function getContentForXmlReturnsContent(): void
    {
        $this->assertSame('<p>Test</p>', $this->htmlText->getContentForXml());
    }
}
