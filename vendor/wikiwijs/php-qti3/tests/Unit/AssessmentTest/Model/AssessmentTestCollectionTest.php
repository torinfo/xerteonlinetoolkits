<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model;

use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\AssessmentTest\Model\AssessmentTestCollection;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class AssessmentTestCollectionTest extends TestCase
{
    private AssessmentTestCollection $collection;

    protected function setUp(): void
    {
        parent::setUp();

        $this->collection = new AssessmentTestCollection();
    }

    #[Test]
    public function itShouldReturnAssessmentTestClassAsType(): void
    {
        $this->assertEquals(AssessmentTest::class, $this->collection->getType());
    }
}
