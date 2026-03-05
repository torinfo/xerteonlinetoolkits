<?php

declare(strict_types=1);

namespace Qti3\Package\Service;

use Qti3\AssessmentItem\Model\AssessmentItem;
use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\Package\Model\Manifest\ManifestResourceDependency;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\Warnings;
use Qti3\Package\Model\Resource\Webcontent;
use Qti3\Package\Model\Resource\WebcontentCollection;
use Qti3\Package\Downloader\Resource\IResourceDownloader;
use Qti3\Package\Validator\Resource\IResourceValidator;
use Qti3\Package\Service\QtiPackageBuilder\ItemResourceBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\ManifestBuilder;
use Qti3\Package\Service\QtiPackageBuilder\TestResourceBuilder;
use Qti3\Shared\Model\IQtiResourceProvider;
use Qti3\Shared\Model\IXmlElement;
use Qti3\Shared\Model\QtiResource;
use Qti3\Shared\Collection\StringCollection;
use Exception;

class QtiPackageBuilder
{
    public function __construct(
        private readonly ManifestBuilder $manifestBuilder,
        private readonly TestResourceBuilder $testResourceBuilder,
        private readonly ItemResourceBuilder $itemResourceBuilder,
        private readonly IResourceValidator $resourceValidator,
        private readonly IResourceDownloader $resourceDownloader,
    ) {}

    /**
     * @param array<int,AssessmentItem> $assessmentItems
     */
    public function buildForTest(
        AssessmentTest $assessmentTest,
        array $assessmentItems,
    ): QtiPackage {
        $assessmentTest->validateItems($assessmentItems);

        $resources = new ResourceCollection();

        $warnings = new StringCollection();
        $webcontent = new WebcontentCollection();

        $dependencies = $this->processWebcontent($webcontent, $assessmentTest, $warnings);
        $resources->add($this->testResourceBuilder->build($assessmentTest, $dependencies));

        foreach ($assessmentItems as $assessmentItem) {
            $itemRef = $assessmentTest->findItemRef($assessmentItem->identifier());
            $dependencies = $this->processWebcontent($webcontent, $assessmentItem, $warnings);

            $resources->add($this->itemResourceBuilder->build(
                (string) $itemRef->identifier,
                $assessmentItem,
                $dependencies,
            ));
        }
        foreach ($webcontent as $webcontentFile) {
            $resources->add($webcontentFile);
        }
        if ($warnings->count() > 0) {
            $resources->add(new Warnings($warnings));
        }

        return new QtiPackage(
            $resources,
            $this->manifestBuilder->buildForResources($resources),
        );
    }

    /**
     * @return array<int,QtiResource>
     */
    private function getQtiResources(IXmlElement $element, StringCollection $warnings): array
    {
        $resources = [];

        foreach ($element->children() as $child) {
            if ($child instanceof IQtiResourceProvider) {
                $this->processResourceProvider($child, $warnings);
                $resource = $child->getResource();
                if ($resource !== null) {
                    $resources[] = $resource;
                }
            }
            if ($child instanceof IXmlElement) {
                $resources = [...$resources, ...$this->getQtiResources($child, $warnings)];
            }
        }

        return $resources;
    }

    private function processWebcontent(
        WebcontentCollection $webcontent,
        IXmlElement $element,
        StringCollection $warnings,
    ): ManifestResourceDependencyCollection {
        $qtiResources = $this->getQtiResources($element, $warnings);

        $dependencies = new ManifestResourceDependencyCollection();
        foreach ($qtiResources as $qtiResource) {
            $webcontentFile = $webcontent->findByOriginalPath($qtiResource->originalPath);
            if (!$webcontentFile) {
                $webcontentFile = new Webcontent(
                    $qtiResource->originalPath,
                    sprintf('RESOURCE%03d', $webcontent->count() + 1),
                    $qtiResource->relativePath . $qtiResource->filename,
                    $this->resourceDownloader,
                    $qtiResource->isBinary,
                );
                $webcontent->add($webcontentFile);
            }
            $dependencies->add(new ManifestResourceDependency($webcontentFile->identifier));
        }
        return $dependencies;
    }

    private function processResourceProvider(IQtiResourceProvider $resourceProvider, StringCollection $warnings): void
    {
        $source = $resourceProvider->getSource();
        if (!$source || str_starts_with($source, 'data:')) {
            return;
        }
        $filename =
            md5($source) . '.' .
            pathinfo($source, PATHINFO_EXTENSION);

        $resource = new QtiResource(
            type: 'webcontent',
            originalPath: $source,
            relativePath: 'resources/',
            filename: $filename,
            isBinary: $resourceProvider->isBinary(),
        );
        try {
            $this->resourceValidator->validate($resource);
            $resourceProvider->setResource($resource);
        } catch (Exception $e) {
            $warnings->add($e->getMessage());
        }
    }
}
