<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeCondition;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeElse;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeElseIf;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeIf;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OutcomeConditionTest extends TestCase
{
    private OutcomeCondition $outcomeCondition;

    protected function setUp(): void
    {
        $this->outcomeCondition = new OutcomeCondition(
            if: new OutcomeIf(
                new IsNull(new Variable('variable')),
                new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value')),
            ),
            elseIfs: [
                new OutcomeElseIf(
                    new IsNull(new Variable('variable')),
                    new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value')),
                ),
            ],
            else: new OutcomeElse(
                new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value')),
            ),
        );
    }

    #[Test]
    public function testOutcomeConditionChildren(): void
    {
        $children = $this->outcomeCondition->children();

        $this->assertInstanceOf(OutcomeIf::class, $children[0]);
        $this->assertInstanceOf(OutcomeElseIf::class, $children[1]);
        $this->assertInstanceOf(OutcomeElse::class, $children[2]);
    }
}
