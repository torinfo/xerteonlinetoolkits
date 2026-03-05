<?php

declare(strict_types=1);

namespace Qti3\Package\Service\QtiPackageBuilder\Manifest;

use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestResource;
use Qti3\Package\Model\Manifest\ManifestResourceCollection;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Service\QtiPackageBuilder\IXmlBuilder;
use Qti3\Shared\Xml\Reader\IXmlReader;
use DOMDocument;
use DOMElement;

readonly class ManifestBuilder
{
    public function __construct(
        private IXmlBuilder $xmlBuilder,
        private MetadataBuilder $metadataBuilder,
        private OrganizationsBuilder $organizationsBuilder,
        private ResourcesBuilder $resourcesBuilder,
        private IXmlReader $xmlReader,
    ) {}

    public function buildForResources(ResourceCollection $resources): Manifest
    {
        $manifestResources = new ManifestResourceCollection();
        foreach ($resources as $file) {
            $manifestResources->add(ManifestResource::fromResource($file));
        }
        $xmlDocument = $this->xmlBuilder->createDomDocument();
        $this->generateXml($xmlDocument, $manifestResources);

        /** @var string $xml */
        $xml = $xmlDocument->saveXML();

        return Manifest::fromString($xml, $this->xmlReader);
    }

    private function generateXml(DOMDocument $xmlDocument, ManifestResourceCollection $resources): void
    {
        $rootNode = $this->addRootNode($xmlDocument);
        $this->metadataBuilder->addMetadataNode($xmlDocument, $rootNode);
        $this->organizationsBuilder->addOrganizationsNode($xmlDocument, $rootNode);
        $this->resourcesBuilder->addResourcesNode($xmlDocument, $rootNode, $resources);
    }

    private function addRootNode(DOMDocument $xmlDocument): DomElement
    {
        $rootNode = $xmlDocument->createElement('manifest');
        $rootNode->setAttribute('xmlns', 'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1');
        $rootNode->setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
        $rootNode->setAttribute(
            'xsi:schemaLocation',
            'https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd https://purl.imsglobal.org/spec/md/v1p3/schema/xsd/imsmd_loose_v1p3p2.xsd http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqtiv3p0_imscpv1p2_v1p0.xsd',
        );
        $rootNode->setAttribute('identifier', 'MANIFEST_QTI');
        $xmlDocument->appendChild($rootNode);

        return $rootNode;
    }
}
