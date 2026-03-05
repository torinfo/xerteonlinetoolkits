<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model;

use Qti3\AssessmentTest\Model\AssessmentTestId;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class AssessmentTestIdTest extends TestCase
{
    #[Test]
    public function aValidAssessmentTestIdCanBeCreatedFromAnArbitraryString(): void
    {
        $assessmentTestId = AssessmentTestId::fromString('arbitrary-test-123');

        $this->assertInstanceOf(AssessmentTestId::class, $assessmentTestId);
        $this->assertEquals('arbitrary-test-123', (string) $assessmentTestId);
    }

    #[Test]
    public function aValidAssessmentTestIdCanBeCreatedFromAUuid(): void
    {
        $assessmentTestId =  AssessmentTestId::fromString('8394af58-8757-41b3-91e5-5534ec7a8175');

        $this->assertInstanceOf(AssessmentTestId::class, $assessmentTestId);
        $this->assertTrue(AssessmentTestId::isValid((string) $assessmentTestId));
    }


    #[Test]
    public function aAssessmentTestIdIsInvalidWhenEmpty(): void
    {
        $invalidValue = '';

        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('The provided value `` is invalid');

        AssessmentTestId::fromString($invalidValue);
    }
}
