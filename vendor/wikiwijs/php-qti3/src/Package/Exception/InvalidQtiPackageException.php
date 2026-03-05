<?php

declare(strict_types=1);

namespace Qti3\Package\Exception;

use Qti3\Shared\Exception\DomainError;
use Qti3\Shared\Exception\ErrorType;
use Qti3\Shared\Exception\HasValidationErrors;
use Qti3\Shared\Collection\StringCollection;

final class InvalidQtiPackageException extends DomainError implements HasValidationErrors
{
    public function __construct(
        private readonly StringCollection $validationErrors,
    ) {
        parent::__construct($this->errorMessage());
    }

    public function errorCode(): string
    {
        return 'invalid_qti_package';
    }

    public function errorType(): ErrorType
    {
        return ErrorType::VALIDATION;
    }

    protected function errorMessage(): string
    {
        return 'QTI package is invalid';
    }

    public function validationErrors(): StringCollection
    {
        return $this->validationErrors;
    }
}
