<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Model\TestPart;

enum NavigationMode: string
{
    case LINEAR = 'linear';
    case NONLINEAR = 'nonlinear';
}
