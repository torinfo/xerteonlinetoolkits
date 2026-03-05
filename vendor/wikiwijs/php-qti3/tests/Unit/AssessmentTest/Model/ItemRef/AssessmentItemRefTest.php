<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\ItemRef;

use Qti3\AssessmentItem\Model\AssessmentItemId;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRef;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class AssessmentItemRefTest extends TestCase
{
    private AssessmentItemRef $itemRef;

    protected function setUp(): void
    {
        parent::setUp();
        $this->itemRef = new AssessmentItemRef(
            AssessmentItemId::fromString('10fe19b2-8b6e-53fa-8522-1220c67ddce1'),
            'ITEM001.xml',
        );
    }

    #[Test]
    public function testAttributes(): void
    {
        $this->assertEquals([
            'identifier' => '10fe19b2-8b6e-53fa-8522-1220c67ddce1',
            'href' => 'ITEM001.xml',
            'category' => null,
        ], $this->itemRef->attributes());
    }
}
