<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Service;

use PHPUnit\Framework\TestCase;
use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\Package\Model\FileContent\IFileContent;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\AssessmentTest\Service\TestBuilder;
use Qti3\Shared\Xml\Reader\XmlReader;
use Qti3\AssessmentTest\Service\Parser\AssessmentTestParser;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\PackageFile\PackageFileCollection;

class QtiPackageReaderIntegrationTest extends TestCase
{
    public function testGetAssessmentTestFromPackage(): void
    {
        $xmlReader = new XmlReader();

        $assessmentTestParser = $this->createMock(AssessmentTestParser::class);
        $assessmentTest = $this->createMock(AssessmentTest::class);
        
        $builder = new TestBuilder(
            $assessmentTestParser,
        );

        $testXml = '<qti-assessment-test identifier="test" title="Test Title" xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" />';
        $fileContent = $this->createMock(IFileContent::class);
        $fileContent->method('getContent')->willReturn($testXml);
        
        $xmlFile = new XmlFile('test.xml', $fileContent, $xmlReader);
        $files = new PackageFileCollection([$xmlFile]);
        
        $resource = new Resource(
            'test-id',
            ResourceType::ASSESSMENT_TEST,
            'test.xml',
            $files,
            new ManifestResourceDependencyCollection()
        );
        
        $package = new QtiPackage(
            new ResourceCollection([$resource]),
            $this->createMock(Manifest::class)
        );

        $assessmentTestParser->expects($this->once())
            ->method('parse')
            ->with($this->isInstanceOf(\DOMElement::class))
            ->willReturn($assessmentTest);

        $result = $builder->buildFromPackage($package, 'test-id');
        
        $this->assertSame($assessmentTest, $result);
    }
}
