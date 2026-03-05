<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\State;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\DefaultValue;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclaration;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use Qti3\Shared\Model\Value;
use Qti3\AssessmentItem\Model\State\OutcomeSet;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OutcomeSetTest extends TestCase
{
    private OutcomeSet $outcomeSet;
    private OutcomeDeclarationCollection $outcomeDeclarations;

    protected function setUp(): void
    {
        $this->outcomeDeclarations = new OutcomeDeclarationCollection([]);
        $this->outcomeSet = new OutcomeSet($this->outcomeDeclarations);
    }

    #[Test]
    public function testGetOutcomeValueWithExistingOutcome(): void
    {
        // Arrange
        $this->outcomeSet->outcomes['test'] = 'value';
        $this->outcomeDeclarations->add(
            new OutcomeDeclaration(
                'test',
                BaseType::STRING,
                Cardinality::SINGLE,
            ),
        );

        // Act
        $result = $this->outcomeSet->getOutcomeValue('test');

        // Assert
        $this->assertEquals('value', $result);
    }

    #[Test]
    public function testGetOutcomeValueWithDefaultValue(): void
    {
        // Arrange
        $this->outcomeDeclarations->add(
            new OutcomeDeclaration(
                'test',
                BaseType::STRING,
                Cardinality::SINGLE,
                new DefaultValue(new Value('default')),
            ),
        );
        $outcomeSet = new OutcomeSet($this->outcomeDeclarations);

        // Act
        $result = $outcomeSet->getOutcomeValue('test');

        // Assert
        $this->assertEquals('default', $result);
    }

    #[Test]
    public function testGetOutcomeValueWithNoDefaultValue(): void
    {
        // Arrange
        $this->outcomeDeclarations->add(
            new OutcomeDeclaration(
                'test',
                BaseType::STRING,
                Cardinality::SINGLE,
            ),
        );

        // Act
        $result = $this->outcomeSet->getOutcomeValue('test');

        // Assert
        $this->assertNull($result);
    }
}
