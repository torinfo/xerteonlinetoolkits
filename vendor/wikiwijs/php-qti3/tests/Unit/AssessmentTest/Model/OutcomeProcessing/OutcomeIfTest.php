<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model\OutcomeProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\AssessmentTest\Model\OutcomeProcessing\OutcomeIf;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class OutcomeIfTest extends TestCase
{
    private OutcomeIf $outcomeIf;

    protected function setUp(): void
    {
        $this->outcomeIf = new OutcomeIf(
            new IsNull(new Variable('variable')),
            new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value')),
        );
    }

    #[Test]
    public function testOutcomeIfChildren(): void
    {
        $children = $this->outcomeIf->children();
        $this->assertInstanceOf(IsNull::class, $children[0]);
        $this->assertInstanceOf(SetOutcomeValue::class, $children[1]);
    }
}
