<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Exception;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Shared\Exception\ErrorType;
use Qti3\Shared\Exception\ResourceNotFoundException;

class ResourceNotFoundExceptionTest extends TestCase
{
    #[Test]
    public function errorCodeReturnsResourceNotFound(): void
    {
        $exception = new ResourceNotFoundException('App\\Model\\User', '123');

        $this->assertSame('resource_not_found', $exception->errorCode());
    }

    #[Test]
    public function errorTypeReturnsNotFound(): void
    {
        $exception = new ResourceNotFoundException('App\\Model\\User', '123');

        $this->assertSame(ErrorType::NOT_FOUND, $exception->errorType());
    }

    #[Test]
    public function getMessageReturnsCustomMessageWhenProvided(): void
    {
        $customMessage = 'The requested user does not exist.';
        $exception = new ResourceNotFoundException('App\\Model\\User', '123', $customMessage);

        $this->assertSame($customMessage, $exception->getMessage());
    }

    #[Test]
    public function getMessageReturnsFormattedDefaultMessageWhenNoCustomMessage(): void
    {
        $exception = new ResourceNotFoundException('App\\Model\\User', '42');

        $this->assertSame('Resource `User` with ID `42` could not be found.', $exception->getMessage());
    }
}
