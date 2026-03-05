<?php

declare(strict_types=1);

namespace Qti3\Shared\Exception;

use DomainException;

abstract class DomainError extends DomainException
{
    abstract public function errorCode(): string;

    abstract public function errorType(): ErrorType;
}
