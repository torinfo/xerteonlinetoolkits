<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseCondition;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseIf;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseProcessing;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResponseProcessingTest extends TestCase
{
    private ResponseProcessing $responseProcessing;

    protected function setUp(): void
    {
        $this->responseProcessing = new ResponseProcessing([
            new ResponseCondition(
                if: new ResponseIf(
                    new IsNull(new Variable('variable')),
                    [new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value'))],
                ),
            ),
        ]);
    }

    #[Test]
    public function testResponseProcessing(): void
    {
        $this->assertInstanceOf(ResponseCondition::class, $this->responseProcessing->children()[0]);
    }

    #[Test]
    public function testMatchCorrect(): void
    {
        $responseProcessing = ResponseProcessing::matchCorrect();
        $this->assertInstanceOf(ResponseCondition::class, $responseProcessing->children()[0]);
    }

    #[Test]
    public function testMapResponse(): void
    {
        $responseProcessing = ResponseProcessing::mapResponse();
        $this->assertInstanceOf(ResponseCondition::class, $responseProcessing->children()[0]);
    }
}
