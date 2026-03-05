<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\FileContent;

use Qti3\Package\Model\FileContent\ExternalFileContent;
use Qti3\Package\Downloader\Resource\IResourceDownloader;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use RuntimeException;

class ExternalFileContentTest extends TestCase
{
    #[Test]
    public function getContentsReturnsDownloadedContent(): void
    {
        // Arrange

        $resourceDownloader = $this->createMock(IResourceDownloader::class);
        $resourceDownloader->expects($this->once())
            ->method('downloadFileToStream')
            ->with('https://example.com/file.txt')
            ->willReturn([
                'a', 'b', 'c',
            ]);

        // Act

        $externalFileContent = new ExternalFileContent(
            'https://example.com/file.txt',
            $resourceDownloader,
        );

        // Assert

        $this->assertEquals('abc', $externalFileContent->getContent());
    }

    #[Test]
    public function getContentThrowsWhenExceedingMaxMemoryUsage(): void
    {
        // Arrange

        $url = 'http://example.com/large';

        $downloader = $this->createMock(IResourceDownloader::class);
        $downloader
            ->method('downloadFileToStream')
            ->with($url)
            ->willReturn((function() {
                yield str_repeat('A', ExternalFileContent::MAX_MEMORY_USAGE + 1);
            })());

        $fileContent = new ExternalFileContent($url, $downloader);

        // Act & Assert

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('File content exceeds maximum memory usage');

        $fileContent->getContent();
    }

}
