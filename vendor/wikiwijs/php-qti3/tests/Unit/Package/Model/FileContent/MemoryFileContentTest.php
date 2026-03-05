<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\FileContent;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class MemoryFileContentTest extends TestCase
{
    #[Test]
    public function getStreamReturnsIterableWithContent(): void
    {
        $content = 'Hello, World!';
        $memoryFileContent = new MemoryFileContent($content);

        $stream = $memoryFileContent->getStream();

        $this->assertIsIterable($stream);
        $this->assertSame([$content], $stream);
    }
}
