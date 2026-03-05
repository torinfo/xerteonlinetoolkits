<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model\Resource;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Resource\Warnings;
use Qti3\Shared\Collection\StringCollection;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class WarningsTest extends TestCase
{
    #[Test]
    public function testWarnings(): void
    {
        $warnings = new Warnings(new StringCollection(['content']));

        $this->assertEquals('warnings.txt', $warnings->href);
        $this->assertFalse($warnings->files->first()->isBinary());
        $this->assertInstanceOf(MemoryFileContent::class, $warnings->files->first()->getContent());
    }
}
