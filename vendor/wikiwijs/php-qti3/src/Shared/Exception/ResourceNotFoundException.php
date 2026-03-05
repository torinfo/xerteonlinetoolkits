<?php

declare(strict_types=1);

namespace Qti3\Shared\Exception;

use Stringable;

final class ResourceNotFoundException extends DomainError
{
    public function __construct(
        private readonly string $resourceClass,
        private readonly string|Stringable $resourceId,
        private readonly ?string $customMessage = null,
    ) {
        parent::__construct($this->errorMessage());
    }

    public function errorCode(): string
    {
        return 'resource_not_found';
    }

    public function errorType(): ErrorType
    {
        return ErrorType::NOT_FOUND;
    }

    protected function errorMessage(): string
    {
        if ($this->customMessage !== null) {
            return $this->customMessage;
        }

        return sprintf(
            'Resource `%s` with ID `%s` could not be found.',
            $this->shortClassName($this->resourceClass),
            $this->resourceId,
        );
    }

    private function shortClassName(string $fqcn): string
    {
        $parts = explode('\\', $fqcn);
        return end($parts);
    }
}
