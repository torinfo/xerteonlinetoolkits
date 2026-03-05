<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Service\Parser;

use Qti3\AssessmentItem\Service\Parser\AbstractParser;
use Qti3\AssessmentItem\Service\Parser\OutcomeDeclarationParser;
use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\AssessmentTest\Model\AssessmentTestId;
use Qti3\AssessmentTest\Model\TestPart\TestPart;
use Qti3\AssessmentTest\Model\TestPart\TestPartCollection;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclaration;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;
use DOMElement;

class AssessmentTestParser extends AbstractParser
{
    public function __construct(
        private readonly OutcomeDeclarationParser $outcomeDeclarationParser,
        private readonly TestPartParser $testPartParser
    ) {}

    public function parse(DOMElement $element): AssessmentTest
    {
        $this->validateTag($element, AssessmentTest::qtiTagName());

        $identifierValue = $element->getAttribute('identifier');

        $identifier = AssessmentTestId::fromString($identifierValue ?: 'test-' . uniqid());

        $title = $element->getAttribute('title') ?: null;

        $outcomeDeclarations = new OutcomeDeclarationCollection();
        $testParts = new TestPartCollection();

        foreach ($this->getChildren($element) as $child) {
            if ($child->nodeName === OutcomeDeclaration::qtiTagName()) {
                $outcomeDeclarations->add($this->outcomeDeclarationParser->parse($child));
            } elseif ($child->nodeName === TestPart::qtiTagName()) {
                $testParts->add($this->testPartParser->parse($child));
            }
            // TODO: OutcomeProcessing, TestFeedback, RubricBlock
        }

        return new AssessmentTest(
            $identifier,
            $outcomeDeclarations,
            $testParts,
            $title
        );
    }
}
