<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem\Zip\Exception;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\Zip\Exception\ZipArchiveOpenFileException;
use RuntimeException;

class ZipArchiveOpenFileExceptionTest extends TestCase
{
    #[Test]
    public function exceptionMessageContainsFilePath(): void
    {
        $exception = new ZipArchiveOpenFileException('/path/to/archive.zip');

        $this->assertSame(
            'Unable to create or overwrite ZipArchive for filepath </path/to/archive.zip>',
            $exception->getMessage()
        );
    }

    #[Test]
    public function exceptionExtendsRuntimeException(): void
    {
        $exception = new ZipArchiveOpenFileException('/some/path.zip');

        $this->assertInstanceOf(RuntimeException::class, $exception);
    }
}
