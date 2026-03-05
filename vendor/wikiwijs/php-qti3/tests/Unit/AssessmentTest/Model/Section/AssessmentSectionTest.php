<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\Section;

use Qti3\AssessmentItem\Model\AssessmentItemId;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRef;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRefCollection;
use Qti3\AssessmentTest\Model\Section\AssessmentSection;
use Qti3\AssessmentTest\Model\Section\Ordering;
use Qti3\AssessmentTest\Model\Section\Selection;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class AssessmentSectionTest extends TestCase
{
    private AssessmentSection $assessmentSection;

    protected function setUp(): void
    {
        parent::setUp();

        $itemRefs = new AssessmentItemRefCollection(
            [new AssessmentItemRef(
                identifier: AssessmentItemId::fromString('ITEM001'),
                href: 'ITEM001.xml',
            )],
        );
        $selection = new Selection(1, false);
        $ordering = new Ordering(true);

        $this->assessmentSection = new AssessmentSection(
            identifier: 'id',
            title: 'title',
            assessmentItemRefs: $itemRefs,
            selection: $selection,
            ordering: $ordering,
        );
    }

    #[Test]
    public function testAttributesAndChildren(): void
    {
        $this->assertSame(
            [
                'identifier' => 'id',
                'title' => 'title',
                'visible' => 'true',
            ],
            $this->assessmentSection->attributes(),
        );

        $this->assertSame(
            [
                $this->assessmentSection->selection,
                $this->assessmentSection->ordering,
                $this->assessmentSection->assessmentItemRefs[0],
            ],
            $this->assessmentSection->children(),
        );
    }
}
