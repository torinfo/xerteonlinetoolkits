<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Model;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\Metadata\Metadata;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Shared\Xml\Reader\XmlReader;
use DOMDocument;

class QtiPackageMock extends QtiPackage
{
    public function __construct(
        ?ResourceCollection $resources = null,
        ?Manifest $manifest = null,
        ?Metadata $metadata = null,
    ) {
        $xmlReader = new XmlReader();

        if (is_null($metadata)) {
            $metadata = Metadata::fromString(file_get_contents(__DIR__ . '/resources/metadata.xml'), $xmlReader);
        }

        $resources ??= new ResourceCollection([
            new Resource(
                'test-id',
                ResourceType::ASSESSMENT_TEST,
                'test.xml',
                new PackageFileCollection([
                    new XmlFile('test.xml', new MemoryFileContent('<qti-assessment-test></qti-assessment-test>'), $xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
                $metadata,
            ),
            new Resource(
                'test-item-id1',
                ResourceType::ASSESSMENT_ITEM,
                'test-item1.xml',
                new PackageFileCollection([
                    new XmlFile('test-item1.xml', new MemoryFileContent(file_get_contents(__DIR__ . '/resources/item.xml')), $xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
            new Resource(
                'test-item-id2',
                ResourceType::ASSESSMENT_ITEM,
                'test-item2.xml',
                new PackageFileCollection([
                    new XmlFile('test-item2.xml', new MemoryFileContent('<qti-assessment-item></qti-assessment-item>'), $xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
            new Resource(
                'test-item-id3',
                ResourceType::ASSESSMENT_ITEM,
                'test-item3.xml',
                new PackageFileCollection([
                    new XmlFile('test-item3.xml', new MemoryFileContent('<qti-assessment-item></qti-assessment-item>'), $xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
            new Resource(
                'test-item-id4',
                ResourceType::ASSESSMENT_ITEM,
                'test-item4.xml',
                new PackageFileCollection([
                    new XmlFile('test-item4.xml', new MemoryFileContent('<qti-assessment-item></qti-assessment-item>'), $xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
            new Resource(
                'test-item-id5',
                ResourceType::ASSESSMENT_ITEM,
                'test-item5.xml',
                new PackageFileCollection([
                    new XmlFile('test-item5.xml', new MemoryFileContent('<qti-assessment-item></qti-assessment-item>'), $xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
        ]);

        parent::__construct(
            $resources,
            $manifest ?? Manifest::fromString(
                '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd https://purl.imsglobal.org/spec/md/v1p3/schema/xsd/imsmd_loose_v1p3p2.xsd http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqtiv3p0_imscpv1p2_v1p0.xsd" identifier="MANIFEST_QTI"></manifest>',
                new XmlReader(),
            ),
        );
    }

    public function getMetadata($noMetadata = false): ?Metadata
    {
        $dom = new DOMDocument();
        $dom->loadXML($this->readMetadata());

        return new Metadata($dom);
    }

    public function readMetadata(): string
    {
        return <<<XML_WRAP
        <?xml version="1.0" encoding="UTF-8"?>
        <lom xmlns="http://ltsc.ieee.org/xsd/LOM"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://ltsc.ieee.org/xsd/LOM https://purl.imsglobal.org/spec/md/v1p3/schema/xsd/imsmd_loose_v1p3p2.xsd">
        
            <general>
                <identifier>
                    <catalog>Catalog</catalog>
                    <entry>Entry</entry>
                </identifier>
                <title>
                    <string language="nl">Biologie | Mens en Milieu | 01 | bovenbouw HAVO</string>
                </title>
                <language>nl</language>
                <description>
                    <string language="nl">Deze toets is ontwikkeld binnen de vakvereniging NVON. De toets kan gedownload worden
                        en aangepast en gebruikt worden binnen scholen voor voortgezet onderwijs.
                    </string>
                </description>
                <keyword>
                    <string language="nl">biologie</string>
                </keyword>
                <keyword>
                    <string language="nl">mens en milieu</string>
                </keyword>
                <aggregationLevel>
                    <source>http://purl.edustandaard.nl/vdex_aggregationlevel_czp_20060628.xml</source>
                    <value>2</value>
                </aggregationLevel>
            </general>
            <lifeCycle>
                <version>
                    <string language="x-none">20190122</string>
                </version>
                <contribute>
                    <role>
                        <source>http://download.edustandaard.nl/vdex/vdex_lifecycle_contribute_role_lomv1p0_20060628.xml</source>
                        <value>publisher</value>
                    </role>
                    <entity>BEGIN:VCARD VERSION:3.0 ORG:NVON N:NVON FN:NVON EMAIL:info@proefjes.nl END:VCARD</entity>
                    <date>
                        <dateTime>2024-04-09T16:10:45+02:00</dateTime>
                        <description>
                            <string language="nl">Publicatie datum</string>
                        </description>
                    </date>
                </contribute>
            </lifeCycle>
            <metaMetadata>
                <metadataSchema>LOMv1.0</metadataSchema>
                <metadataSchema>QTIv3.0</metadataSchema>
            </metaMetadata>
            <educational>
                <learningResourceType>
                    <source>http://purl.edustandaard.nl/vdex_learningresourcetype_czp_20060628.xml</source>
                    <value>evaluatie- en toetsmateriaal</value>
                </learningResourceType>
                <intendedEndUserRole>
                    <source>http://purl.edustandaard.nl/vdex_intendedenduserrole_lomv1p0_20060628.xml</source>
                    <value>teacher</value>
                </intendedEndUserRole>
            </educational>
            <rights>
                <cost>
                    <source>LOMv1.0</source>
                    <value>no</value>
                </cost>
                <copyrightAndOtherRestrictions>
                    <source>https://purl.edustandaard.nl/copyrightsandotherrestrictions_nllom_20180530</source>
                    <value>cc-by-sa-40</value>
                </copyrightAndOtherRestrictions>
            </rights>
            <classification>
                <purpose>
                    <source>LOMv1.0</source>
                    <value>discipline</value>
                </purpose>
                <taxonPath>
                    <source>
                        <string language="x-none">http://purl.edustandaard.nl/begrippenkader</string>
                    </source>
                    <taxon>
                        <id>2b363227-8633-4652-ad57-c61f1efc02c8</id>
                        <entry>
                            <string language="nl">Biologie</string>
                        </entry>
                    </taxon>
                </taxonPath>
            </classification>
            <classification>
                <purpose>
                    <source>LOMv1.0</source>
                    <value>educational level</value>
                </purpose>
                <taxonPath>
                    <source>
                        <string language="x-none">http://purl.edustandaard.nl/begrippenkader</string>
                    </source>
                    <taxon>
                        <id>2a1401e9-c223-493b-9b86-78f6993b1a8d</id>
                        <entry>
                            <string language="nl">Voortgezet onderwijs</string>
                        </entry>
                    </taxon>
                    <taxon>
                        <id>a3ddbe60-8478-4204-b769-6f5e9f4cbca2</id>
                        <entry>
                            <string language="nl">HAVO</string>
                        </entry>
                    </taxon>
                    <taxon>
                        <id>cb61531d-61eb-4412-a52f-ca065ca37e39</id>
                        <entry>
                            <string language="nl">HAVO 5</string>
                        </entry>
                    </taxon>
                </taxonPath>
            </classification>
            <classification>
                <purpose>
                    <source>http://purl.edustandaard.nl/classification_purpose_nllom_20180530</source>
                    <value>access rights</value>
                </purpose>
                <taxonPath>
                    <source>
                        <string language="x-none">http://purl.edustandaard.nl/classification_accessrights_nllom_20180530</string>
                    </source>
                    <taxon>
                        <id>OpenAccess</id>
                        <entry>
                            <string language="nl">open toegang</string>
                        </entry>
                    </taxon>
                </taxonPath>
            </classification>
        </lom>
        XML_WRAP;
    }
}
