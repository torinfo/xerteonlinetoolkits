<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Service;

use Qti3\AssessmentItem\Service\ValueConverter;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ValueConverterTest extends TestCase
{
    #[Test]
    public function convertSingleWithIntegerBaseTypeReturnsInteger(): void
    {
        // Arrange
        $value = '123';
        $cardinality = Cardinality::SINGLE;
        $baseType = BaseType::INTEGER;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertSame(123, $result);
    }

    #[Test]
    public function convertSingleWithFloatBaseTypeReturnsFloat(): void
    {
        // Arrange
        $value = '123.45';
        $cardinality = Cardinality::SINGLE;
        $baseType = BaseType::FLOAT;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertSame(123.45, $result);
    }

    #[Test]
    public function convertSingleWithBooleanBaseTypeReturnsBoolean(): void
    {
        // Arrange
        $value = 'true';
        $cardinality = Cardinality::SINGLE;
        $baseType = BaseType::BOOLEAN;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertTrue($result);
    }

    #[Test]
    public function convertSingleWithStringBaseTypeReturnsString(): void
    {
        // Arrange
        $value = 123;
        $cardinality = Cardinality::SINGLE;
        $baseType = BaseType::STRING;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertSame('123', $result);
    }

    #[Test]
    public function convertMultipleWithIntegersReturnsArrayOfIntegers(): void
    {
        // Arrange
        $value = ['1', '2', '3'];
        $cardinality = Cardinality::MULTIPLE;
        $baseType = BaseType::INTEGER;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertSame([1, 2, 3], $result);
    }

    #[Test]
    public function convertMultipleWithMixedValuesReturnsArray(): void
    {
        // Arrange
        $value = ['1', 2, 3.5, 'false', null];
        $cardinality = Cardinality::MULTIPLE;
        $baseType = BaseType::STRING;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertSame(['1', '2', '3.5', 'false', null], $result);
    }

    #[Test]
    public function convertSingleThrowsExceptionForInvalidCardinality(): void
    {
        // Arrange
        $value = 'value';
        $cardinality = Cardinality::RECORD;
        $baseType = BaseType::STRING;

        // Assert
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unsupported cardinality: record');

        // Act
        ValueConverter::convert($value, $cardinality, $baseType);
    }

    #[Test]
    public function convertSingleThrowsExceptionForArrayInSingleCardinality(): void
    {
        // Arrange
        $value = ['value1', 'value2'];
        $cardinality = Cardinality::SINGLE;
        $baseType = BaseType::STRING;

        // Assert
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Cardinality SINGLE does not support arrays');

        // Act
        ValueConverter::convert($value, $cardinality, $baseType);
    }

    #[Test]
    public function convertSingleReturnsNullForNullValue(): void
    {
        // Arrange
        $value = null;
        $cardinality = Cardinality::SINGLE;
        $baseType = BaseType::BOOLEAN;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertNull($result);
    }

    #[Test]
    public function convertMultipleHandlesNonArrayValues(): void
    {
        // Arrange
        $value = '1';
        $cardinality = Cardinality::MULTIPLE;
        $baseType = BaseType::INTEGER;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertSame([1], $result);
    }

    #[Test]
    public function convertSingleThrowsExceptionForUnknownBaseType(): void
    {
        // Arrange
        $value = '1';
        $cardinality = Cardinality::SINGLE;
        $baseType = BaseType::PAIR;

        // Assert
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown base type: pair');

        // Act
        ValueConverter::convert($value, $cardinality, $baseType);
    }

    #[Test]
    public function convertSingleWithSingleElementArrayUnwrapsArray(): void
    {
        // Arrange
        $value = ['42'];
        $cardinality = Cardinality::SINGLE;
        $baseType = BaseType::INTEGER;

        // Act
        $result = ValueConverter::convert($value, $cardinality, $baseType);

        // Assert
        $this->assertSame(42, $result);
    }
}
