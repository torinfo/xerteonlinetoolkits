<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\State;

use Qti3\AssessmentItem\Model\ResponseDeclaration\CorrectResponse;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclaration;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclarationCollection;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\Value;
use Qti3\AssessmentItem\Model\State\ResponseSet;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResponseSetTest extends TestCase
{
    private ResponseSet $responseSet;
    private ResponseDeclarationCollection $responseDeclarations;

    protected function setUp(): void
    {
        $this->responseDeclarations = new ResponseDeclarationCollection([]);
        $this->responseSet = new ResponseSet($this->responseDeclarations);
    }

    #[Test]
    public function testGetCorrectResponse(): void
    {
        // Arrange
        $correctResponse = new CorrectResponse([new Value('correct')]);
        $responseDeclaration = new ResponseDeclaration(
            BaseType::STRING,
            Cardinality::SINGLE,
            'test',
            $correctResponse,
        );
        $this->responseDeclarations->add($responseDeclaration);

        // Act
        $result = $this->responseSet->getCorrectResponse('test');

        // Assert
        $this->assertEquals('correct', $result);
    }

    #[Test]
    public function testGetCorrectResponseWithNoCorrectResponse(): void
    {
        // Arrange
        $responseDeclaration = new ResponseDeclaration(
            BaseType::STRING,
            Cardinality::SINGLE,
            'test',
        );
        $this->responseDeclarations->add($responseDeclaration);

        // Act & Assert
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Correct response for response declaration with identifier test not found');
        $this->responseSet->getCorrectResponse('test');
    }
}
