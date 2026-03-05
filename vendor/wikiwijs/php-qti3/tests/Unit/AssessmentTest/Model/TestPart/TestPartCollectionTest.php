<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\TestPart;

use Qti3\AssessmentTest\Model\TestPart\TestPart;
use Qti3\AssessmentTest\Model\TestPart\TestPartCollection;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class TestPartCollectionTest extends TestCase
{
    private TestPartCollection $collection;

    protected function setUp(): void
    {
        $this->collection = new TestPartCollection();
    }

    #[Test]
    public function itShouldReturnTestPartClassAsType(): void
    {
        $this->assertEquals(TestPart::class, $this->collection->getType());
    }
}
