<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction;

use Qti3\AssessmentItem\Model\Interaction\Prompt;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class PromptTest extends TestCase
{
    #[Test]
    public function childrenReturnsTheContentNodes(): void
    {
        $textNode1 = new TextNode('First node');
        $textNode2 = new TextNode('Second node');
        $content = new ContentNodeCollection([$textNode1, $textNode2]);
        $prompt = new Prompt($content);

        $children = $prompt->children();

        $this->assertCount(2, $children);
        $this->assertSame($textNode1, $children[0]);
        $this->assertSame($textNode2, $children[1]);
    }
}
