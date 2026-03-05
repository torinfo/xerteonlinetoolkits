<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\FileContent;

use League\Flysystem\FilesystemOperator;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Model\FileContent\FlysystemFileContent;

class FlysystemFileContentTest extends TestCase
{
    #[Test]
    public function getContentReturnsDataFromFilesystem(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);
        $dataStorage->expects($this->once())
            ->method('read')
            ->with('path/to/file.xml')
            ->willReturn('<root>content</root>');

        $fileContent = new FlysystemFileContent($dataStorage, 'path/to/file.xml');

        $this->assertSame('<root>content</root>', $fileContent->getContent());
    }

    #[Test]
    public function getStreamReturnsArrayWithContent(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);
        $dataStorage->method('read')
            ->with('path/to/file.txt')
            ->willReturn('file contents');

        $fileContent = new FlysystemFileContent($dataStorage, 'path/to/file.txt');

        $stream = $fileContent->getStream();

        $this->assertIsIterable($stream);

        $chunks = [];
        foreach ($stream as $chunk) {
            $chunks[] = $chunk;
        }

        $this->assertCount(1, $chunks);
        $this->assertSame('file contents', $chunks[0]);
    }

    #[Test]
    public function getContentReturnsEmptyStringWhenFileIsEmpty(): void
    {
        $dataStorage = $this->createMock(FilesystemOperator::class);
        $dataStorage->method('read')
            ->with('empty.txt')
            ->willReturn('');

        $fileContent = new FlysystemFileContent($dataStorage, 'empty.txt');

        $this->assertSame('', $fileContent->getContent());
    }
}
