<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Validator;

use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestFactory;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Validator\QtiSchemaValidator;
use Qti3\Shared\Xml\Reader\XmlReader;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use ZipArchive;

class QtiSchemaValidatorTest extends TestCase
{
    private QtiSchemaValidator $validator;
    private XmlReader $xmlReader;
    private ManifestFactory $manifestFactory;

    protected function setUp(): void
    {
        $this->xmlReader = new XmlReader();
        $this->manifestFactory = new ManifestFactory($this->xmlReader);
        $this->validator = new QtiSchemaValidator($this->manifestFactory, $this->xmlReader);
    }

    #[Test]
    public function validateValidPackageReturnsNoErrors(): void
    {
        $qtiPackage = $this->createValidPackage();

        $errors = $this->validator->validate($qtiPackage);

        $this->assertCount(0, $errors);
    }

    #[Test]
    public function validatePackageWithMissingManifestIdentifierReturnsError(): void
    {
        $manifest = Manifest::fromString(
            '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"></manifest>',
            $this->xmlReader,
        );

        $qtiPackage = new QtiPackage(new ResourceCollection(), $manifest);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Manifest is missing required attribute: identifier'));
    }

    #[Test]
    public function validatePackageWithNoResourcesReturnsError(): void
    {
        $manifest = Manifest::fromString(
            '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="TEST"></manifest>',
            $this->xmlReader,
        );

        $qtiPackage = new QtiPackage(new ResourceCollection(), $manifest);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Manifest contains no resources'));
    }

    #[Test]
    public function validateAssessmentItemWithMissingAttributesReturnsErrors(): void
    {
        $itemXml = '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"></qti-assessment-item>';

        $qtiPackage = $this->createPackageWithItem('item.xml', $itemXml);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Missing required attribute: identifier'));
        $this->assertTrue($this->errorsContain($errors, 'Missing required attribute: title'));
        $this->assertTrue($this->errorsContain($errors, 'Missing required attribute: time-dependent'));
    }

    #[Test]
    public function validateAssessmentItemWithWrongRootElementReturnsError(): void
    {
        $itemXml = '<wrong-element xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="id" title="test" time-dependent="false"></wrong-element>';

        $qtiPackage = $this->createPackageWithItem('item.xml', $itemXml);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Root element must be qti-assessment-item'));
    }

    #[Test]
    public function validateAssessmentItemWithWrongNamespaceReturnsError(): void
    {
        $itemXml = '<qti-assessment-item xmlns="http://wrong.namespace" identifier="id" title="test" time-dependent="false"></qti-assessment-item>';

        $qtiPackage = $this->createPackageWithItem('item.xml', $itemXml);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Invalid namespace'));
    }

