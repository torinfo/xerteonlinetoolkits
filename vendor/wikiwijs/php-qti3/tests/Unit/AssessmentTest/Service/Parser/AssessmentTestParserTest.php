<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentTest\Service\Parser;

use PHPUnit\Framework\TestCase;
use Qti3\AssessmentItem\Service\Parser\OutcomeDeclarationParser;
use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\AssessmentTest\Model\Section\AssessmentSection;
use Qti3\AssessmentTest\Model\TestPart\NavigationMode;
use Qti3\AssessmentTest\Model\TestPart\SubmissionMode;
use Qti3\AssessmentTest\Model\TestPart\TestPart;
use Qti3\AssessmentTest\Service\Parser\AssessmentItemRefParser;
use Qti3\AssessmentTest\Service\Parser\AssessmentSectionParser;
use Qti3\AssessmentTest\Service\Parser\AssessmentTestParser;
use Qti3\AssessmentTest\Service\Parser\TestPartParser;
use DOMDocument;

class AssessmentTestParserTest extends TestCase
{
    private AssessmentTestParser $parser;

    protected function setUp(): void
    {
        $itemRefParser = new AssessmentItemRefParser();
        $sectionParser = new AssessmentSectionParser($itemRefParser);
        $testPartParser = new TestPartParser($sectionParser);
        $outcomeDeclarationParser = new OutcomeDeclarationParser();

        $this->parser = new AssessmentTestParser(
            $outcomeDeclarationParser,
            $testPartParser
        );
    }

    public function testParseAssessmentTest(): void
    {
        $xml = <<<XML
<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" 
                identifier="f36d8995-1234-5678-1234-567812345678" 
                title="Test Title">
    <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float">
        <qti-default-value>
            <qti-value>0</qti-value>
        </qti-default-value>
    </qti-outcome-declaration>
    <qti-test-part identifier="part1" navigation-mode="linear" submission-mode="individual">
        <qti-assessment-section identifier="section1" title="Section 1" visible="true">
            <qti-assessment-item-ref identifier="item1" href="item1.xml" />
            <qti-assessment-item-ref identifier="item2" href="item2.xml" category="easy" />
        </qti-assessment-section>
    </qti-test-part>
</qti-assessment-test>
XML;

        $dom = new DOMDocument();
        $dom->loadXML($xml);

        $assessmentTest = $this->parser->parse($dom->documentElement);

        $this->assertInstanceOf(AssessmentTest::class, $assessmentTest);
        $this->assertEquals('f36d8995-1234-5678-1234-567812345678', (string) $assessmentTest->identifier);
        $this->assertEquals('Test Title', $assessmentTest->title);

        // Outcome Declarations
        $this->assertCount(1, $assessmentTest->outcomeDeclarations);
        $this->assertEquals('SCORE', $assessmentTest->outcomeDeclarations->all()[0]->identifier);

        // Test Parts
        $this->assertCount(1, $assessmentTest->testParts);
        /** @var TestPart $testPart */
        $testPart = $assessmentTest->testParts->all()[0];
        $this->assertEquals('part1', $testPart->identifier);
        $this->assertEquals(NavigationMode::LINEAR, $testPart->navigationMode);
        $this->assertEquals(SubmissionMode::INDIVIDUAL, $testPart->submissionMode);

        // Sections
        $this->assertCount(1, $testPart->sections);
        /** @var AssessmentSection $section */
        $section = $testPart->sections->all()[0];
        $this->assertEquals('section1', $section->identifier);
        $this->assertEquals('Section 1', $section->title);
        $this->assertTrue($section->visible);

        // Item Refs
        $this->assertCount(2, $section->assessmentItemRefs);
        $itemRef1 = $section->assessmentItemRefs->all()[0];
        $this->assertEquals('item1', (string) $itemRef1->identifier);
        $this->assertEquals('item1.xml', $itemRef1->href);
        $this->assertNull($itemRef1->category);

        $itemRef2 = $section->assessmentItemRefs->all()[1];
        $this->assertEquals('item2', (string) $itemRef2->identifier);
        $this->assertEquals('item2.xml', $itemRef2->href);
        $this->assertEquals('easy', $itemRef2->category);
    }
}
