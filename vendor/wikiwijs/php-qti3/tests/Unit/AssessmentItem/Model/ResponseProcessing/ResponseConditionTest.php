<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model\ResponseProcessing;

use Qti3\Shared\Model\BaseType;
use Qti3\Shared\Model\Processing\BaseValue;
use Qti3\Shared\Model\Processing\IsNull;
use Qti3\Shared\Model\Processing\SetOutcomeValue;
use Qti3\Shared\Model\Processing\Variable;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseCondition;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseElse;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseElseIf;
use Qti3\AssessmentItem\Model\ResponseProcessing\ResponseIf;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ResponseConditionTest extends TestCase
{
    private ResponseCondition $responseCondition;

    protected function setUp(): void
    {
        $this->responseCondition = new ResponseCondition(
            if: new ResponseIf(
                new IsNull(new Variable('variable')),
                [new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value'))],
            ),
            elseIfs: [
                new ResponseElseIf(
                    new IsNull(new Variable('variable')),
                    [new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value'))],
                ),
            ],
            else: new ResponseElse(
                [new SetOutcomeValue('identifier', new BaseValue(BaseType::STRING, 'value'))],
            ),
        );
    }

    #[Test]
    public function testResponseCondition(): void
    {
        $this->assertInstanceOf(ResponseIf::class, $this->responseCondition->children()[0]);
        $this->assertInstanceOf(ResponseElseIf::class, $this->responseCondition->children()[1]);
        $this->assertInstanceOf(ResponseElse::class, $this->responseCondition->children()[2]);
    }

    #[Test]
    public function testFeedbackCorrectCreatesCorrectStructure(): void
    {
        $correctCondition = new IsNull(new Variable('RESPONSE'));
        $result = ResponseCondition::feedbackCorrect($correctCondition);

        $this->assertInstanceOf(ResponseCondition::class, $result);

        // Verify the ResponseIf
        $responseIf = $result->if;
        $this->assertInstanceOf(ResponseIf::class, $responseIf);
        $this->assertSame($correctCondition, $responseIf->condition);
        $this->assertCount(1, $responseIf->processingElements);

        $setOutcomeIf = $responseIf->processingElements[0];
        $this->assertInstanceOf(SetOutcomeValue::class, $setOutcomeIf);
        $this->assertSame('FEEDBACK', $setOutcomeIf->identifier);
        $this->assertInstanceOf(BaseValue::class, $setOutcomeIf->value);
        $this->assertSame(BaseType::IDENTIFIER, $setOutcomeIf->value->baseType);
        $this->assertSame('correct', $setOutcomeIf->value->value);

        // Verify the ResponseElse
        $responseElse = $result->else;
        $this->assertInstanceOf(ResponseElse::class, $responseElse);
        $this->assertCount(1, $responseElse->processingElements);

        $setOutcomeElse = $responseElse->processingElements[0];
        $this->assertInstanceOf(SetOutcomeValue::class, $setOutcomeElse);
        $this->assertSame('FEEDBACK', $setOutcomeElse->identifier);
        $this->assertInstanceOf(BaseValue::class, $setOutcomeElse->value);
        $this->assertSame(BaseType::IDENTIFIER, $setOutcomeElse->value->baseType);
        $this->assertSame('incorrect', $setOutcomeElse->value->value);
    }

    #[Test]
    public function testFeedbackBooleanCreatesCorrectStructure(): void
    {
        $result = ResponseCondition::feedbackBoolean();

        $this->assertInstanceOf(ResponseCondition::class, $result);

        // Verify the ResponseIf
        $responseIf = $result->if;
        $this->assertInstanceOf(ResponseIf::class, $responseIf);
        $this->assertInstanceOf(IsNull::class, $responseIf->condition);
        $this->assertCount(1, $responseIf->processingElements);

        $setOutcomeIf = $responseIf->processingElements[0];
        $this->assertInstanceOf(SetOutcomeValue::class, $setOutcomeIf);
        $this->assertSame('FEEDBACK', $setOutcomeIf->identifier);
        $this->assertInstanceOf(BaseValue::class, $setOutcomeIf->value);
        $this->assertSame(BaseType::IDENTIFIER, $setOutcomeIf->value->baseType);
        $this->assertSame('false', $setOutcomeIf->value->value);

        // Verify the ResponseElse
        $responseElse = $result->else;
        $this->assertInstanceOf(ResponseElse::class, $responseElse);
        $this->assertCount(1, $responseElse->processingElements);

        $setOutcomeElse = $responseElse->processingElements[0];
        $this->assertInstanceOf(SetOutcomeValue::class, $setOutcomeElse);
        $this->assertSame('FEEDBACK', $setOutcomeElse->identifier);
        $this->assertInstanceOf(BaseValue::class, $setOutcomeElse->value);
        $this->assertSame(BaseType::IDENTIFIER, $setOutcomeElse->value->baseType);
        $this->assertSame('true', $setOutcomeElse->value->value);
    }
}
