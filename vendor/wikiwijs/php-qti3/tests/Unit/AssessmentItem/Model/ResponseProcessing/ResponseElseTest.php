<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseElse;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResponseElseTest extends TestCase
{
    private ResponseElse $responseElse;

    protected function setUp(): void
    {
        $this->responseElse = new ResponseElse(
            [new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value'))],
        );
    }

    #[Test]
    public function testResponseElse(): void
    {
        $this->assertInstanceOf(SetOutcomeValue::class, $this->responseElse->children()[0]);
    }
}
