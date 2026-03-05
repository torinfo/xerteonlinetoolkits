<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\AssessmentItem\Model;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class AssessmentItemTest extends TestCase
{
    #[Test]
    public function aValidIdCanBeGiven(): void
    {
        $assessment = AssessmentItemStub::assessmentItem();
        $this->assertSame('10fe19b2-8b6e-53fa-8522-1220c67ddce1', (string) $assessment->identifier());
    }

    #[Test]
    public function anItemBodyCanBeGiven(): void
    {
        $assessment = AssessmentItemStub::assessmentItem();
        $this->assertSame('p', $assessment->itemBody()->children()[0]->tagName());
    }

    #[Test]
    public function aListWithRequiredAttributesIsSet(): void
    {
        $assessment = AssessmentItemStub::assessmentItem();
        $attributes = $assessment->attributes();
        $this->assertEquals([
            'title' => '',
            'identifier' => '10fe19b2-8b6e-53fa-8522-1220c67ddce1',
            'time-dependent' => 'false',
            'xml:lang' => 'nl-NL',
            'xmlns' => 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0',
            'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation' => 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0 https://purl.imsglobal.org/spec/qti/v3p0/schema/xsd/imsqti_asiv3p0_v1p0.xsd http://www.w3.org/1998/Math/MathML https://purl.imsglobal.org/spec/mathml/v3p0/schema/xsd/mathml3.xsd',
            'adaptive' => 'false',
        ], $attributes);
    }
}
