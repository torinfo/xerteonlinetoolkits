<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Service;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Downloader\Resource\IResourceDownloader;
use Qti3\Package\Service\QtiPackageBuilder;
use Qti3\Package\Validator\Resource\IResourceValidator;
use Qti3\Package\Service\QtiPackageBuilder\ItemResourceBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\ManifestBuilder;
use Qti3\Package\Service\QtiPackageBuilder\TestResourceBuilder;
use Qti3\Tests\Unit\AssessmentItem\Model\AssessmentItemStub;
use Qti3\Tests\Unit\AssessmentTest\Model\AssessmentTestStub;
use Qti3\Tests\Unit\Package\Model\Manifest\ManifestMock;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class QtiPackageBuilderTest extends TestCase
{
    private QtiPackageBuilder $qtiPackageBuilder;
    private ManifestBuilder $manifestBuilder;
    private TestResourceBuilder $assessmentTestBuilder;
    private ItemResourceBuilder $assessmentItemBuilder;
    private IResourceValidator $resourceValidator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->manifestBuilder = $this->createMock(ManifestBuilder::class);
        $this->assessmentTestBuilder = $this->createMock(TestResourceBuilder::class);
        $this->assessmentItemBuilder = $this->createMock(ItemResourceBuilder::class);
        $this->resourceValidator = $this->createMock(IResourceValidator::class);

        $this->qtiPackageBuilder = new QtiPackageBuilder(
            $this->manifestBuilder,
            $this->assessmentTestBuilder,
            $this->assessmentItemBuilder,
            $this->resourceValidator,
            $this->createMock(IResourceDownloader::class),
        );
    }

    #[Test]
    public function aQtiPackageCanBeCreatedFromAnAssessmentTest(): void
    {
        $assessmentTest = AssessmentTestStub::assessmentTestWithTwoItems();

        $manifest = ManifestMock::create();

        $manifestBuilder = $this->createMock(ManifestBuilder::class);
        $manifestBuilder->method('buildForResources')->willReturn($manifest);

        $assessmentTestBuilder = $this->createMock(TestResourceBuilder::class);
        $assessmentTestBuilder->method('build')->willReturn(
            new Resource('id', ResourceType::ASSESSMENT_TEST, 'test.xml', new PackageFileCollection([
                new PackageFile('test.xml', new MemoryFileContent('content')),
            ]), new ManifestResourceDependencyCollection()),
        );

        $qtiPackage = $this->qtiPackageBuilder->buildForTest($assessmentTest, [AssessmentItemStub::assessmentItemWithImage(), AssessmentItemStub::assessmentItemWithImage()]);

        $this->assertInstanceOf(QtiPackage::class, $qtiPackage);
    }
}
