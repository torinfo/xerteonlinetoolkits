<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Validator;

use Qti3\AssessmentItem\Service\ResponseProcessor;
use Qti3\Package\Validator\QtiPackageValidationError;
use Qti3\Package\Validator\ResponseProcessingValidator;
use Qti3\Shared\Collection\StringCollection;
use Qti3\Tests\Unit\Package\Model\QtiPackageMock;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class ResponseProcessingValidatorTest extends TestCase
{
    private MockObject $responseProcessor;
    private ResponseProcessingValidator $validator;

    protected function setUp(): void
    {
        $this->responseProcessor = $this->createMock(ResponseProcessor::class);
        $this->validator = new ResponseProcessingValidator($this->responseProcessor);
    }

    #[Test]
    public function validateReturnsNoErrorsWhenItemProcessingSucceeds(): void
    {
        $qtiPackage = new QtiPackageMock();

        $errors = $this->validator->validate($qtiPackage);

        $this->assertCount(0, $errors);
    }

    #[Test]
    public function validateReturnsValidationErrorsFromQtiPackageValidationError(): void
    {
        $qtiPackage = new QtiPackageMock();

        $exception = new QtiPackageValidationError(new StringCollection(['Invalid responseProcessing']));

        $this->responseProcessor
            ->method('initItemState')
            ->willThrowException($exception);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertEquals([
            'test-item1.xml: Invalid responseProcessing',
            'test-item2.xml: Invalid responseProcessing',
            'test-item3.xml: Invalid responseProcessing',
            'test-item4.xml: Invalid responseProcessing',
            'test-item5.xml: Invalid responseProcessing',
        ], iterator_to_array($errors));
    }

    #[Test]
    public function validateReturnsGenericExceptionMessage(): void
    {
        $qtiPackage = new QtiPackageMock();

        $this->responseProcessor
            ->method('initItemState')
            ->willThrowException(new RuntimeException('Unexpected error'));

        $errors = $this->validator->validate($qtiPackage);

        $this->assertEquals([
            'test-item1.xml: Unexpected error',
            'test-item2.xml: Unexpected error',
            'test-item3.xml: Unexpected error',
            'test-item4.xml: Unexpected error',
            'test-item5.xml: Unexpected error',
        ], iterator_to_array($errors));
    }
}
