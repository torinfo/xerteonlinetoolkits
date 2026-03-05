<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeElseIf;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OutcomeElseIfTest extends TestCase
{
    private OutcomeElseIf $outcomeElseIf;

    protected function setUp(): void
    {
        $this->outcomeElseIf = new OutcomeElseIf(
            new IsNull(new Variable('variable')),
            new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value')),
        );
    }

    #[Test]
    public function testOutcomeElseIfChildren(): void
    {
        $children = $this->outcomeElseIf->children();

        $this->assertInstanceOf(IsNull::class, $children[0]);
        $this->assertInstanceOf(SetOutcomeValue::class, $children[1]);
    }
}
