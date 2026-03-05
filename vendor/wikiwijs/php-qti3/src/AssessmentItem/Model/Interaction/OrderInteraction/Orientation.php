<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Interaction\OrderInteraction;

enum Orientation: string
{
    case HORIZONTAL = 'horizontal';
    case VERTICAL = 'vertical';
}
