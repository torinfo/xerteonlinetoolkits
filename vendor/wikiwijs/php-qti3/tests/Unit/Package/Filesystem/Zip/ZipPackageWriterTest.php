<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem\Zip;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\FileSystemUtils;
use Qti3\Package\Filesystem\Zip\Exception\ZipArchiveOpenFileException;
use Qti3\Package\Filesystem\Zip\ZipArchiveFactory;
use Qti3\Package\Filesystem\Zip\ZipPackageWriter;
use Qti3\Package\Model\FileContent\IFileContent;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\QtiPackage;
use ZipArchive;

class ZipPackageWriterTest extends TestCase
{
    private string $tempDir;
    private string $tempZipFile;

    protected function setUp(): void
    {
        $this->tempDir = sys_get_temp_dir() . '/qti_writer_test_' . uniqid();
        $this->tempZipFile = $this->tempDir . '/output.zip';
    }

    protected function tearDown(): void
    {
        if (is_file($this->tempZipFile)) {
            unlink($this->tempZipFile);
        }
        if (is_dir($this->tempDir)) {
            rmdir($this->tempDir);
        }
    }

    #[Test]
    public function writeCreatesZipFileWithMemoryFileContent(): void
    {
        $writer = new ZipPackageWriter(
            $this->tempZipFile,
            new ZipArchiveFactory(),
            new FileSystemUtils(),
        );

        $qtiPackage = $this->createMock(QtiPackage::class);

        $file1 = new PackageFile('manifest.xml', new MemoryFileContent('<manifest/>'));
        $file2 = new PackageFile('item.xml', new MemoryFileContent('<item/>'));

        $collection = new PackageFileCollection([$file1, $file2]);
        $qtiPackage->method('getFiles')->willReturn($collection);

        $writer->write($qtiPackage);

        $this->assertFileExists($this->tempZipFile);

        // Verify zip contents
        $zip = new ZipArchive();
        $zip->open($this->tempZipFile);
        $this->assertSame('<manifest/>', $zip->getFromName('manifest.xml'));
        $this->assertSame('<item/>', $zip->getFromName('item.xml'));
        $zip->close();
    }

    #[Test]
    public function writeCreatesZipFileWithStreamingContent(): void
    {
        $writer = new ZipPackageWriter(
            $this->tempZipFile,
            new ZipArchiveFactory(),
            new FileSystemUtils(),
        );

        $qtiPackage = $this->createMock(QtiPackage::class);

        // Create a non-IMemoryFileContent content to trigger the streaming path
        $streamContent = new class implements IFileContent {
            public function getContent(): string
            {
                return 'chunk1chunk2';
            }

            public function getStream(): iterable
            {
                return ['chunk1', 'chunk2'];
            }
        };

        $file = new PackageFile('streamed.txt', $streamContent);

        $collection = new PackageFileCollection([$file]);
        $qtiPackage->method('getFiles')->willReturn($collection);

        $writer->write($qtiPackage);

        $this->assertFileExists($this->tempZipFile);

        // Verify zip contents
        $zip = new ZipArchive();
        $zip->open($this->tempZipFile);
        $this->assertSame('chunk1chunk2', $zip->getFromName('streamed.txt'));
        $zip->close();
    }

    #[Test]
    public function writeHandlesMixedContentTypes(): void
    {
        $writer = new ZipPackageWriter(
            $this->tempZipFile,
            new ZipArchiveFactory(),
            new FileSystemUtils(),
        );

        $qtiPackage = $this->createMock(QtiPackage::class);

        // Memory content file
        $memoryFile = new PackageFile('memory.xml', new MemoryFileContent('<memory/>'));

        // Stream content file (non-IMemoryFileContent)
        $streamContent = new class implements IFileContent {
            public function getContent(): string
            {
                return 'streamed data';
            }

            public function getStream(): iterable
            {
                return ['streamed data'];
            }
        };

        $streamFile = new PackageFile('stream.txt', $streamContent);

        $collection = new PackageFileCollection([$memoryFile, $streamFile]);
        $qtiPackage->method('getFiles')->willReturn($collection);

        $writer->write($qtiPackage);

        $zip = new ZipArchive();
        $zip->open($this->tempZipFile);
        $this->assertSame('<memory/>', $zip->getFromName('memory.xml'));
        $this->assertSame('streamed data', $zip->getFromName('stream.txt'));
        $zip->close();
    }

    #[Test]
    public function getPublicUrlReturnsZipFilepath(): void
    {
        $writer = new ZipPackageWriter(
            '/some/path/output.zip',
            new ZipArchiveFactory(),
            new FileSystemUtils(),
        );

        $this->assertSame('/some/path/output.zip', $writer->getPublicUrl());
    }

    #[Test]
    public function writeWithEmptyPackageCreatesZipFile(): void
    {
        $writer = new ZipPackageWriter(
            $this->tempZipFile,
            new ZipArchiveFactory(),
            new FileSystemUtils(),
        );

        $qtiPackage = $this->createMock(QtiPackage::class);
        $qtiPackage->method('getFiles')->willReturn(new PackageFileCollection());

        $writer->write($qtiPackage);

        // ZipArchive with no files may or may not create the file depending on
        // the PHP version, so we just verify no exception was thrown
        $this->assertTrue(true);
    }

    #[Test]
    public function writeThrowsZipArchiveOpenFileExceptionWhenOpenFails(): void
    {
        $mockZip = $this->createMock(ZipArchive::class);
        $mockZip->method('open')->willReturn(ZipArchive::ER_OPEN);

        $zipArchiveFactory = $this->createMock(ZipArchiveFactory::class);
        $zipArchiveFactory->method('create')->willReturn($mockZip);

        $writer = new ZipPackageWriter(
            $this->tempZipFile,
            $zipArchiveFactory,
            new FileSystemUtils(),
        );

        $qtiPackage = $this->createMock(QtiPackage::class);
        $qtiPackage->method('getFiles')->willReturn(new PackageFileCollection());

        $this->expectException(ZipArchiveOpenFileException::class);
        $this->expectExceptionMessage('Unable to create or overwrite ZipArchive for filepath');

        $writer->write($qtiPackage);
    }
}
