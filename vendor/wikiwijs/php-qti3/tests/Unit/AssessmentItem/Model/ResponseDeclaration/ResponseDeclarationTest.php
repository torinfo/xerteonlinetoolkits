<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseDeclaration;

use Qti3\AssessmentItem\Model\ResponseDeclaration\ResponseDeclaration;
use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Cardinality;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResponseDeclarationTest extends TestCase
{
    private ResponseDeclaration $responseDeclaration;

    protected function setUp(): void
    {
        parent::setUp();

        $this->responseDeclaration = new ResponseDeclaration(
            baseType: BaseType::STRING,
            cardinality: Cardinality::SINGLE,
            identifier: 'responseDeclaration',
        );
    }

    #[Test]
    public function testResponseDeclaration(): void
    {
        $expectedAttributes = [
            'identifier' => 'responseDeclaration',
            'cardinality' => 'single',
            'base-type' => 'string',
        ];

        $this->assertEquals($expectedAttributes, $this->responseDeclaration->attributes());
        $this->assertEquals([null, null, null], $this->responseDeclaration->children());
    }
}
