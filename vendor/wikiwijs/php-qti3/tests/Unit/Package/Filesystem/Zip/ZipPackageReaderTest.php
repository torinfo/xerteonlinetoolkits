<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem\Zip;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\Zip\ZipArchiveFactory;
use Qti3\Package\Filesystem\Zip\ZipPackageReader;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use RuntimeException;
use ZipArchive;

class ZipPackageReaderTest extends TestCase
{
    private string $tempZipFile;

    /** @var list<string> */
    private array $tempFiles = [];

    protected function setUp(): void
    {
        $this->tempZipFile = tempnam(sys_get_temp_dir(), 'qti_reader_test_') . '.zip';
        $this->tempFiles[] = $this->tempZipFile;

        // Clean up the tempnam file without extension
        $baseName = preg_replace('/\.zip$/', '', $this->tempZipFile);
        if (is_file($baseName)) {
            $this->tempFiles[] = $baseName;
        }

        // Create a valid zip file with a test file inside
        $zip = new ZipArchive();
        $zip->open($this->tempZipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        $zip->addFromString('hello.txt', 'Hello from ZIP!');
        $zip->addFromString('nested/file.xml', '<root>data</root>');
        $zip->close();
    }

    protected function tearDown(): void
    {
        foreach ($this->tempFiles as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    }

    #[Test]
    public function constructorOpensValidZipFile(): void
    {
        $reader = new ZipPackageReader($this->tempZipFile, new ZipArchiveFactory());

        // If we get here, the constructor succeeded
        $this->assertInstanceOf(ZipPackageReader::class, $reader);
    }

    #[Test]
    public function constructorThrowsForInvalidZipFile(): void
    {
        $corruptFile = tempnam(sys_get_temp_dir(), 'qti_corrupt_');
        $this->tempFiles[] = $corruptFile;
        file_put_contents($corruptFile, 'this is not a zip file');

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Could not open ZIP file');

        new ZipPackageReader($corruptFile, new ZipArchiveFactory());
    }

    #[Test]
    public function getFileContentReturnsMemoryFileContent(): void
    {
        $reader = new ZipPackageReader($this->tempZipFile, new ZipArchiveFactory());

        $fileContent = $reader->getFileContent('hello.txt');

        $this->assertInstanceOf(MemoryFileContent::class, $fileContent);
        $this->assertSame('Hello from ZIP!', $fileContent->getContent());
    }

    #[Test]
    public function getFileContentReadsNestedFile(): void
    {
        $reader = new ZipPackageReader($this->tempZipFile, new ZipArchiveFactory());

        $fileContent = $reader->getFileContent('nested/file.xml');

        $this->assertSame('<root>data</root>', $fileContent->getContent());
    }

    #[Test]
    public function getFileContentThrowsForMissingFile(): void
    {
        $reader = new ZipPackageReader($this->tempZipFile, new ZipArchiveFactory());

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('File nonexistent.txt not found in ZIP');

        $reader->getFileContent('nonexistent.txt');
    }

    #[Test]
    public function getLastModifiedReturnsNull(): void
    {
        $reader = new ZipPackageReader($this->tempZipFile, new ZipArchiveFactory());

        $this->assertNull($reader->getLastModified());
    }
}
