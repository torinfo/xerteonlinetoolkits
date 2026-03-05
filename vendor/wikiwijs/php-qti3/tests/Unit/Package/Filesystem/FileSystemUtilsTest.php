<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem;

use Exception;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\FileSystemUtils;

class FileSystemUtilsTest extends TestCase
{
    private FileSystemUtils $fileSystemUtils;

    /** @var list<string> */
    private array $tempFiles = [];

    /** @var list<string> */
    private array $tempDirs = [];

    protected function setUp(): void
    {
        $this->fileSystemUtils = new FileSystemUtils();
    }

    protected function tearDown(): void
    {
        foreach ($this->tempFiles as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
        foreach ($this->tempDirs as $dir) {
            $this->removeDirectoryRecursively($dir);
        }
    }

    private function removeDirectoryRecursively(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }
        $items = scandir($dir);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            $path = $dir . '/' . $item;
            if (is_dir($path)) {
                $this->removeDirectoryRecursively($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }

    #[Test]
    public function generateTempFilenameReturnsExistingFile(): void
    {
        $filename = $this->fileSystemUtils->generateTempFilename();
        $this->tempFiles[] = $filename;

        $this->assertFileExists($filename);
        $tempDir = realpath(sys_get_temp_dir());
        $this->assertNotFalse($tempDir);
        $this->assertStringStartsWith($tempDir, realpath($filename));
    }

    #[Test]
    public function removeFileDeletesExistingFile(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'qti_test_');
        $this->assertFileExists($file);

        FileSystemUtils::removeFile($file);

        $this->assertFileDoesNotExist($file);
    }

    #[Test]
    public function removeFileDoesNothingForNonExistentFile(): void
    {
        $file = sys_get_temp_dir() . '/qti_nonexistent_' . uniqid();

        // Should not throw
        FileSystemUtils::removeFile($file);

        $this->assertFileDoesNotExist($file);
    }

    #[Test]
    public function ensureDirectoryReturnsEarlyForExistingDirectory(): void
    {
        $dir = sys_get_temp_dir() . '/qti_test_existing_' . uniqid();
        mkdir($dir);
        $this->tempDirs[] = $dir;

        // Should not throw
        $this->fileSystemUtils->ensureDirectory($dir);

        $this->assertDirectoryExists($dir);
    }

    #[Test]
    public function ensureDirectoryCreatesNewDirectory(): void
    {
        $dir = sys_get_temp_dir() . '/qti_test_new_' . uniqid();
        $this->tempDirs[] = $dir;

        $this->assertDirectoryDoesNotExist($dir);

        $this->fileSystemUtils->ensureDirectory($dir);

        $this->assertDirectoryExists($dir);
    }

    #[Test]
    public function ensureDirectoryCreatesNestedDirectories(): void
    {
        $baseDir = sys_get_temp_dir() . '/qti_test_nested_' . uniqid();
        $nestedDir = $baseDir . '/sub/dir';
        $this->tempDirs[] = $baseDir;

        $this->fileSystemUtils->ensureDirectory($nestedDir);

        $this->assertDirectoryExists($nestedDir);
    }

    #[Test]
    public function ensureDirectoryThrowsWhenPathIsAFile(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'qti_test_');
        $this->tempFiles[] = $file;

        $this->expectException(Exception::class);
        $this->expectExceptionMessage(sprintf('A file with the name %s already exists and is not a directory.', $file));

        $this->fileSystemUtils->ensureDirectory($file);
    }

    #[Test]
    public function getFileContentsReturnsFileContent(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'qti_test_');
        $this->tempFiles[] = $file;
        file_put_contents($file, 'Hello, World!');

        $contents = $this->fileSystemUtils->getFileContents($file);

        $this->assertSame('Hello, World!', $contents);
    }

    #[Test]
    public function getFileContentsReadsLargeFile(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'qti_test_');
        $this->tempFiles[] = $file;
        $largeContent = str_repeat('A', 10000);
        file_put_contents($file, $largeContent);

        $contents = $this->fileSystemUtils->getFileContents($file);

        $this->assertSame($largeContent, $contents);
    }

    #[Test]
    public function getFileContentsThrowsExceptionForNonExistentFile(): void
    {
        $file = sys_get_temp_dir() . '/qti_nonexistent_' . uniqid();

        $this->expectException(Exception::class);
        $this->expectExceptionMessage(sprintf('Could not read file: %s', $file));

        $this->fileSystemUtils->getFileContents($file);
    }

    #[Test]
    public function isValidFileReturnsTrueForNonEmptyFile(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'qti_test_');
        $this->tempFiles[] = $file;
        file_put_contents($file, 'content');

        $this->assertTrue($this->fileSystemUtils->isValidFile($file));
    }

    #[Test]
    public function isValidFileReturnsFalseForEmptyFile(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'qti_test_');
        $this->tempFiles[] = $file;
        // tempnam creates the file but it is empty (0 bytes)

        $this->assertFalse($this->fileSystemUtils->isValidFile($file));
    }

    #[Test]
    public function isValidFileReturnsFalseForNonExistentFile(): void
    {
        $file = sys_get_temp_dir() . '/qti_nonexistent_' . uniqid();

        $this->assertFalse($this->fileSystemUtils->isValidFile($file));
    }
}
