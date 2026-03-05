<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseElseIf;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResponseElseIfTest extends TestCase
{
    private ResponseElseIf $responseElseIf;

    protected function setUp(): void
    {
        $this->responseElseIf = new ResponseElseIf(
            new IsNull(new Variable('variable')),
            [new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value'))],
        );
    }

    #[Test]
    public function testResponseElseIf(): void
    {
        $this->assertInstanceOf(IsNull::class, $this->responseElseIf->children()[0]);
        $this->assertInstanceOf(SetOutcomeValue::class, $this->responseElseIf->children()[1]);
    }
}
