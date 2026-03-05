<?php

declare(strict_types=1);

namespace Qti3\AssessmentItem\Model\Shape;

enum ShapeName: string
{
    case DEFAULT = 'default';
    case CIRCLE = 'circle';
    case RECTANGLE = 'rect';
    case POLYGON = 'poly';
}
