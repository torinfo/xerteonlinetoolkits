<?php

declare(strict_types=1);

namespace Qti3\Shared\Model;

enum Cardinality: string
{
    case SINGLE = 'single';
    case MULTIPLE = 'multiple';
    case ORDERED = 'ordered';
    case RECORD = 'record';
}
