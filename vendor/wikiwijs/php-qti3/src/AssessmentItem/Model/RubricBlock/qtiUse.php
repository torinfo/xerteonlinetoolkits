<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\RubricBlock;

enum qtiUse: string
{
    case INSTRUCTIONS = 'instructions';
    case SCORING = 'scoring';
    case NAVIGATION = 'navigation';
}
