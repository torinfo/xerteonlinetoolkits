<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\TestPart;

enum SubmissionMode: string
{
    case INDIVIDUAL = 'individual';
    case SIMULTANEOUS = 'simultaneous';
}
