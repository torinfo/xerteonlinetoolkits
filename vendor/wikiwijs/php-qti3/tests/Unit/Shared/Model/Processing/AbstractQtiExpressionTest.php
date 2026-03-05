<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Model\Processing;

use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclaration;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclarationCollection;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\Contains;
use Qti3\Shared\Model\Processing\Correct;
use Qti3\Shared\Model\Processing\Delete;
use Qti3\Shared\Model\Processing\Divide;
use Qti3\Shared\Model\Processing\Equal;
use Qti3\Shared\Model\Processing\Gt;
use Qti3\Shared\Model\Processing\Gte;
use Qti3\Shared\Model\Processing\Index;
use Qti3\Shared\Model\Processing\IndexExpression;
use Qti3\Shared\Model\Processing\IntegerDivide;
use Qti3\Shared\Model\Processing\IntegerModulus;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\Lt;
use Qti3\Shared\Model\Processing\Lte;
use Qti3\Shared\Model\Processing\Max;
use Qti3\Shared\Model\Processing\Member;
use Qti3\Shared\Model\Processing\Min;
use Qti3\Shared\Model\Processing\Multiple;
use Qti3\Shared\Model\Processing\Ordered;
use Qti3\Shared\Model\Processing\Power;
use Qti3\Shared\Model\Processing\Product;
use Qti3\Shared\Model\Processing\qtiAnd;
use Qti3\Shared\Model\Processing\qtiMatch;
use Qti3\Shared\Model\Processing\qtiNot;
use Qti3\Shared\Model\Processing\qtiOr;
use Qti3\Shared\Model\Processing\Round;
use Qti3\Shared\Model\Processing\RoundTo;
use Qti3\Shared\Model\Processing\Substring;
use Qti3\Shared\Model\Processing\Subtract;
use Qti3\Shared\Model\Processing\Sum;
use Qti3\Shared\Model\Processing\Variable;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\AssessmentItem\Model\State\OutcomeSet;
use Qti3\AssessmentItem\Model\State\ResponseSet;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class AbstractQtiExpressionTest extends TestCase
{
    private ItemState $itemState;

    protected function setUp(): void
    {
        $responseDeclarations = new ResponseDeclarationCollection([
            new ResponseDeclaration(
                BaseType::INTEGER,
                Cardinality::SINGLE,
                'RESPONSE',
            ),
            new ResponseDeclaration(
                BaseType::STRING,
                Cardinality::SINGLE,
                'RESPONSE2',
            ),
            new ResponseDeclaration(BaseType::STRING, Cardinality::SINGLE, 'identifier'),
        ]);
        $outcomeDeclarations = new OutcomeDeclarationCollection([]);

        // Create a simple ResponseProcessing instance with no elements
        $responseProcessing = new ResponseProcessing([]);

        $this->itemState = new ItemState(
            new ResponseSet($responseDeclarations),
            new OutcomeSet($outcomeDeclarations),
            $responseProcessing,
            false,
        );
    }

    #[Test]
    public function evaluateBooleanReturnsCorrectValue(): void
    {
        // Arrange
        $expression = new qtiAnd([
            new BaseValue(BaseType::BOOLEAN, true),
            new BaseValue(BaseType::BOOLEAN, true),
        ]);

        // Act
        $result = $expression->evaluateBoolean($this->itemState);

        // Assert
        $this->assertTrue($result);
    }

    #[Test]
    public function testQtiAnd(): void
    {
        // Test with all true values
        $expression = new qtiAnd([
            new BaseValue(BaseType::BOOLEAN, 'true'),
            new BaseValue(BaseType::BOOLEAN, 'true'),
            new BaseValue(BaseType::BOOLEAN, 'true'),
        ]);

        $this->assertTrue($expression->evaluate($this->itemState));
        $this->assertCount(3, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));

        // Test with one false value
        $expression = new qtiAnd([
            new BaseValue(BaseType::BOOLEAN, 'true'),
            new BaseValue(BaseType::BOOLEAN, 'false'),
            new BaseValue(BaseType::BOOLEAN, 'true'),
        ]);

        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with all false values
        $expression = new qtiAnd([
            new BaseValue(BaseType::BOOLEAN, 'false'),
            new BaseValue(BaseType::BOOLEAN, 'false'),
        ]);

        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with empty array
        $expression = new qtiAnd([]);
        $this->assertTrue($expression->evaluate($this->itemState));
    }

    #[Test]
    public function testQtiMatch(): void
    {
        $expression = new qtiMatch(new Variable('variable'), new Correct('identifier'));
        $this->assertEquals('qti-match', $expression->tagName());
        $this->assertInstanceOf(Variable::class, $expression->children()[0]);
        $this->assertInstanceOf(Correct::class, $expression->children()[1]);

        // Test with matching strings
        $expression = new qtiMatch(
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::STRING, 'apple'),
        );
        $this->assertTrue($expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));

        // Test with non-matching strings
        $expression = new qtiMatch(
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::STRING, 'banana'),
        );
        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with different base types
        $expression = new qtiMatch(
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::INTEGER, 1),
        );
        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with multiple cardinality, different order
        $expression = new qtiMatch(
            new Multiple([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'cherry'),
                new BaseValue(BaseType::STRING, 'banana'),
            ]),
            new Multiple([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
        );
        $this->assertTrue($expression->evaluate($this->itemState));

        // Test with multiple cardinality, different counts
        $expression = new qtiMatch(
            new Multiple([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
            new Multiple([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
            ]),
        );
        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with multiple cardinality, different values
        $expression = new qtiMatch(
            new Multiple([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
            new Multiple([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'grape'),
            ]),
        );
        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with ordered cardinality, same order
        $expression = new qtiMatch(
            new Ordered([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
            new Ordered([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
        );
        $this->assertTrue($expression->evaluate($this->itemState));

        // Test with ordered cardinality, different order
        $expression = new qtiMatch(
            new Ordered([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'cherry'),
                new BaseValue(BaseType::STRING, 'banana'),
            ]),
            new Ordered([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
        );
        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with ordered cardinality, different counts
        $expression = new qtiMatch(
            new Ordered([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
            new Ordered([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
            ]),
        );
        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with multiple cardinality, different values
        $expression = new qtiMatch(
            new Ordered([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
            new Ordered([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'grape'),
            ]),
        );
        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with different cardinality
        $expression = new qtiMatch(
            new Multiple([
                new BaseValue(BaseType::STRING, 'apple'),
                new BaseValue(BaseType::STRING, 'banana'),
                new BaseValue(BaseType::STRING, 'cherry'),
            ]),
            new BaseValue(BaseType::STRING, 'apple'),
        );
        $this->assertFalse($expression->evaluate($this->itemState));
    }

    #[Test]
    public function testQtiOr(): void
    {
        // Test with at least one true value
        $expression = new qtiOr([
            new BaseValue(BaseType::BOOLEAN, 'false'),
            new BaseValue(BaseType::BOOLEAN, 'true'),
            new BaseValue(BaseType::BOOLEAN, 'false'),
        ]);

        $this->assertTrue($expression->evaluate($this->itemState));
        $this->assertCount(3, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));

        // Test with all true values
        $expression = new qtiOr([
            new BaseValue(BaseType::BOOLEAN, 'true'),
            new BaseValue(BaseType::BOOLEAN, 'true'),
        ]);

        $this->assertTrue($expression->evaluate($this->itemState));

        // Test with all false values
        $expression = new qtiOr([
            new BaseValue(BaseType::BOOLEAN, 'false'),
            new BaseValue(BaseType::BOOLEAN, 'false'),
        ]);

        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with empty array
        $expression = new qtiOr([]);
        $this->assertFalse($expression->evaluate($this->itemState));
    }

    #[Test]
    public function evaluateNumberReturnsCorrectValue(): void
    {
        // Arrange
        $expression = new Sum([
            new BaseValue(BaseType::INTEGER, 20),
            new BaseValue(BaseType::INTEGER, 22),
        ]);

        // Act
        $result = $expression->evaluateNumber($this->itemState);

        // Assert
        $this->assertSame(42, $result);
    }

    #[Test]
    public function testSum(): void
    {
        // Test with integers
        $expression = new Sum([
            new BaseValue(BaseType::INTEGER, '5'),
            new BaseValue(BaseType::INTEGER, '10'),
            new BaseValue(BaseType::INTEGER, '15'),
        ]);

        $this->assertEquals(30, $expression->evaluate($this->itemState));
        $this->assertCount(3, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::FLOAT, $expression->getBaseType($this->itemState));

        // Test with floats
        $expression = new Sum([
            new BaseValue(BaseType::FLOAT, '1.5'),
            new BaseValue(BaseType::FLOAT, '2.5'),
            new BaseValue(BaseType::FLOAT, '3.5'),
        ]);

        $this->assertEquals(7.5, $expression->evaluate($this->itemState));

        // Test with mixed types
        $expression = new Sum([
            new BaseValue(BaseType::INTEGER, '10'),
            new BaseValue(BaseType::FLOAT, '10'),
        ]);

        $this->assertEquals(20, $expression->evaluate($this->itemState));
    }

    #[Test]
    public function testMultiple(): void
    {
        // Test with single elements
        $expression = new Multiple([
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::STRING, 'banana'),
            new BaseValue(BaseType::STRING, 'cherry'),
        ]);

        $result = $expression->evaluate($this->itemState);
        $this->assertIsArray($result);
        $this->assertCount(3, $result);
        $this->assertEquals(['apple', 'banana', 'cherry'], $result);
        $this->assertEquals(Cardinality::MULTIPLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::STRING, $expression->getBaseType($this->itemState));

        // Test with nested arrays (Multiple inside Multiple)
        $nestedMultiple = new Multiple([
            new BaseValue(BaseType::STRING, 'nested1'),
            new BaseValue(BaseType::STRING, 'nested2'),
        ]);

        $expression = new Multiple([
            new BaseValue(BaseType::STRING, 'apple'),
            $nestedMultiple,
        ]);

        $result = $expression->evaluate($this->itemState);
        $this->assertIsArray($result);
        $this->assertCount(3, $result);
        $this->assertEquals(['apple', 'nested1', 'nested2'], $result);

        // Test with empty Multiple
        $expression = new Multiple([]);
        $result = $expression->evaluate($this->itemState);
        $this->assertIsArray($result);
        $this->assertCount(0, $result);
        $this->assertEquals(BaseType::STRING, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function testOrdered(): void
    {
        // Test with single elements
        $expression = new Ordered([
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::STRING, 'banana'),
            new BaseValue(BaseType::STRING, 'cherry'),
        ]);
        $this->assertCount(3, $expression->children());

        $result = $expression->evaluate($this->itemState);
        $this->assertIsArray($result);
        $this->assertCount(3, $result);
        $this->assertEquals(['apple', 'banana', 'cherry'], $result);
        $this->assertEquals(Cardinality::ORDERED, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::STRING, $expression->getBaseType($this->itemState));

        // Test with nested arrays (Ordered inside Ordered)
        $nestedMultiple = new Ordered([
            new BaseValue(BaseType::STRING, 'nested1'),
            new BaseValue(BaseType::STRING, 'nested2'),
        ]);

        $expression = new Ordered([
            new BaseValue(BaseType::STRING, 'apple'),
            $nestedMultiple,
        ]);

        $result = $expression->evaluate($this->itemState);
        $this->assertIsArray($result);
        $this->assertCount(3, $result);
        $this->assertEquals(['apple', 'nested1', 'nested2'], $result);

        // Test with empty Ordered
        $expression = new Ordered([]);
        $result = $expression->evaluate($this->itemState);
        $this->assertIsArray($result);
        $this->assertCount(0, $result);
        $this->assertEquals(BaseType::STRING, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function evaluateWithNonNumericTypeResultsInException(): void
    {
        // Arrange
        $sum = new Sum([
            new BaseValue(BaseType::STRING, 'value'),
        ]);

        // Act & Assert

        $this->expectExceptionMessage('Element is not numeric');

        $sum->evaluate($this->itemState);
    }

    #[Test]
    public function evaluateWithNonBooleanTypeResultsInException(): void
    {
        // Arrange
        $and = new qtiAnd([
            new BaseValue(BaseType::STRING, 'value'),
        ]);

        // Act & Assert

        $this->expectExceptionMessage('Element is not boolean');

        $and->evaluate($this->itemState);
    }
    #[Test]
    public function evaluateWithNonArrayTypeResultsInException(): void
    {
        // Arrange
        $member = new Member(
            new BaseValue(BaseType::STRING, 'value'),
            new BaseValue(BaseType::STRING, 'value'),
        );

        // Act & Assert

        $this->expectExceptionMessage('Element is not an array');

        $member->evaluate($this->itemState);
    }

    #[Test]
    public function testMember(): void
    {
        // Test when element is a member
        $multiple = new Multiple([
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::STRING, 'banana'),
            new BaseValue(BaseType::STRING, 'cherry'),
        ]);

        $expression = new Member(
            new BaseValue(BaseType::STRING, 'banana'),
            $multiple,
        );

        $this->assertTrue($expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));

        // Test when element is not a member
        $expression = new Member(
            new BaseValue(BaseType::STRING, 'grape'),
            $multiple,
        );

        $this->assertFalse($expression->evaluate($this->itemState));

        // Test with numeric values
        $numericMultiple = new Multiple([
            new BaseValue(BaseType::INTEGER, '1'),
            new BaseValue(BaseType::INTEGER, '2'),
            new BaseValue(BaseType::INTEGER, '3'),
        ]);

        $expression = new Member(
            new BaseValue(BaseType::INTEGER, '2'),
            $numericMultiple,
        );

        $this->assertTrue($expression->evaluate($this->itemState));
    }

    #[Test]
    public function testQtiNot(): void
    {
        $expression = new qtiNot(new BaseValue(BaseType::BOOLEAN, 'true'));
        $this->assertFalse($expression->evaluate($this->itemState));
        $this->assertCount(1, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));

        $expression = new qtiNot(new BaseValue(BaseType::BOOLEAN, 'false'));
        $this->assertTrue($expression->evaluate($this->itemState));

        // Test with expressions that evaluate to boolean
        $andExpression = new qtiAnd([
            new BaseValue(BaseType::BOOLEAN, 'true'),
            new BaseValue(BaseType::BOOLEAN, 'true'),
        ]);
        $expression = new qtiNot($andExpression);
        $this->assertFalse($expression->evaluate($this->itemState));

        // Test exception when non-boolean is provided
        $expression = new qtiNot(new BaseValue(BaseType::STRING, 'not a boolean'));
        $this->expectExceptionMessage('Element is not boolean');
        $expression->evaluate($this->itemState);
    }

    #[Test]
    public function testContains(): void
    {
        $multiple = new Multiple([
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::STRING, 'banana'),
            new BaseValue(BaseType::STRING, 'cherry'),
        ]);

        $expression = new Contains($multiple, new Multiple([new BaseValue(BaseType::STRING, 'banana')]));
        $this->assertTrue($expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));

        $expression = new Contains($multiple, new Multiple([new BaseValue(BaseType::STRING, 'grape')]));
        $this->assertFalse($expression->evaluate($this->itemState));
    }

    #[Test]
    public function testSubstring(): void
    {
        $expression = new Substring(
            new BaseValue(BaseType::STRING, 'Hello World'),
            new BaseValue(BaseType::STRING, 'World'),
        );
        $this->assertTrue($expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertCount(1, $expression->attributes());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));

        $expression = new Substring(
            new BaseValue(BaseType::STRING, 'Hello World'),
            new BaseValue(BaseType::STRING, 'WORLD'),
            false,
        );
        $this->assertTrue($expression->evaluate($this->itemState));

        $expression = new Substring(
            new BaseValue(BaseType::STRING, 'Hello World'),
            new BaseValue(BaseType::STRING, 'WORLD'),
        );
        $this->assertFalse($expression->evaluate($this->itemState));

        $this->expectExceptionMessage('Element is not a string');
        $expression = new Substring(
            new BaseValue(BaseType::INTEGER, 1),
            new BaseValue(BaseType::STRING, 'WORLD'),
        );
        $expression->evaluate($this->itemState);
    }

    #[Test]
    public function testSubtract(): void
    {
        $expression = new Subtract(
            new BaseValue(BaseType::FLOAT, '10.5'),
            new BaseValue(BaseType::FLOAT, '5.2'),
        );
        $this->assertEquals(5.3, $expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::FLOAT, $expression->getBaseType($this->itemState));

        // Test with integers
        $expression = new Subtract(
            new BaseValue(BaseType::INTEGER, '10'),
            new BaseValue(BaseType::INTEGER, '5'),
        );
        $this->assertEquals(5, $expression->evaluate($this->itemState));

        // Test with mixed types
        $expression = new Subtract(
            new BaseValue(BaseType::INTEGER, '10'),
            new BaseValue(BaseType::FLOAT, '3.5'),
        );
        $this->assertEquals(6.5, $expression->evaluate($this->itemState));

        // Test with negative result
        $expression = new Subtract(
            new BaseValue(BaseType::INTEGER, '5'),
            new BaseValue(BaseType::INTEGER, '10'),
        );
        $this->assertEquals(-5, $expression->evaluate($this->itemState));

        // Test with zero
        $expression = new Subtract(
            new BaseValue(BaseType::INTEGER, '5'),
            new BaseValue(BaseType::INTEGER, '0'),
        );
        $this->assertEquals(5, $expression->evaluate($this->itemState));
    }

    #[Test]
    public function testPower(): void
    {
        $expression = new Power(
            new BaseValue(BaseType::FLOAT, '2'),
            new BaseValue(BaseType::FLOAT, '3'),
        );
        $this->assertEquals(8, $expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::FLOAT, $expression->getBaseType($this->itemState));

        // Test with fractional exponent (square root)
        $expression = new Power(
            new BaseValue(BaseType::FLOAT, '2'),
            new BaseValue(BaseType::FLOAT, '0.5'),
        );
        $this->assertEquals(sqrt(2), $expression->evaluate($this->itemState));

        // Test with integer base and exponent
        $expression = new Power(
            new BaseValue(BaseType::INTEGER, '3'),
            new BaseValue(BaseType::INTEGER, '2'),
        );
        $this->assertEquals(9, $expression->evaluate($this->itemState));

        // Test with negative exponent
        $expression = new Power(
            new BaseValue(BaseType::FLOAT, '2'),
            new BaseValue(BaseType::FLOAT, '-1'),
        );
        $this->assertEquals(0.5, $expression->evaluate($this->itemState));
    }

    #[Test]
    public function testRound(): void
    {
        $expression = new Round(
            new BaseValue(BaseType::FLOAT, '3.7'),
        );
        $this->assertEquals(4, $expression->evaluate($this->itemState));
        $this->assertCount(1, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::INTEGER, $expression->getBaseType($this->itemState));

        $expression = new Round(
            new BaseValue(BaseType::FLOAT, '3.2'),
        );
        $this->assertEquals(3, $expression->evaluate($this->itemState));

        // Test floor rounding mode
        $expression = new Round(
            new BaseValue(BaseType::FLOAT, '3.7'),
            'floor',
        );
        $this->assertEquals(3, $expression->evaluate($this->itemState));

        // Test ceiling rounding mode
        $expression = new Round(
            new BaseValue(BaseType::FLOAT, '3.2'),
            'ceiling',
        );
        $this->assertEquals(4, $expression->evaluate($this->itemState));

        // Test with negative numbers
        $expression = new Round(
            new BaseValue(BaseType::FLOAT, '-3.7'),
        );
        $this->assertEquals(-4, $expression->evaluate($this->itemState));

        $expression = new Round(
            new BaseValue(BaseType::FLOAT, '-3.2'),
        );
        $this->assertEquals(-3, $expression->evaluate($this->itemState));

        // Test with edge cases
        $expression = new Round(
            new BaseValue(BaseType::FLOAT, '3.5'),
        );
        $this->assertEquals(4, $expression->evaluate($this->itemState));

        $expression = new Round(
            new BaseValue(BaseType::FLOAT, '-3.5'),
        );
        $this->assertEquals(-4, $expression->evaluate($this->itemState));
    }

    #[Test]
    public function testRoundTo(): void
    {
        // Test rounding to 2 decimal places
        $expression = new RoundTo(
            new BaseValue(BaseType::FLOAT, '3.14159'),
            new BaseValue(BaseType::INTEGER, '2'),
        );
        $this->assertEquals(3.14, $expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::FLOAT, $expression->getBaseType($this->itemState));

        // Test rounding up to 1 decimal place
        $expression = new RoundTo(
            new BaseValue(BaseType::FLOAT, '3.85'),
            new BaseValue(BaseType::INTEGER, '1'),
        );
        $this->assertEquals(3.9, $expression->evaluate($this->itemState));

        // Test with floor rounding mode
        $expression = new RoundTo(
            new BaseValue(BaseType::FLOAT, '3.99'),
            new BaseValue(BaseType::INTEGER, '1'),
            'floor',
        );
        $this->assertEquals(3.9, $expression->evaluate($this->itemState));

        // Test with ceiling rounding mode
        $expression = new RoundTo(
            new BaseValue(BaseType::FLOAT, '3.01'),
            new BaseValue(BaseType::INTEGER, '1'),
            'ceiling',
        );
        $this->assertEquals(3.1, $expression->evaluate($this->itemState));

        // Test rounding to 0 decimal places (should be same as regular round)
        $expression = new RoundTo(
            new BaseValue(BaseType::FLOAT, '3.7'),
            new BaseValue(BaseType::INTEGER, '0'),
        );
        $this->assertEquals(4.0, $expression->evaluate($this->itemState));

        $expression = new RoundTo(
            new BaseValue(BaseType::FLOAT, '3.7'),
            new BaseValue(BaseType::INTEGER, '0'),
            'floor',
        );
        $this->assertEquals(3.0, $expression->evaluate($this->itemState));

        $expression = new RoundTo(
            new BaseValue(BaseType::FLOAT, '3.7'),
            new BaseValue(BaseType::INTEGER, '0'),
            'ceiling',
        );
        $this->assertEquals(4.0, $expression->evaluate($this->itemState));

        // Test with negative numbers
        $expression = new RoundTo(
            new BaseValue(BaseType::FLOAT, '-3.14159'),
            new BaseValue(BaseType::INTEGER, '2'),
        );
        $this->assertEquals(-3.14, $expression->evaluate($this->itemState));
    }

    #[Test]
    public function integerDivide(): void
    {
        $expression = new IntegerDivide(
            new BaseValue(BaseType::INTEGER, '10'),
            new BaseValue(BaseType::INTEGER, '3'),
        );
        $this->assertEquals(3, $expression->evaluate($this->itemState));

        $expression = new IntegerDivide(
            new BaseValue(BaseType::INTEGER, '10'),
            new BaseValue(BaseType::INTEGER, '0'),
        );
        $this->assertEquals(0, $expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::INTEGER, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function integerModulus(): void
    {
        $expression = new IntegerModulus(
            new BaseValue(BaseType::INTEGER, '10'),
            new BaseValue(BaseType::INTEGER, '3'),
        );
        $this->assertEquals(1, $expression->evaluate($this->itemState));
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::INTEGER, $expression->getBaseType($this->itemState));

        $expression = new IntegerModulus(
            new BaseValue(BaseType::INTEGER, '10'),
            new BaseValue(BaseType::INTEGER, '0'),
        );
        $this->assertEquals(0, $expression->evaluate($this->itemState));
    }

    #[Test]
    public function testMin(): void
    {
        $expression = new Min([
            new BaseValue(BaseType::INTEGER, '5'),
            new BaseValue(BaseType::INTEGER, '3'),
            new BaseValue(BaseType::INTEGER, '8'),
        ]);
        $this->assertEquals(3, $expression->evaluate($this->itemState));
        $this->assertCount(3, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::FLOAT, $expression->getBaseType($this->itemState));

        // Test with floats
        $expression = new Min([
            new BaseValue(BaseType::FLOAT, '5.5'),
            new BaseValue(BaseType::FLOAT, '3.3'),
            new BaseValue(BaseType::FLOAT, '8.8'),
        ]);
        $this->assertEquals(3.3, $expression->evaluate($this->itemState));

        // Test with empty array
        $expression = new Min([]);
        $this->assertEquals(0, $expression->evaluate($this->itemState));
    }

    #[Test]
    public function testMax(): void
    {
        $expression = new Max([
            new BaseValue(BaseType::INTEGER, '5'),
            new BaseValue(BaseType::INTEGER, '3'),
            new BaseValue(BaseType::INTEGER, '8'),
        ]);
        $this->assertEquals(8, $expression->evaluate($this->itemState));
        $this->assertCount(3, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::FLOAT, $expression->getBaseType($this->itemState));

        // Test with floats
        $expression = new Max([
            new BaseValue(BaseType::FLOAT, '5.5'),
            new BaseValue(BaseType::FLOAT, '3.3'),
            new BaseValue(BaseType::FLOAT, '8.8'),
        ]);
        $this->assertEquals(8.8, $expression->evaluate($this->itemState));

        // Test with empty array
        $expression = new Max([]);
        $this->assertEquals(0, $expression->evaluate($this->itemState));
    }

    #[Test]
    public function index(): void
    {
        $multiple = new Multiple([
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::STRING, 'banana'),
            new BaseValue(BaseType::STRING, 'cherry'),
        ]);

        $expression = new Index($multiple, new IndexExpression('2'));
        $this->assertEquals('banana', $expression->evaluate($this->itemState));
        $this->assertCount(1, $expression->children());
        $this->assertCount(1, $expression->attributes());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::STRING, $expression->getBaseType($this->itemState));

        $expression = new Index($multiple, new IndexExpression('4'));
        $this->assertNull($expression->evaluate($this->itemState));

        $this->itemState->responseSet->setResponses(['RESPONSE' => 2]);
        $expression = new Index($multiple, new IndexExpression('RESPONSE'));
        $this->assertEquals('banana', $expression->evaluate($this->itemState));

        $this->itemState->responseSet->setResponses(['RESPONSE2' => 'A']);
        $expression = new Index($multiple, new IndexExpression('RESPONSE2'));

        $this->expectExceptionMessage('Value is not numeric');
        $expression->evaluate($this->itemState);
    }

    #[Test]
    public function deleteRemovesElement(): void
    {
        // Arrange

        $multiple = new Multiple([
            new BaseValue(BaseType::STRING, 'apple'),
            new BaseValue(BaseType::STRING, 'banana'),
            new BaseValue(BaseType::STRING, 'cherry'),
        ]);
        $expression = new Delete(new BaseValue(BaseType::STRING, 'banana'), $multiple);
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::MULTIPLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::STRING, $expression->getBaseType($this->itemState));

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertEquals('apple', $result[0]);
        $this->assertEquals('cherry', $result[1]);
    }

    #[Test]
    public function deleteRemovesNumericElement(): void
    {
        // Arrange

        $multiple = new Multiple([
            new BaseValue(BaseType::FLOAT, 1.0),
            new BaseValue(BaseType::FLOAT, 1.1),
            new BaseValue(BaseType::FLOAT, 1.2),
        ]);
        $expression = new Delete(new BaseValue(BaseType::INTEGER, 1), $multiple);

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertIsArray($result);
        $this->assertCount(2, $result);
        $this->assertEquals(1.1, $result[0]);
        $this->assertEquals(1.2, $result[1]);
    }

    #[Test]
    public function deleteWithSingleResultsInNull(): void
    {
        // Arrange

        $multiple = new BaseValue(BaseType::STRING, 'apple');
        $expression = new Delete(new BaseValue(BaseType::STRING, 'banana'), $multiple);

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertNull($result);
    }

    #[Test]
    public function testDivide(): void
    {
        // Arrange

        $expression = new Divide(
            new BaseValue(BaseType::INTEGER, 4),
            new BaseValue(BaseType::INTEGER, 2),
        );

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertEquals(2, $result);
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::FLOAT, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function testEqual(): void
    {
        // Arrange

        $expression = new Equal(
            new BaseValue(BaseType::INTEGER, 4),
            new BaseValue(BaseType::INTEGER, 4),
        );

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertTrue($result);
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function testGte(): void
    {
        // Arrange

        $expression = new Gte(
            new BaseValue(BaseType::INTEGER, 4),
            new BaseValue(BaseType::INTEGER, 3),
        );

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertTrue($result);
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function testGt(): void
    {
        // Arrange

        $expression = new Gt(
            new BaseValue(BaseType::INTEGER, 4),
            new BaseValue(BaseType::INTEGER, 3),
        );

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertTrue($result);
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function testLte(): void
    {
        // Arrange

        $expression = new Lte(
            new BaseValue(BaseType::INTEGER, 4),
            new BaseValue(BaseType::INTEGER, 3),
        );

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertFalse($result);
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function testLt(): void
    {
        // Arrange

        $expression = new Lt(
            new BaseValue(BaseType::INTEGER, 4),
            new BaseValue(BaseType::INTEGER, 3),
        );

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertFalse($result);
        $this->assertCount(2, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function testIsNull(): void
    {
        // Arrange

        $expression = new IsNull(new Variable('RESPONSE'));

        // Act

        $result = $expression->evaluate($this->itemState);

        // Assert

        $this->assertTrue($result);
        $this->assertCount(1, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::BOOLEAN, $expression->getBaseType($this->itemState));
    }

    #[Test]
    public function testProduct(): void
    {
        // Test with multiple integers
        $expression = new Product([
            new BaseValue(BaseType::INTEGER, '2'),
            new BaseValue(BaseType::INTEGER, '3'),
            new BaseValue(BaseType::INTEGER, '4'),
        ]);

        $this->assertEquals(24, $expression->evaluate($this->itemState));
        $this->assertCount(3, $expression->children());
        $this->assertEquals(Cardinality::SINGLE, $expression->getCardinality($this->itemState));
        $this->assertEquals(BaseType::FLOAT, $expression->getBaseType($this->itemState));

        // Test with floats
        $expression = new Product([
            new BaseValue(BaseType::FLOAT, '1.5'),
            new BaseValue(BaseType::FLOAT, '2.5'),
        ]);

        $this->assertEquals(3.75, $expression->evaluate($this->itemState));

        // Test with mixed types
        $expression = new Product([
            new BaseValue(BaseType::INTEGER, '2'),
            new BaseValue(BaseType::FLOAT, '1.5'),
        ]);

        $this->assertEquals(3.0, $expression->evaluate($this->itemState));

        // Test with empty array
        $expression = new Product([]);
        $this->assertEquals(1, $expression->evaluate($this->itemState));
    }
}
