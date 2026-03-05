<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Exception;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Shared\Exception\NotFoundException;
use RuntimeException;

class NotFoundExceptionTest extends TestCase
{
    #[Test]
    public function constructorSetsMessageAndDefaults(): void
    {
        $exception = new NotFoundException('Item not found');

        $this->assertSame('Item not found', $exception->getMessage());
        $this->assertSame('', $exception->errorCode);
        $this->assertSame(0, $exception->getCode());
        $this->assertNull($exception->getPrevious());
    }

    #[Test]
    public function constructorSetsAllParameters(): void
    {
        $previous = new RuntimeException('previous error');
        $exception = new NotFoundException('Resource missing', 'resource_not_found', $previous);

        $this->assertSame('Resource missing', $exception->getMessage());
        $this->assertSame('resource_not_found', $exception->errorCode);
        $this->assertSame(0, $exception->getCode());
        $this->assertSame($previous, $exception->getPrevious());
    }

    #[Test]
    public function itExtendsRuntimeException(): void
    {
        $exception = new NotFoundException('test');

        $this->assertInstanceOf(RuntimeException::class, $exception);
    }
}
