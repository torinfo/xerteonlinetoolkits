<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Service;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Service\QtiPackageBuilder\TestResourceBuilder;
use Qti3\Package\Service\QtiPackageEnhancer;
use Qti3\Package\Service\QtiPackageBuilder\XmlBuilder;
use Qti3\Shared\Xml\Reader\XmlReader;
use Qti3\Tests\Unit\Package\Model\QtiPackageMock;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class QtiPackageEnhancerTest extends TestCase
{
    #[Test]
    public function enhancePackageAddsTestResourceWhenMissing(): void
    {
        $package = new QtiPackageMock();

        $assessmentTestBuilder = new TestResourceBuilder(new XmlBuilder(), new XmlReader());
        $enhancer = new QtiPackageEnhancer($assessmentTestBuilder);

        // Act
        $enhancer->enhancePackage($package);

        // Assert
        self::assertCount(6, $package->resources);
        self::assertEquals(ResourceType::ASSESSMENT_TEST, $package->resources->first()->type);
    }

    #[Test]
    public function enhancePackageDoesNothingIfTestResourceExists(): void
    {
        // Arrange
        $package = new QtiPackageMock(
            resources: new ResourceCollection([
                new Resource('id', ResourceType::ASSESSMENT_TEST, 'test.xml', new PackageFileCollection([
                    new PackageFile('test.xml', new MemoryFileContent('content')),
                ]), new ManifestResourceDependencyCollection(), ),
            ]),
        );

        $assessmentTestBuilder = $this->createMock(TestResourceBuilder::class);
        $enhancer = new QtiPackageEnhancer($assessmentTestBuilder);

        // Act
        $enhancer->enhancePackage($package);

        // Assert
        self::assertCount(1, $package->resources);
        self::assertEquals(ResourceType::ASSESSMENT_TEST, $package->resources->first()->type);
    }

    #[Test]
    public function generateTestCreatesCorrectAssessmentTest(): void
    {
        // Arrange
        $manifest = $this->createMock(Manifest::class); // Create a mock of the expected manifest

        $package = new QtiPackageMock(
            resources: new ResourceCollection(),
            manifest: $manifest,
        );

        $assessmentTestBuilder = new TestResourceBuilder(new XmlBuilder(), new XmlReader());
        $enhancer = new QtiPackageEnhancer($assessmentTestBuilder);

        // Act
        $enhancer->enhancePackage($package);

        $assessmentTest = $package->resources->filterByType(ResourceType::ASSESSMENT_TEST)->first();
        $xmlContent = (string) $assessmentTest->files->first()->getContent();

        // Assert
        self::assertStringContainsString('qti-assessment-section', $xmlContent);
    }

}
