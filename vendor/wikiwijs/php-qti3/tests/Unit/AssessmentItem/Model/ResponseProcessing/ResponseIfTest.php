<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseIf;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResponseIfTest extends TestCase
{
    private ResponseIf $responseIf;

    protected function setUp(): void
    {
        $this->responseIf = new ResponseIf(
            new IsNull(new Variable('variable')),
            [new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value'))],
        );
    }

    #[Test]
    public function testResponseIf(): void
    {
        $this->assertInstanceOf(IsNull::class, $this->responseIf->children()[0]);
        $this->assertInstanceOf(SetOutcomeValue::class, $this->responseIf->children()[1]);
    }
}