    #[Test]
    public function validateAssessmentTestWithMissingAttributesReturnsErrors(): void
    {
        $testXml = '<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"></qti-assessment-test>';

        $manifest = Manifest::fromString(
            '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_QTI">'
            . '<resource identifier="test1" type="imsqti_test_xmlv3p0" href="test.xml">'
            . '<file href="test.xml"/>'
            . '</resource>'
            . '</manifest>',
            $this->xmlReader,
        );

        $resources = new ResourceCollection([
            new Resource(
                'test1',
                ResourceType::ASSESSMENT_TEST,
                'test.xml',
                new PackageFileCollection([
                    new XmlFile('test.xml', new MemoryFileContent($testXml), $this->xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
        ]);

        $qtiPackage = new QtiPackage($resources, $manifest);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Missing required attribute: identifier'));
        $this->assertTrue($this->errorsContain($errors, 'Missing required attribute: title'));
    }

    #[Test]
    public function validateZipPackageWithNonExistentFileReturnsError(): void
    {
        $errors = $this->validator->validateZipPackage('/non/existent/file.zip');

        $this->assertCount(1, $errors);
        $this->assertTrue($this->errorsContain($errors, 'Package file does not exist'));
    }

    #[Test]
    public function validateZipPackageWithInvalidZipReturnsError(): void
    {
        $tempFile = tempnam(sys_get_temp_dir(), 'qti_test_');
        file_put_contents($tempFile, 'not a zip file');

        try {
            $errors = $this->validator->validateZipPackage($tempFile);

            $this->assertCount(1, $errors);
            $this->assertTrue($this->errorsContain($errors, 'Invalid ZIP file'));
        } finally {
            unlink($tempFile);
        }
    }

    #[Test]
    public function validateZipPackageWithMissingManifestReturnsError(): void
    {
        $zipPath = $this->createTempZip([
            'some-file.xml' => '<root/>',
        ]);

        try {
            $errors = $this->validator->validateZipPackage($zipPath);

            $this->assertCount(1, $errors);
            $this->assertTrue($this->errorsContain($errors, 'Missing imsmanifest.xml'));
        } finally {
            unlink($zipPath);
        }
    }

    #[Test]
    public function validateZipPackageWithMissingReferencedFileReturnsError(): void
    {
        $manifestXml = '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_QTI">'
            . '<resource identifier="item1" type="imsqti_item_xmlv3p0" href="item.xml">'
            . '<file href="item.xml"/>'
            . '<file href="missing-file.css"/>'
            . '</resource>'
            . '</manifest>';

        $itemXml = '<?xml version="1.0" encoding="UTF-8"?>'
            . '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" '
            . 'identifier="item1" title="Test Item" time-dependent="false">'
            . '</qti-assessment-item>';

        $zipPath = $this->createTempZip([
            'imsmanifest.xml' => $manifestXml,
            'item.xml' => $itemXml,
        ]);

        try {
            $errors = $this->validator->validateZipPackage($zipPath);

            $this->assertTrue($this->errorsContain($errors, 'File referenced in manifest not found in package: missing-file.css'));
        } finally {
            unlink($zipPath);
        }
    }

    #[Test]
    public function validateValidZipPackageReturnsNoErrors(): void
    {
        $manifestXml = '<?xml version="1.0" encoding="UTF-8"?>'
            . '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_QTI">'
            . '<metadata><schema>QTI Package</schema><schemaversion>3.0.0</schemaversion></metadata>'
            . '<organizations/>'
            . '<resources>'
            . '<resource identifier="item1" type="imsqti_item_xmlv3p0" href="item.xml">'
            . '<file href="item.xml"/>'
            . '</resource>'
            . '</resources>'
            . '</manifest>';

        /** @var string $itemXml */
        $itemXml = file_get_contents(__DIR__ . '/resources/item001.xml');

        $zipPath = $this->createTempZip([
            'imsmanifest.xml' => $manifestXml,
            'item.xml' => $itemXml,
        ]);

        try {
            $errors = $this->validator->validateZipPackage($zipPath);

            $this->assertCount(0, $errors);
        } finally {
            unlink($zipPath);
        }
    }

    #[Test]
    public function validatePackageWithInvalidManifestNamespaceReturnsError(): void
    {
        $manifest = Manifest::fromString(
            '<manifest xmlns="http://wrong.namespace.example" identifier="TEST">'
            . '<resources><resource identifier="r1" type="imsqti_item_xmlv3p0" href="item.xml">'
            . '<file href="item.xml"/>'
            . '</resource></resources>'
            . '</manifest>',
            $this->xmlReader,
        );

        $qtiPackage = new QtiPackage(new ResourceCollection(), $manifest);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Manifest has invalid namespace'));
        $this->assertTrue($this->errorsContain($errors, 'expected: http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1'));
    }

    #[Test]
    public function validatePackageWithResourceMissingIdentifierReturnsError(): void
    {
        $manifest = Manifest::fromString(
            '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_QTI">'
            . '<resource identifier="item1" type="imsqti_item_xmlv3p0" href="item.xml">'
            . '<file href="item.xml"/>'
            . '</resource>'
            . '</manifest>',
            $this->xmlReader,
        );

        $itemXml = '<?xml version="1.0"?>'
            . '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" '
            . 'identifier="item1" title="Item" time-dependent="false"/>';

        $resources = new ResourceCollection([
            new Resource(
                '', // empty identifier
                ResourceType::ASSESSMENT_ITEM,
                'item.xml',
                new PackageFileCollection([
                    new XmlFile('item.xml', new MemoryFileContent($itemXml), $this->xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
        ]);

        $qtiPackage = new QtiPackage($resources, $manifest);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Resource is missing identifier'));
    }

    #[Test]
    public function validateAssessmentItemWithInvalidXmlReturnsError(): void
    {
        $malformedXml = '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" ';
        // unclosed tag / invalid XML

        $qtiPackage = $this->createPackageWithItem('item.xml', $malformedXml);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'Invalid XML -'));
    }

    #[Test]
    public function validateAssessmentItemWithEmptyOrInvalidXmlDocumentReturnsError(): void
    {
        // XML with no root element: parser may report "Invalid XML" or (if ever supported) "Empty XML document"
        $contentWithNoRoot = '<?xml version="1.0"?>';
        $qtiPackage = $this->createPackageWithItem('item.xml', $contentWithNoRoot);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertGreaterThanOrEqual(1, $errors->count());
        $this->assertTrue(
            $this->errorsContain($errors, 'Empty XML document') || $this->errorsContain($errors, 'Invalid XML -'),
            'Expected "Empty XML document" or "Invalid XML -" in: ' . implode('; ', iterator_to_array($errors)),
        );
    }

    #[Test]
    public function validateZipPackageWithResourceHrefMissingInZipReturnsError(): void
    {
        $manifestXml = '<?xml version="1.0" encoding="UTF-8"?>'
            . '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_QTI">'
            . '<resources>'
            . '<resource identifier="item1" type="imsqti_item_xmlv3p0" href="missing-item.xml">'
            . '<file href="missing-item.xml"/>'
            . '</resource>'
            . '</resources>'
            . '</manifest>';
        // Do not add missing-item.xml to the ZIP
        $zipPath = $this->createTempZip([
            'imsmanifest.xml' => $manifestXml,
        ]);

        try {
            $errors = $this->validator->validateZipPackage($zipPath);

            $this->assertTrue($this->errorsContain($errors, 'Resource href not found in package: missing-item.xml'));
        } finally {
            unlink($zipPath);
        }
    }

    #[Test]
    public function validateZipPackageWithMalformedManifestXmlReturnsError(): void
    {
        $zipPath = $this->createTempZip([
            'imsmanifest.xml' => 'this is not valid XML <<<',
        ]);

        try {
            $errors = $this->validator->validateZipPackage($zipPath);

            $this->assertTrue($this->errorsContain($errors, 'Manifest XML is invalid:'));
        } finally {
            unlink($zipPath);
        }
    }

    #[Test]
    public function validateAssessmentItemWithXsdViolationReturnsError(): void
    {
        $validRootButInvalidChild = '<?xml version="1.0" encoding="UTF-8"?>'
            . '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" '
            . 'identifier="item1" title="Item" time-dependent="false">'
            . '<invalid-element-not-in-xsd/>'
            . '</qti-assessment-item>';

        $qtiPackage = $this->createPackageWithItem('item.xml', $validRootButInvalidChild);

        $errors = $this->validator->validate($qtiPackage);

        $this->assertTrue($this->errorsContain($errors, 'XSD validation error'));
    }

    #[Test]
    public function validatePackageWithNonQtiResourceTypeXmlReturnsNoQtiErrors(): void
    {
        $manifest = Manifest::fromString(
            '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_QTI">'
            . '<resource identifier="wc1" type="webcontent" href="content.xml">'
            . '<file href="content.xml"/>'
            . '</resource>'
            . '</manifest>',
            $this->xmlReader,
        );

        $randomXml = '<?xml version="1.0"?><root><arbitrary/></root>';

        $resources = new ResourceCollection([
            new Resource(
                'wc1',
                ResourceType::WEBCONTENT,
                'content.xml',
                new PackageFileCollection([
                    new XmlFile('content.xml', new MemoryFileContent($randomXml), $this->xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
        ]);

        $qtiPackage = new QtiPackage($resources, $manifest);

        $errors = $this->validator->validate($qtiPackage);

        // Default branch: no QTI root/XSD checks for non-item/test types; no structural errors
        $this->assertFalse($this->errorsContain($errors, 'Root element must be'));
        $this->assertFalse($this->errorsContain($errors, 'Invalid namespace'));
        $this->assertCount(0, $errors);
    }

    private function createValidPackage(): QtiPackage
    {
        $validItemXml = file_get_contents(__DIR__ . '/resources/item001.xml');

        $manifest = Manifest::fromString(
            '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_QTI">'
            . '<resource identifier="item1" type="imsqti_item_xmlv3p0" href="item001.xml">'
            . '<file href="item001.xml"/>'
            . '</resource>'
            . '</manifest>',
            $this->xmlReader,
        );

        $resources = new ResourceCollection([
            new Resource(
                'item1',
                ResourceType::ASSESSMENT_ITEM,
                'item001.xml',
                new PackageFileCollection([
                    new XmlFile('item001.xml', new MemoryFileContent($validItemXml), $this->xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
        ]);

        return new QtiPackage($resources, $manifest);
    }

    private function createPackageWithItem(string $filename, string $itemXml): QtiPackage
    {
        $manifest = Manifest::fromString(
            '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_QTI">'
            . '<resource identifier="item1" type="imsqti_item_xmlv3p0" href="' . $filename . '">'
            . '<file href="' . $filename . '"/>'
            . '</resource>'
            . '</manifest>',
            $this->xmlReader,
        );

        $resources = new ResourceCollection([
            new Resource(
                'item1',
                ResourceType::ASSESSMENT_ITEM,
                $filename,
                new PackageFileCollection([
                    new XmlFile($filename, new MemoryFileContent($itemXml), $this->xmlReader),
                ]),
                new ManifestResourceDependencyCollection(),
            ),
        ]);

        return new QtiPackage($resources, $manifest);
    }

    /**
     * @param array<string, string> $files
     */
    private function createTempZip(array $files): string
    {
        $zipPath = tempnam(sys_get_temp_dir(), 'qti_test_') . '.zip';
        $zip = new ZipArchive();
        $zip->open($zipPath, ZipArchive::CREATE);

        foreach ($files as $name => $content) {
            $zip->addFromString($name, $content);
        }

        $zip->close();

        return $zipPath;
    }

    private function errorsContain(\Qti3\Shared\Collection\StringCollection $errors, string $needle): bool
    {
        foreach ($errors as $error) {
            if (str_contains($error, $needle)) {
                return true;
            }
        }
        return false;
    }
}
