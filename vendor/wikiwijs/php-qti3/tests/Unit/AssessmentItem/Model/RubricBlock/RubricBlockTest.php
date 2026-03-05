<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\RubricBlock;

use Qti3\AssessmentItem\Model\RubricBlock\qtiUse;
use Qti3\AssessmentItem\Model\RubricBlock\RubricBlock;
use Qti3\AssessmentItem\Model\RubricBlock\View;
use Qti3\Shared\Model\ContentBody;
use Qti3\Shared\Model\ContentNodeCollection;
use Qti3\Shared\Model\TextNode;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class RubricBlockTest extends TestCase
{
    private RubricBlock $rubricBlock;

    protected function setUp(): void
    {
        parent::setUp();

        $this->rubricBlock = new RubricBlock(
            use: qtiUse::INSTRUCTIONS,
            view: View::TUTOR,
            contentBody: new ContentBody(new ContentNodeCollection([new TextNode('contentBody')])),
            class: 'test',
        );
    }

    #[Test]
    public function testRubricBlock(): void
    {
        $expectedAttributes = [
            'use' => 'instructions',
            'view' => 'tutor',
            'class' => 'test',
        ];

        $this->assertEquals($expectedAttributes, $this->rubricBlock->attributes());
        $this->assertInstanceOf(ContentBody::class, $this->rubricBlock->children()[0]);
    }
}
