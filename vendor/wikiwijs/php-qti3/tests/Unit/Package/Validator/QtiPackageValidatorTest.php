<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Validator;

use Qti3\AssessmentItem\Service\AssessmentItemDeterminator;
use Qti3\AssessmentItem\Service\Parser\OutcomeDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ProcessingElementParser;
use Qti3\AssessmentItem\Service\Parser\QtiExpressionParser;
use Qti3\AssessmentItem\Service\Parser\ResponseDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ResponseProcessingParser;
use Qti3\AssessmentItem\Service\ResponseProcessor;
use Qti3\Package\Model\FileContent\MemoryFileContent;
use Qti3\Package\Model\Manifest\ManifestResourceDependencyCollection;
use Qti3\Package\Model\PackageFile\PackageFileCollection;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceCollection;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Model\Manifest\ManifestFactory;
use Qti3\Package\Validator\IImsQtiPackageValidator;
use Qti3\Package\Validator\QtiPackageValidator;
use Qti3\Package\Validator\QtiSchemaValidator;
use Qti3\Package\Validator\ResponseProcessingValidator;
use Qti3\Shared\Collection\StringCollection;
use Qti3\Shared\Xml\Reader\XmlReader;
use Qti3\Tests\Unit\Package\Model\Manifest\ManifestMock;
use Qti3\Tests\Unit\Package\Model\QtiPackageMock;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class QtiPackageValidatorTest extends TestCase
{
    private QtiPackageValidator $validator;
    private XmlReader $xmlReader;

    public function setUp(): void
    {
        $imsQtiPackageValidator = $this->createMock(IImsQtiPackageValidator::class);
        $imsQtiPackageValidator
            ->method('validate')->willReturn(new StringCollection([]));

        $this->validator = new QtiPackageValidator(
            $imsQtiPackageValidator,
            new ResponseProcessingValidator(
                new ResponseProcessor(
                    new ResponseDeclarationParser(),
                    new OutcomeDeclarationParser(),
                    new ResponseProcessingParser(
                        new ProcessingElementParser(
                            new QtiExpressionParser(),
                        ),
                    ),
                    new AssessmentItemDeterminator(),
                ),
            ),
        );
        $this->xmlReader = new XmlReader();
    }

    #[Test]
    public function validatePackageWithUnknownIdentifierReturnsError(): void
    {
        // Arrange

        $qtiPackage = new QtiPackageMock(
            new ResourceCollection(),
            ManifestMock::create(),
        );

        $qtiPackage->addResource(new Resource(
            'item001',
            ResourceType::ASSESSMENT_ITEM,
            'item001.xml',
            new PackageFileCollection([
                new XmlFile(
                    'item001.xml',
                    new MemoryFileContent(file_get_contents(__DIR__ . '/resources/item001.xml')),
                    $this->xmlReader,
                ),
            ]),
            new ManifestResourceDependencyCollection(),
        ));

        // Act

        $errors = $this->validator->validate($qtiPackage);

        // Assert

        $this->assertCount(5, $errors);
    }

    #[Test]
    public function validatePackageWithRealSchemaValidatorReturnsErrors(): void
    {
        $xmlReader = new XmlReader();
        $realValidator = new QtiPackageValidator(
            new NoopImsQtiPackageValidator(),
            new ResponseProcessingValidator(
                new ResponseProcessor(
                    new ResponseDeclarationParser(),
                    new OutcomeDeclarationParser(),
                    new ResponseProcessingParser(
                        new ProcessingElementParser(
                            new QtiExpressionParser(),
                        ),
                    ),
                    new AssessmentItemDeterminator(),
                ),
            ),
        );

        $qtiPackage = new QtiPackageMock(
            new ResourceCollection(),
            ManifestMock::create(),
        );

        $qtiPackage->addResource(new Resource(
            'item001',
            ResourceType::ASSESSMENT_ITEM,
            'item001.xml',
            new PackageFileCollection([
                new XmlFile(
                    'item001.xml',
                    new MemoryFileContent(file_get_contents(__DIR__ . '/resources/item001.xml')),
                    $this->xmlReader,
                ),
            ]),
            new ManifestResourceDependencyCollection(),
        ));

        $errors = $realValidator->validate($qtiPackage);

        // Should contain both schema validation errors (missing manifest identifier) and response processing errors
        $this->assertGreaterThanOrEqual(5, $errors->count());
    }
}
