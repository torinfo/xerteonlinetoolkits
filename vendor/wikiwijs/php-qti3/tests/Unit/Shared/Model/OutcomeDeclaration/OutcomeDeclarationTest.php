<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model\OutcomeDeclaration;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\DefaultValue;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclaration;
use Qti3\Shared\Model\Value;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OutcomeDeclarationTest extends TestCase
{
    private DefaultValue $defaultValue;
    private OutcomeDeclaration $outcomeDeclaration;

    protected function setUp(): void
    {
        $this->defaultValue = new DefaultValue(new Value('value'));
        $this->outcomeDeclaration = new OutcomeDeclaration(
            'identifier',
            BaseType::FLOAT,
            Cardinality::SINGLE,
            $this->defaultValue,
            1.0,
        );
    }

    #[Test]
    public function itShouldReturnTheCorrectValues(): void
    {
        $this->assertEquals('identifier', $this->outcomeDeclaration->identifier);
        $this->assertEquals('float', $this->outcomeDeclaration->baseType->value);
        $this->assertEquals('single', $this->outcomeDeclaration->cardinality->value);
        $this->assertEquals('value', (string) $this->outcomeDeclaration->defaultValue->value);
        $this->assertEquals([
            'identifier' => 'identifier',
            'base-type' => 'float',
            'cardinality' => 'single',
            'normal-maximum' => '1.0',
            'external-scored' => null,
        ], $this->outcomeDeclaration->attributes());
        $this->assertEquals([
            $this->defaultValue,
        ], $this->outcomeDeclaration->children());
    }

    #[Test]
    public function aScoreDeclarationCanBeCreated(): void
    {
        $outcomeDeclaration = OutcomeDeclaration::scoreDeclaration(normalMaximum: 10.0, normalMinimum: 0.0);

        $this->assertEquals('SCORE', $outcomeDeclaration->identifier);
        $this->assertEquals('float', $outcomeDeclaration->baseType->value);
        $this->assertEquals('single', $outcomeDeclaration->cardinality->value);
        $this->assertEquals([
            'identifier' => 'SCORE',
            'base-type' => 'float',
            'cardinality' => 'single',
            'normal-maximum' => '10.0',
            'external-scored' => null,
            'normal-minimum' => '0.0',
        ], $outcomeDeclaration->attributes());
    }

    #[Test]
    public function aMaxScoreDeclarationCanBeCreated(): void
    {
        $outcomeDeclaration = OutcomeDeclaration::maxScoreDeclaration(10.0);

        $this->assertEquals('MAXSCORE', $outcomeDeclaration->identifier);
        $this->assertEquals('float', $outcomeDeclaration->baseType->value);
        $this->assertEquals('single', $outcomeDeclaration->cardinality->value);
        $this->assertEquals([
            'identifier' => 'MAXSCORE',
            'base-type' => 'float',
            'cardinality' => 'single',
            'external-scored' => null,
        ], $outcomeDeclaration->attributes());
    }

    #[Test]
    public function aFeedbackDeclarationCanBeCreated(): void
    {
        $outcomeDeclaration = OutcomeDeclaration::feedbackDeclaration();

        $this->assertSame('FEEDBACK', $outcomeDeclaration->identifier);
        $this->assertSame(BaseType::IDENTIFIER, $outcomeDeclaration->baseType);
        $this->assertSame(Cardinality::SINGLE, $outcomeDeclaration->cardinality);
        $this->assertNull($outcomeDeclaration->defaultValue);
    }

    #[Test]
    public function aFeedbackDeclarationCanBeCreatedWithCustomIdentifier(): void
    {
        $outcomeDeclaration = OutcomeDeclaration::feedbackDeclaration('CUSTOM_FEEDBACK');

        $this->assertSame('CUSTOM_FEEDBACK', $outcomeDeclaration->identifier);
        $this->assertSame(BaseType::IDENTIFIER, $outcomeDeclaration->baseType);
        $this->assertSame(Cardinality::SINGLE, $outcomeDeclaration->cardinality);
    }
}
