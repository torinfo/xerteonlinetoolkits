<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseProcessing;

use Qti3\AssessmentItem\Model\ResponseDeclaration\AreaMapEntry;
use Qti3\AssessmentItem\Model\ResponseDeclaration\AreaMapping;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclaration;
use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclarationCollection;
use Qti3\AssessmentItem\Model\Shape\Circle;
use Qti3\AssessmentItem\Model\Shape\Coordinate;
use Qti3\AssessmentItem\Model\Shape\DefaultShape;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use Qti3\AssessmentItem\Model\ResponseProcessing\MapResponsePoint;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;
use Qti3\AssessmentItem\Model\State\ItemState;
use Qti3\AssessmentItem\Model\State\OutcomeSet;
use Qti3\AssessmentItem\Model\State\ResponseSet;
use Exception;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MapResponsePointTest extends TestCase
{
    private MapResponsePoint $mapResponsePoint;

    protected function setUp(): void
    {
        $this->mapResponsePoint = new MapResponsePoint('identifier');
    }

    #[Test]
    public function testMapResponsePoint(): void
    {
        $responseDeclaration = new ResponseDeclaration(BaseType::STRING, Cardinality::SINGLE, 'identifier');
        $responseDeclarations = new ResponseDeclarationCollection([$responseDeclaration]);
        $responseSet = new ResponseSet($responseDeclarations);
        $outcomeSet = new OutcomeSet(new OutcomeDeclarationCollection([]));
        $itemState = new ItemState($responseSet, $outcomeSet, new ResponseProcessing([]));

        $this->assertEquals(
            [
                'identifier' => 'identifier',
            ],
            $this->mapResponsePoint->attributes(),
        );
        $this->assertEquals(BaseType::FLOAT, $this->mapResponsePoint->getBaseType($itemState));
        $this->assertEquals(Cardinality::SINGLE, $this->mapResponsePoint->getCardinality($itemState));
    }

    #[Test]
    public function testEvaluateWithNoAreaMapping(): void
    {
        // Arrange
        $responseDeclaration = new ResponseDeclaration(BaseType::STRING, Cardinality::SINGLE, 'identifier');
        $responseDeclarations = new ResponseDeclarationCollection([$responseDeclaration]);
        $responseSet = new ResponseSet($responseDeclarations);
        $outcomeSet = new OutcomeSet(new OutcomeDeclarationCollection([]));
        $itemState = new ItemState($responseSet, $outcomeSet, new ResponseProcessing([]));

        // Act
        $result = $this->mapResponsePoint->evaluate($itemState);

        // Assert
        $this->assertEquals(0, $result);
    }

    #[Test]
    public function testEvaluateWithNonArrayResponseValue(): void
    {
        // Arrange
        $areaMapping = new AreaMapping([], '0');
        $responseDeclaration = new ResponseDeclaration(
            BaseType::STRING,
            Cardinality::SINGLE,
            'identifier',
            null,
            null,
            $areaMapping,
        );
        $responseDeclarations = new ResponseDeclarationCollection([$responseDeclaration]);
        $responseSet = new ResponseSet($responseDeclarations);
        $responseSet->responses['identifier'] = 'not-an-array';
        $outcomeSet = new OutcomeSet(new OutcomeDeclarationCollection([]));
        $itemState = new ItemState($responseSet, $outcomeSet, new ResponseProcessing([]));

        // Act
        $result = $this->mapResponsePoint->evaluate($itemState);

        // Assert
        $this->assertEquals(0, $result);
    }

    #[Test]
    public function testEvaluateWithNonStringResponsePoint(): void
    {
        // Arrange
        $circle = new Circle(new Coordinate('50'), new Coordinate('50'), new Coordinate('10'));
        $areaMapEntry = new AreaMapEntry($circle, 1.0);
        $areaMapping = new AreaMapping([$areaMapEntry], '0');
        $responseDeclaration = new ResponseDeclaration(
            BaseType::STRING,
            Cardinality::SINGLE,
            'identifier',
            null,
            null,
            $areaMapping,
        );
        $responseDeclarations = new ResponseDeclarationCollection([$responseDeclaration]);
        $responseSet = new ResponseSet($responseDeclarations);
        $responseSet->responses['identifier'] = [123]; // Non-string response point
        $outcomeSet = new OutcomeSet(new OutcomeDeclarationCollection([]));
        $itemState = new ItemState($responseSet, $outcomeSet, new ResponseProcessing([]));

        // Act & Assert
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Response point is not a string');
        $this->mapResponsePoint->evaluate($itemState);
    }

    #[Test]
    public function testEvaluateWithDefaultShape(): void
    {
        // Arrange
        $defaultShape = new DefaultShape();
        $areaMapEntry = new AreaMapEntry($defaultShape, 2.5);
        $areaMapping = new AreaMapping([$areaMapEntry], '0');
        $responseDeclaration = new ResponseDeclaration(
            BaseType::STRING,
            Cardinality::SINGLE,
            'identifier',
            null,
            null,
            $areaMapping,
        );
        $responseDeclarations = new ResponseDeclarationCollection([$responseDeclaration]);
        $responseSet = new ResponseSet($responseDeclarations);
        $responseSet->responses['identifier'] = ['12 34'];
        $outcomeSet = new OutcomeSet(
            new OutcomeDeclarationCollection([]),
        );
        $itemState = new ItemState($responseSet, $outcomeSet, new ResponseProcessing([]));

        // Act
        $result = $this->mapResponsePoint->evaluate($itemState);

        // Assert
        $this->assertEquals(2.5, $result);
    }
}
