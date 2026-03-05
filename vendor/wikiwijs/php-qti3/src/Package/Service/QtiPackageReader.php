<?php

declare(strict_types=1);

namespace Qti3\Package\Service;

use Qti3\Package\IQtiPackageFactory;
use Qti3\Package\Model\IPackageReader;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestFactory;
use Qti3\Package\Model\Manifest\ManifestResource;
use Qti3\Package\Model\Metadata\Metadata;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Shared\Xml\Reader\IXmlReader;

readonly class QtiPackageReader implements IQtiPackageFactory
{
    public function __construct(
        private ManifestFactory $manifestFactory,
        private IXmlReader $xmlReader,
        private IZipPackageFactory $zipPackageFactory,
        private IFilesystemPackageFactory $filesystemPackageFactory,
    ) {}

    public function fromFilesystem(string $folder, bool $lazyLoading = true): QtiPackage
    {
        $reader = $this->filesystemPackageFactory->getReader($folder, $lazyLoading);

        return $this->fromReader($reader);
    }

    public function fromZip(string $filePath): QtiPackage
    {
        $reader = $this->zipPackageFactory->getReader($filePath);

        return $this->fromReader($reader);
    }

    private function fromReader(IPackageReader $reader): QtiPackage
    {
        $resources = new ResourceCollection();

        $manifest = $this->manifestFactory->createFromXmlString($reader->getFileContent('imsmanifest.xml')->getContent());

        foreach ($manifest->getResources() as $manifestResource) {
            $files = new PackageFileCollection();
            foreach ($manifestResource->files as $manifestFile) {
                $extension = pathinfo($manifestFile->href, PATHINFO_EXTENSION);
                $fileContent = $reader->getFileContent($manifestFile->href);

                if ($extension === 'xml') {
                    $packageFile = new XmlFile($manifestFile->href, $fileContent, $this->xmlReader);
                } else {
                    $packageFile = new PackageFile($manifestFile->href, $fileContent);
                }
                $files->add($packageFile);
            }
            $resources[] = new Resource(
                $manifestResource->identifier,
                $manifestResource->type,
                $manifestResource->href,
                $files,
                $manifestResource->dependencies,
                $this->determineMetadata($manifestResource, $manifest, $reader, $this->xmlReader),
            );

        }

        return new QtiPackage(
            $resources,
            $manifest,
        );
    }

    private function determineMetadata(ManifestResource $resource, Manifest $manifest, IPackageReader $reader, IXmlReader $xmlReader): ?Metadata
    {
        foreach ($resource->dependencies as $dependency) {
            $metadataResources = $manifest->getResources()->filter(
                fn(ManifestResource $manifestResource): bool =>
                    $manifestResource->identifier === $dependency->identifierref &&
                    $manifestResource->type === ResourceType::RESOURCE_METADATA,
            );

            if ($metadataResources->count() === 0) {
                continue; // @codeCoverageIgnore
            }

            /** @var ManifestResource $metadataResource */
            $metadataResource = $metadataResources->first();

            // Metadata resource always contains a href
            /** @var string $href */
            $href = $metadataResource->href;

            $xmlDocument = $xmlReader->read($reader->getFileContent($href)->getContent());

            return new Metadata($xmlDocument);
        }

        return null;
    }
}
