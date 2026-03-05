<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model\Processing;

use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclaration;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclarationCollection;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\AssessmentItem\Model\State\OutcomeSet;
use Qti3\AssessmentItem\Model\State\ResponseSet;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class SetOutcomeValueTest extends TestCase
{
    private SetOutcomeValue $setOutcomeValue;

    protected function setUp(): void
    {
        $this->setOutcomeValue = new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value'));
    }

    #[Test]
    public function setOutcomeValueDoesntThrowExceptions(): void
    {
        $this->assertEquals(['identifier' => 'identifier'], $this->setOutcomeValue->attributes());
        $this->assertInstanceOf(BaseValue::class, $this->setOutcomeValue->children()[0]);
    }

    #[Test]
    public function itReturnsTheProvidedIdentifier(): void
    {
        $this->assertSame('identifier', $this->setOutcomeValue->attributes()['identifier']);
    }

    #[Test]
    public function validateDetectsInvalidIdentifier(): void
    {
        $itemState = new ItemState(
            new ResponseSet(new ResponseDeclarationCollection([
                new ResponseDeclaration(BaseType::STRING, Cardinality::SINGLE, 'identifier2'),
            ])),
            new OutcomeSet(new OutcomeDeclarationCollection([])),
            new ResponseProcessing([]),
        );

        $errors = $this->setOutcomeValue->validate($itemState);
        $this->assertCount(1, $errors);
        $this->assertEquals('Identifier identifier not found for `qti-set-outcome-value`', $errors[0]);
    }

    #[Test]
    public function validateDetectsBaseTypeMismatch(): void
    {
        $itemState = new ItemState(
            new ResponseSet(new ResponseDeclarationCollection([
                new ResponseDeclaration(BaseType::INTEGER, Cardinality::SINGLE, 'identifier'),
            ])),
            new OutcomeSet(new OutcomeDeclarationCollection([])),
            new ResponseProcessing([]),
        );

        $errors = $this->setOutcomeValue->validate($itemState);
        $this->assertCount(1, $errors);
        $this->assertEquals('Base type mismatch for identifier identifier', $errors[0]);
    }

    #[Test]
    public function validateDetectsCardinalityMismatch(): void
    {
        $itemState = new ItemState(
            new ResponseSet(new ResponseDeclarationCollection([
                new ResponseDeclaration(BaseType::STRING, Cardinality::MULTIPLE, 'identifier'),
            ])),
            new OutcomeSet(new OutcomeDeclarationCollection([])),
            new ResponseProcessing([]),
        );

        $errors = $this->setOutcomeValue->validate($itemState);
        $this->assertCount(1, $errors);
        $this->assertEquals('Cardinality mismatch for identifier identifier', $errors[0]);
    }
}
