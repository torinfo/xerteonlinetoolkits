<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\Feedback;

enum TestFeedbackAccess: string
{
    case AT_END = 'atEnd';
    case DURING = 'during';
}
