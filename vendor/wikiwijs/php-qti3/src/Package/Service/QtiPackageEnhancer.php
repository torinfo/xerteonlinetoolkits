<?php

declare(strict_types=1);

namespace Qti3\Package\Service;

use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\AssessmentTest\Model\AssessmentTestId;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRef;
use Qti3\AssessmentTest\Model\ItemRef\AssessmentItemRefCollection;
use Qti3\AssessmentTest\Model\Section\AssessmentSection;
use Qti3\AssessmentTest\Model\Section\AssessmentSectionCollection;
use Qti3\AssessmentTest\Model\TestPart\NavigationMode;
use Qti3\AssessmentTest\Model\TestPart\SubmissionMode;
use Qti3\AssessmentTest\Model\TestPart\TestPart;
use Qti3\AssessmentTest\Model\TestPart\TestPartCollection;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Service\QtiPackageBuilder\TestResourceBuilder;
use Qti3\Shared\Model\OutcomeDeclaration\OutcomeDeclarationCollection;

class QtiPackageEnhancer
{
    public function __construct(
        private readonly TestResourceBuilder $testResourceBuilder,
    ) {}

    public function enhancePackage(QtiPackage $package): void
    {
        $testResourceMissing = count($package->resources->filterByType(ResourceType::ASSESSMENT_TEST)) === 0;

        if ($testResourceMissing) {
            $this->addTestResource($package);
        }
    }

    private function addTestResource(QtiPackage $package): void
    {
        $package->addResource($this->testResourceBuilder->build(
            $this->generateTest($package),
            new ManifestResourceDependencyCollection(),
        ));
    }

    private function getAssessmentItemRefs(QtiPackage $package): AssessmentItemRefCollection
    {
        $itemFiles = $package->resources->filterByType(ResourceType::ASSESSMENT_ITEM);

        return new AssessmentItemRefCollection(
            array_map(
                fn(Resource $resource): AssessmentItemRef => new AssessmentItemRef(
                    $resource->identifier,
                    $resource->href ?? '',
                ),
                $itemFiles->all(),
            ),
        );
    }

    private function generateTest(QtiPackage $package): AssessmentTest
    {
        return new AssessmentTest(
            AssessmentTestId::generate(),
            new OutcomeDeclarationCollection(),
            new TestPartCollection([
                new TestPart(
                    'testPart',
                    NavigationMode::LINEAR,
                    SubmissionMode::INDIVIDUAL,
                    new AssessmentSectionCollection([
                        new AssessmentSection(
                            'section',
                            'Section',
                            $this->getAssessmentItemRefs($package),
                        ),
                    ]),
                ),
            ]),
        );
    }
}
