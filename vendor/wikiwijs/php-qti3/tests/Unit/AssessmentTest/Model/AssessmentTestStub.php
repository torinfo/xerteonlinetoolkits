<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Model;

use Qti3\AssessmentItem\Model\AssessmentItemId;
use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\AssessmentTest\Model\AssessmentTestId;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRef;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRefCollection;
use Qti3\AssessmentTest\Model\Section\AssessmentSection;
use Qti3\AssessmentTest\Model\Section\AssessmentSectionCollection;
use Qti3\AssessmentTest\Model\TestPart\NavigationMode;
use Qti3\AssessmentTest\Model\TestPart\SubmissionMode;
use Qti3\AssessmentTest\Model\TestPart\TestPart;
use Qti3\AssessmentTest\Model\TestPart\TestPartCollection;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;

class AssessmentTestStub
{
    public static function assessmentTest(): AssessmentTest
    {
        return new AssessmentTest(
            AssessmentTestId::fromString('e076edda-bf70-5105-a9a9-118d7eecd0c4'),
            new OutcomeDeclarationCollection([]),
            new TestPartCollection([
                new TestPart(
                    'id',
                    NavigationMode::LINEAR,
                    SubmissionMode::INDIVIDUAL,
                    new AssessmentSectionCollection([
                        new AssessmentSection(
                            'id',
                            'title',
                            new AssessmentItemRefCollection([
                                new AssessmentItemRef(
                                    AssessmentItemId::fromString('10fe19b2-8b6e-53fa-8522-1220c67ddce1'),
                                    'ITEM001.xml',
                                ),
                            ]),
                        ),
                    ]),
                ),
            ]),
            'title',
        );
    }

    public static function assessmentTestWithTwoItems(): AssessmentTest
    {
        return new AssessmentTest(
            AssessmentTestId::fromString('e076edda-bf70-5105-a9a9-118d7eecd0c4'),
            new OutcomeDeclarationCollection([]),
            new TestPartCollection([
                new TestPart(
                    'id',
                    NavigationMode::LINEAR,
                    SubmissionMode::INDIVIDUAL,
                    new AssessmentSectionCollection([
                        new AssessmentSection(
                            'id',
                            'title',
                            new AssessmentItemRefCollection([
                                new AssessmentItemRef(
                                    AssessmentItemId::fromString('10fe19b2-8b6e-53fa-8522-1220c67ddce1'),
                                    'ITEM001.xml',
                                ),
                                new AssessmentItemRef(
                                    AssessmentItemId::fromString('22222222-2222-2222-2222-222222222222'),
                                    'ITEM002.xml',
                                ),
                            ]),
                        ),
                    ]),
                ),
            ]),
            'title',
        );
    }
}
