<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Feedback;

enum Visibility: string
{
    case SHOW = 'show';
    case HIDE = 'hide';
}
