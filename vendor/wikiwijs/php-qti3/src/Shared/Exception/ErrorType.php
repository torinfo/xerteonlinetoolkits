<?php

declare(strict_types=1);

namespace Qti3\Shared\Exception;

enum ErrorType: string
{
    case NOT_FOUND = 'not_found';
    case GONE = 'gone';
    case VALIDATION = 'validation';
    case INTERNAL = 'internal';
}
