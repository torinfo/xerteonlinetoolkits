<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model;

use Qti3\AssessmentItem\Model\AssessmentItemId;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class AssessmentItemIdTest extends TestCase
{
    private string $validUuid;

    protected function setUp(): void
    {
        $this->validUuid = '8394af58-8757-41b3-91e5-5534ec7a8175';
    }

    #[Test]
    public function aValidAssessmentItemIdCanBeCreatedFromAnArbitraryString(): void
    {
        $assessmentItemId = AssessmentItemId::fromString('arbitrary-string-123');

        $this->assertInstanceOf(AssessmentItemId::class, $assessmentItemId);
        $this->assertEquals('arbitrary-string-123', (string) $assessmentItemId);
    }

    #[Test]
    public function aValidAssessmentItemIdCanBeCreatedFromAUuid(): void
    {
        $assessmentItemId = AssessmentItemId::fromString($this->validUuid);

        $this->assertInstanceOf(AssessmentItemId::class, $assessmentItemId);
        $this->assertTrue(AssessmentItemId::isValid((string) $assessmentItemId));
    }


    #[Test]
    public function aAssessmentItemIdIsInvalidWhenEmpty(): void
    {
        $invalidValue = '';

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('The provided value `` is invalid');

        AssessmentItemId::fromString($invalidValue);
    }
}
