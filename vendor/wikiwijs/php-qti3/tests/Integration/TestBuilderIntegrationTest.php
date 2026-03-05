<?php

namespace Qti3\Tests\Integration;

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;
use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\AssessmentTest\Model\Section\AssessmentSection;
use Qti3\AssessmentTest\Model\TestPart\TestPart;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Shared\Xml\Reader\XmlReader;

#[Group('integration')]
class TestBuilderIntegrationTest extends TestCase
{
    use QtiClientTestCaseTrait;

    protected function setUp(): void
    {
        $this->setUpQtiClientTestCase();
    }

    protected function tearDown(): void
    {
        $this->tearDownQtiClientTestCase();
    }

    public function testBuildFromPackageParsesAssessmentTestXmlIntoModel(): void
    {
        $assessmentTestXml = <<<XML
<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"
                     identifier="integration-test-001"
                     title="Integration Test">
  <qti-test-part identifier="part1" navigation-mode="linear" submission-mode="individual">
    <qti-assessment-section identifier="section1" title="Section 1" visible="true">
      <qti-assessment-item-ref identifier="itemA" href="itemA.xml" />
      <qti-assessment-item-ref identifier="itemB" href="itemB.xml" category="hard" />
    </qti-assessment-section>
  </qti-test-part>
</qti-assessment-test>
XML;

        $client = $this->createClient();
        $xmlReader = new XmlReader();
        $xmlFile = new XmlFile(
            'AssessmentTest.xml',
            new MemoryFileContent($assessmentTestXml),
            $xmlReader,
        );

        $assessmentTestResource = new Resource(
            'TEST',
            ResourceType::ASSESSMENT_TEST,
            'AssessmentTest.xml',
            new PackageFileCollection([$xmlFile]),
            new ManifestResourceDependencyCollection(),
        );

        $manifestXml = '<?xml version="1.0" encoding="UTF-8"?>'
            . '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST_IT">'
            . '  <resources/>'
            . '</manifest>';
        $manifest = Manifest::fromString($manifestXml, $xmlReader);

        $package = new QtiPackage(
            new ResourceCollection([$assessmentTestResource]),
            $manifest,
        );

        $testBuilder = $client->getTestBuilder();
        $assessmentTest = $testBuilder->buildFromPackage($package);

        $this->assertInstanceOf(AssessmentTest::class, $assessmentTest);
        $this->assertSame('integration-test-001', (string) $assessmentTest->identifier);
        $this->assertSame('Integration Test', $assessmentTest->title);

        // TestPart
        $this->assertCount(1, $assessmentTest->testParts);
        /** @var TestPart $testPart */
        $testPart = $assessmentTest->testParts->all()[0];
        $this->assertSame('part1', $testPart->identifier);

        // Section
        $this->assertCount(1, $testPart->sections);
        /** @var AssessmentSection $section */
        $section = $testPart->sections->all()[0];
        $this->assertSame('section1', $section->identifier);
        $this->assertSame('Section 1', $section->title);
        $this->assertTrue($section->visible);

        // Item refs
        $this->assertCount(2, $section->assessmentItemRefs);
        $itemRef1 = $section->assessmentItemRefs->all()[0];
        $this->assertSame('itemA', (string) $itemRef1->identifier);
        $this->assertSame('itemA.xml', $itemRef1->href);
        $this->assertNull($itemRef1->category);

        $itemRef2 = $section->assessmentItemRefs->all()[1];
        $this->assertSame('itemB', (string) $itemRef2->identifier);
        $this->assertSame('itemB.xml', $itemRef2->href);
        $this->assertSame('hard', $itemRef2->category);
    }
}
