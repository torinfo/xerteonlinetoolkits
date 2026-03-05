<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Shared\Xml\Reader;

use InvalidArgumentException;
use Qti3\Shared\Xml\Reader\XmlParsingException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class XmlParsingExceptionTest extends TestCase
{
    #[Test]
    public function canBeConstructedAndExtendsInvalidArgumentException(): void
    {
        $exception = new XmlParsingException('Test error message');

        $this->assertInstanceOf(InvalidArgumentException::class, $exception);
        $this->assertEquals('Test error message', $exception->getMessage());
    }
}
