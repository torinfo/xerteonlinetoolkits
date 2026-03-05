<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\Interaction\MatchInteraction;

use Qti3\AssessmentItem\Model\Interaction\MatchInteraction\SimpleAssociableChoice;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\IContentNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class SimpleAssociableChoiceTest extends TestCase
{
    private SimpleAssociableChoice $simpleAssociableChoice;
    private IContentNode $contentNode1;
    private IContentNode $contentNode2;

    protected function setUp(): void
    {
        $this->contentNode1 = $this->createMock(IContentNode::class);
        $this->contentNode2 = $this->createMock(IContentNode::class);
        $this->simpleAssociableChoice = new SimpleAssociableChoice(
            'CHOICE_1',
            new ContentNodeCollection([$this->contentNode1, $this->contentNode2]),
            3,
        );
    }

    #[Test]
    public function testAttributes(): void
    {
        $expectedAttributes = [
            'identifier' => 'CHOICE_1',
            'match-max' => '3',
        ];

        $this->assertSame($expectedAttributes, $this->simpleAssociableChoice->attributes());
    }

    #[Test]
    public function testChildren(): void
    {
        $expectedChildren = [
            $this->contentNode1,
            $this->contentNode2,
        ];

        $this->assertSame($expectedChildren, $this->simpleAssociableChoice->children());
    }
}
