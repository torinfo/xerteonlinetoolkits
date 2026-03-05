<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\State;

use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclaration;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclarationCollection;
use Qti3\Package\Validator\QtiPackageValidationError;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclaration;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\AssessmentItem\Model\State\OutcomeSet;
use Qti3\AssessmentItem\Model\State\ResponseSet;
use Qti3\Shared\Collection\StringCollection;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

final class ItemStateTest extends TestCase
{
    #[Test]
    public function constructValidatesAndPassesWhenNoErrors(): void
    {
        $responseSet = $this->createResponseSetDouble();
        $outcomeSet = $this->createOutcomeSetDouble();

        /** @var ResponseProcessing&MockObject $responseProcessing */
        $responseProcessing = $this->createMock(ResponseProcessing::class);
        $emptyErrors = $this->createConfiguredMock(StringCollection::class, ['count' => 0]);
        $responseProcessing->method('validate')->willReturn($emptyErrors);

        $state = new ItemState($responseSet, $outcomeSet, $responseProcessing, adaptive: false);

        $this->assertFalse($state->adaptive);
    }

    #[Test]
    public function constructThrowsWhenValidationErrors(): void
    {
        $responseSet = $this->createResponseSetDouble();
        $outcomeSet = $this->createOutcomeSetDouble();

        /** @var ResponseProcessing&MockObject $responseProcessing */
        $responseProcessing = $this->createMock(ResponseProcessing::class);
        $errors = $this->createConfiguredMock(StringCollection::class, ['count' => 1]);
        $responseProcessing->method('validate')->willReturn($errors);

        $this->expectException(QtiPackageValidationError::class);

        new ItemState($responseSet, $outcomeSet, $responseProcessing);
    }

    #[Test]
    public function getValueResolvesFromResponseSetFirst(): void
    {
        /** @var ResponseSet&MockObject $responseSet */
        $responseSet = $this->createMock(ResponseSet::class);
        $responseSet->method('getResponseValue')->with('R1')->willReturn('foo');

        /** @var OutcomeSet&MockObject $outcomeSet */
        $outcomeSet = $this->createMock(OutcomeSet::class);
        $outcomeSet->expects($this->never())->method('getOutcomeValue');

        $rp = $this->createConfiguredMock(ResponseProcessing::class, [
            'validate' => $this->createConfiguredMock(StringCollection::class, ['count' => 0]),
        ]);

        $responseSet->responseDeclarations = $this->createMock(ResponseDeclarationCollection::class);
        $outcomeSet->outcomeDeclarations = $this->createMock(OutcomeDeclarationCollection::class);

        $state = new ItemState($responseSet, $outcomeSet, $rp);

        $this->assertSame('foo', $state->getValue('R1'));
    }

    #[Test]
    public function getValueFallsBackToOutcomeSetWhenResponseMissing(): void
    {
        /** @var ResponseSet&MockObject $responseSet */
        $responseSet = $this->createMock(ResponseSet::class);
        $responseSet
            ->method('getResponseValue')
            ->with('O1')
            ->willThrowException(new InvalidArgumentException('not found'));

        /** @var OutcomeSet&MockObject $outcomeSet */
        $outcomeSet = $this->createMock(OutcomeSet::class);
        $outcomeSet->method('getOutcomeValue')->with('O1')->willReturn(42);

        $responseSet->responseDeclarations = $this->createMock(ResponseDeclarationCollection::class);
        $outcomeSet->outcomeDeclarations = $this->createMock(OutcomeDeclarationCollection::class);

        $rp = $this->createConfiguredMock(ResponseProcessing::class, [
            'validate' => $this->createConfiguredMock(StringCollection::class, ['count' => 0]),
        ]);

        $state = new ItemState($responseSet, $outcomeSet, $rp);

        $this->assertSame(42, $state->getValue('O1'));
    }

    #[Test]
    public function getBaseTypePrefersResponseDeclarationAndFallsBackToOutcome(): void
    {
        $responseDecls = $this->createMock(ResponseDeclarationCollection::class);
        $responseDecls
            ->method('getByIdentifier')
            ->willReturnCallback(function(string $id): ResponseDeclaration {
                if ($id === 'R1') {
                    return $this->makeResponseDeclarationWithBaseType(BaseType::IDENTIFIER);
                }
                throw new InvalidArgumentException('not found');
            });

        $outcomeDecls = $this->createMock(OutcomeDeclarationCollection::class);
        $outcomeDecls
            ->method('getByIdentifier')
            ->willReturn($this->makeOutcomeDeclarationWithBaseType(BaseType::INTEGER));

        /** @var ResponseSet&MockObject $responseSet */
        $responseSet = $this->createMock(ResponseSet::class);
        $responseSet->responseDeclarations = $responseDecls;

        /** @var OutcomeSet&MockObject $outcomeSet */
        $outcomeSet = $this->createMock(OutcomeSet::class);
        $outcomeSet->outcomeDeclarations = $outcomeDecls;

        $rp = $this->createConfiguredMock(ResponseProcessing::class, [
            'validate' => $this->createConfiguredMock(StringCollection::class, ['count' => 0]),
        ]);

        $state = new ItemState($responseSet, $outcomeSet, $rp);

        $this->assertSame(BaseType::IDENTIFIER, $state->getBaseType('R1'));
        $this->assertSame(BaseType::INTEGER, $state->getBaseType('O1'));
    }

