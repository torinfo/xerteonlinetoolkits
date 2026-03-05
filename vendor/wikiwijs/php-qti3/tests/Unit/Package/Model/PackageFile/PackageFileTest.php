<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\PackageFile;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\PackageFile\PackageFile;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class PackageFileTest extends TestCase
{
    private PackageFile $packageFile;
    private MemoryFileContent $testContent;

    protected function setUp(): void
    {
        $this->testContent = new MemoryFileContent('content');
        $this->packageFile = new PackageFile('test.tst', $this->testContent);
    }

    #[Test]
    public function aValidFilenameCanBeGiven(): void
    {
        $this->assertEquals('test.tst', $this->packageFile->getFilepath());
    }

    #[Test]
    public function theContentCanBeRetrieved(): void
    {
        $this->assertEquals($this->testContent, $this->packageFile->getContent());
    }
}
