<?php

declare(strict_types=1);

namespace Qti3\Package\Service\QtiPackageBuilder;

use Qti3\AssessmentItem\Model\AssessmentItem;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Shared\Xml\Reader\IXmlReader;

readonly class ItemResourceBuilder
{
    public function __construct(
        private IXmlBuilder $xmlBuilder,
        private IXmlReader $xmlReader,
    ) {}

    public function build(
        string $itemRefIdentifier,
        AssessmentItem $assessmentItem,
        ManifestResourceDependencyCollection $resourceDependencies,
    ): Resource {
        /** @var string $xml */
        $xml = $this->xmlBuilder->generateXmlFromObject($assessmentItem)->saveXML();

        return new Resource(
            $itemRefIdentifier,
            ResourceType::ASSESSMENT_ITEM,
            $itemRefIdentifier . '.xml',
            new PackageFileCollection(
                [new XmlFile(
                    $itemRefIdentifier . '.xml',
                    new MemoryFileContent($xml),
                    $this->xmlReader,
                )],
            ),
            $resourceDependencies,
        );
    }
}
