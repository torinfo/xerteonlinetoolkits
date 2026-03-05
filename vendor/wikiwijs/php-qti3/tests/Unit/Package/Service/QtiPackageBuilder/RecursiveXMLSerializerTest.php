<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Service\QtiPackageBuilder;

use DOMDocument;
use Qti3\Package\Service\QtiPackageBuilder\RecursiveXMLSerializer;
use Qti3\Shared\Model\Comment;
use Qti3\Shared\Model\IXmlElement;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class RecursiveXMLSerializerTest extends TestCase
{
    #[Test]
    public function serializeWithCommentCreatesXmlComment(): void
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $serializer = new RecursiveXMLSerializer($dom);

        $comment = new Comment('This is a comment');
        $serializer->serialize($comment);

        $this->assertSame(1, $dom->childNodes->length);
        $this->assertSame(XML_COMMENT_NODE, $dom->childNodes->item(0)->nodeType);
        $this->assertSame('This is a comment', $dom->childNodes->item(0)->textContent);
    }

    #[Test]
    public function serializeWithTextNodeCreatesTextNode(): void
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $root = $dom->createElement('root');
        $dom->appendChild($root);

        $serializer = new RecursiveXMLSerializer($dom);

        $textNode = new TextNode('Some text content');
        $serializer->serialize($textNode, $root);

        $this->assertSame(1, $root->childNodes->length);
        $this->assertSame(XML_TEXT_NODE, $root->childNodes->item(0)->nodeType);
        $this->assertSame('Some text content', $root->childNodes->item(0)->textContent);
    }

    #[Test]
    public function serializeWithIXmlElementCreatesElement(): void
    {
        $dom = new DOMDocument('1.0', 'UTF-8');
        $serializer = new RecursiveXMLSerializer($dom);

        $element = $this->createMock(IXmlElement::class);
        $element->method('tagName')->willReturn('test-element');
        $element->method('attributes')->willReturn(['id' => 'abc', 'class' => 'test']);
        $element->method('children')->willReturn([]);

        $serializer->serialize($element);

        $this->assertSame(1, $dom->childNodes->length);
        $this->assertSame('test-element', $dom->childNodes->item(0)->tagName);
        $this->assertSame('abc', $dom->childNodes->item(0)->getAttribute('id'));
        $this->assertSame('test', $dom->childNodes->item(0)->getAttribute('class'));
    }
}
