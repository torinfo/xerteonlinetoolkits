<?php

declare(strict_types=1);

namespace Qti3\Package\Service\QtiPackageBuilder;

use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRef;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResourceDependency;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Shared\Xml\Reader\IXmlReader;

readonly class TestResourceBuilder
{
    public const ASSESSMENT_TEST_FILE_NAME = 'AssessmentTest.xml';

    public function __construct(
        private IXmlBuilder $xmlBuilder,
        private IXmlReader $xmlReader,
    ) {}

    public function build(
        AssessmentTest $assessmentTest,
        ManifestResourceDependencyCollection $resourceDependencies,
        string $identifier = 'TEST',
    ): Resource {
        /** @var string $xml */
        $xml = $this->xmlBuilder->generateXmlFromObject($assessmentTest)->saveXML();

        return new Resource(
            $identifier,
            ResourceType::ASSESSMENT_TEST,
            self::ASSESSMENT_TEST_FILE_NAME,
            new PackageFileCollection([
                new XmlFile(
                    self::ASSESSMENT_TEST_FILE_NAME,
                    new MemoryFileContent($xml),
                    $this->xmlReader,
                ),
            ]),
            new ManifestResourceDependencyCollection([
                ...array_map(
                    fn(AssessmentItemRef $itemRef): ManifestResourceDependency => new ManifestResourceDependency((string) $itemRef->identifier),
                    $assessmentTest->getItemRefs(),
                ),
                ...$resourceDependencies->all(),
            ]),
        );
    }
}
