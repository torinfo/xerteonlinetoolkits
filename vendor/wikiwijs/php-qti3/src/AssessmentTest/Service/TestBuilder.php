<?php

declare(strict_types=1);

namespace Qti3\AssessmentTest\Service;

use Qti3\AssessmentTest\Model\AssessmentTest;
use Qti3\AssessmentTest\Service\Parser\AssessmentTestParser;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Shared\Exception\ResourceNotFoundException;

final readonly class TestBuilder
{
    public function __construct(
        private AssessmentTestParser $assessmentTestParser,
    ) {}

    public function buildFromPackage(QtiPackage $package, ?string $testIdentifier = null): AssessmentTest
    {
        if ($testIdentifier === null) {
            $testIdentifier = $package->getAssessmentTestIdentifier();
        }

        $resource = $package->resources
            ->filter(fn(Resource $resource): bool => $resource->identifier === $testIdentifier)
            ->first();

        if (!$resource || $resource->type !== ResourceType::ASSESSMENT_TEST) {
            throw new ResourceNotFoundException(AssessmentTest::class, (string) $testIdentifier);
        }

        $xmlFile = $resource->getMainFile();
        if (!$xmlFile instanceof XmlFile) {
            throw new \RuntimeException(sprintf('Main file of resource %s is not an XML file', $testIdentifier));
        }

        return $this->assessmentTestParser->parse($xmlFile->getDocumentElement());
    }
}
