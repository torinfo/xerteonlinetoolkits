<?php

declare(strict_types=1);

namespace Qti3\Package\Validator;

use Qti3\Shared\Exception\DomainError;
use Qti3\Shared\Exception\ErrorType;
use Qti3\Shared\Exception\HasValidationErrors;
use Qti3\Shared\Collection\StringCollection;

class QtiPackageValidationError extends DomainError implements HasValidationErrors
{
    public function __construct(
        public StringCollection $validationErrors,
        public string $messagePrefix = 'Validation errors',
    ) {
        parent::__construct($this->errorMessage());
    }

    public function errorCode(): string
    {
        return 'validation_errors';
    }

    protected function errorMessage(): string
    {
        return $this->messagePrefix . ': ' . $this->validationErrors->join(', ');
    }

    public function errorType(): ErrorType
    {
        return ErrorType::VALIDATION;
    }

    public function validationErrors(): StringCollection
    {
        return $this->validationErrors;
    }
}
