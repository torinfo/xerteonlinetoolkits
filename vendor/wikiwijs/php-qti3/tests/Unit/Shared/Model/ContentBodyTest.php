<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model;

use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ContentBodyTest extends TestCase
{
    private ContentBody $contentBody;
    private TextNode $textNode;

    protected function setUp(): void
    {
        $this->textNode = new TextNode('test');
        $this->contentBody = new ContentBody(new ContentNodeCollection([$this->textNode]));
    }

    #[Test]
    public function constructorInitializesValueCorrectly(): void
    {
        $this->assertInstanceOf(TextNode::class, $this->contentBody->children()[0]);
        $this->assertEquals('test', (string) $this->contentBody->children()[0]);
    }
}
