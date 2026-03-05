<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Filesystem\Zip;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\Zip\ZipArchiveFactory;
use ZipArchive;

class ZipArchiveFactoryTest extends TestCase
{
    #[Test]
    public function createReturnsZipArchiveInstance(): void
    {
        $factory = new ZipArchiveFactory();

        $result = $factory->create();

        $this->assertInstanceOf(ZipArchive::class, $result);
    }
}