    #[Test]
    public function getCardinalityPrefersResponseDeclarationAndFallsBackToOutcome(): void
    {
        $responseDecls = $this->createMock(ResponseDeclarationCollection::class);
        $responseDecls
            ->method('getByIdentifier')
            ->willReturnCallback(function(string $id): ResponseDeclaration {
                if ($id === 'R1') {
                    return $this->makeResponseDeclarationWithCardinality(Cardinality::MULTIPLE);
                }
                throw new InvalidArgumentException('not found');
            });

        $outcomeDecls = $this->createMock(OutcomeDeclarationCollection::class);
        $outcomeDecls
            ->method('getByIdentifier')
            ->willReturn($this->makeOutcomeDeclarationWithCardinality(Cardinality::SINGLE));

        /** @var ResponseSet&MockObject $responseSet */
        $responseSet = $this->createMock(ResponseSet::class);
        $responseSet->responseDeclarations = $responseDecls;

        /** @var OutcomeSet&MockObject $outcomeSet */
        $outcomeSet = $this->createMock(OutcomeSet::class);
        $outcomeSet->outcomeDeclarations = $outcomeDecls;

        $rp = $this->createConfiguredMock(ResponseProcessing::class, [
            'validate' => $this->createConfiguredMock(StringCollection::class, ['count' => 0]),
        ]);

        $state = new ItemState($responseSet, $outcomeSet, $rp);

        $this->assertSame(Cardinality::MULTIPLE, $state->getCardinality('R1'));
        $this->assertSame(Cardinality::SINGLE, $state->getCardinality('O1'));
    }

    #[Test]
    public function getIdentifiersMergesResponseAndOutcomeIdentifiers(): void
    {
        /** @var StringCollection&MockObject $responseIds */
        $responseIds = $this->createMock(StringCollection::class);
        /** @var StringCollection&MockObject $outcomeIds */
        $outcomeIds = $this->createMock(StringCollection::class);
        /** @var StringCollection&MockObject $merged */
        $merged = $this->createMock(StringCollection::class);

        $responseDecls = $this->createMock(ResponseDeclarationCollection::class);
        $outcomeDecls = $this->createMock(OutcomeDeclarationCollection::class);

        $responseDecls->method('getIdentifiers')->willReturn($responseIds);
        $outcomeDecls->method('getIdentifiers')->willReturn($outcomeIds);

        $responseIds
            ->expects($this->once())
            ->method('mergeWith')
            ->with($outcomeIds)
            ->willReturn($merged);

        /** @var ResponseSet&MockObject $responseSet */
        $responseSet = $this->createMock(ResponseSet::class);
        $responseSet->responseDeclarations = $responseDecls;

        /** @var OutcomeSet&MockObject $outcomeSet */
        $outcomeSet = $this->createMock(OutcomeSet::class);
        $outcomeSet->outcomeDeclarations = $outcomeDecls;

        $rp = $this->createConfiguredMock(ResponseProcessing::class, [
            'validate' => $this->createConfiguredMock(StringCollection::class, ['count' => 0]),
        ]);

        $state = new ItemState($responseSet, $outcomeSet, $rp);

        $this->assertSame($merged, $state->getIdentifiers());
    }

    /**
     * Helpers
     */
    private function createResponseSetDouble(): ResponseSet
    {
        /** @var ResponseSet&MockObject $responseSet */
        $responseSet = $this->createMock(ResponseSet::class);

        $decls = $this->createMock(ResponseDeclarationCollection::class);
        $decls->method('getByIdentifier')->willThrowException(new InvalidArgumentException('not found'));
        $decls->method('getIdentifiers')->willReturn(new StringCollection());

        $responseSet->responseDeclarations = $decls;

        return $responseSet;
    }

    private function createOutcomeSetDouble(): OutcomeSet
    {
        /** @var OutcomeSet&MockObject $outcomeSet */
        $outcomeSet = $this->createMock(OutcomeSet::class);

        $decls = $this->createMock(OutcomeDeclarationCollection::class);
        $decls->method('getByIdentifier')->willThrowException(new InvalidArgumentException('not found'));
        $decls->method('getIdentifiers')->willReturn(new StringCollection());

        $outcomeSet->outcomeDeclarations = $decls;

        return $outcomeSet;
    }

    private function makeOutcomeDeclarationWithBaseType(BaseType $baseType): OutcomeDeclaration
    {
        $ref = new ReflectionClass(OutcomeDeclaration::class);
        /** @var OutcomeDeclaration $obj */
        $obj = $ref->newInstanceWithoutConstructor();

        $prop = $ref->getProperty('baseType');
        $prop->setValue($obj, $baseType);

        return $obj;
    }

    private function makeResponseDeclarationWithBaseType(BaseType $baseType): ResponseDeclaration
    {
        $ref = new ReflectionClass(ResponseDeclaration::class);
        /** @var ResponseDeclaration $obj */
        $obj = $ref->newInstanceWithoutConstructor();

        $prop = $ref->getProperty('baseType');
        $prop->setValue($obj, $baseType);

        return $obj;
    }

    private function makeOutcomeDeclarationWithCardinality(Cardinality $cardinality): OutcomeDeclaration
    {
        $ref = new ReflectionClass(OutcomeDeclaration::class);
        /** @var OutcomeDeclaration $obj */
        $obj = $ref->newInstanceWithoutConstructor();

        $prop = $ref->getProperty('cardinality');
        if (!$prop->isPublic()) {
            $prop->setAccessible(true);
        }
        $prop->setValue($obj, $cardinality);

        return $obj;
    }

    private function makeResponseDeclarationWithCardinality(Cardinality $cardinality): ResponseDeclaration
    {
        $ref = new ReflectionClass(ResponseDeclaration::class);
        /** @var ResponseDeclaration $obj */
        $obj = $ref->newInstanceWithoutConstructor();

        $prop = $ref->getProperty('cardinality');
        if (!$prop->isPublic()) {
            $prop->setAccessible(true);
        }
        $prop->setValue($obj, $cardinality);

        return $obj;
    }
}
