<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\TestPart;

use Qti3\AssessmentTest\Model\Section\AssessmentSectionCollection;
use Qti3\AssessmentTest\Model\TestPart\NavigationMode;
use Qti3\AssessmentTest\Model\TestPart\SubmissionMode;
use Qti3\AssessmentTest\Model\TestPart\TestPart;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class TestPartTest extends TestCase
{
    private TestPart $testPart;

    protected function setUp(): void
    {
        $this->testPart = new TestPart(
            'id',
            NavigationMode::LINEAR,
            SubmissionMode::INDIVIDUAL,
            new AssessmentSectionCollection(),
        );
    }

    #[Test]
    public function anIdentifierCanBeRetrieved(): void
    {
        $this->assertSame('id', $this->testPart->identifier);
    }
}
