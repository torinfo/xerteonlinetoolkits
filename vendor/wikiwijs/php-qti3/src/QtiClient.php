<?php

declare(strict_types=1);

namespace Qti3;

use Qti3\AssessmentItem\Service\AssessmentItemDeterminator;
use Qti3\AssessmentItem\Service\Parser\AssessmentItemParser;
use Qti3\AssessmentItem\Service\Parser\InteractionParser;
use Qti3\AssessmentItem\Service\Parser\RubricBlockParser;
use Qti3\AssessmentItem\Service\Parser\FeedbackBlockParser;
use Qti3\AssessmentItem\Service\Parser\StylesheetParser;
use Qti3\AssessmentItem\Service\Parser\ItemBodyParser;
use Qti3\AssessmentItem\Service\Parser\OutcomeDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ProcessingElementParser;
use Qti3\AssessmentItem\Service\Parser\QtiExpressionParser;
use Qti3\AssessmentItem\Service\Parser\ResponseDeclarationParser;
use Qti3\AssessmentItem\Service\Parser\ResponseProcessingParser;
use Qti3\AssessmentItem\Service\Parser\ModalFeedbackParser;
use Qti3\AssessmentItem\Service\ResponseProcessor;
use Qti3\AssessmentTest\Service\Parser\AssessmentItemRefParser;
use Qti3\AssessmentTest\Service\Parser\AssessmentSectionParser;
use Qti3\AssessmentTest\Service\Parser\AssessmentTestParser;
use Qti3\AssessmentTest\Service\Parser\TestPartParser;
use Qti3\AssessmentTest\Service\TestBuilder;
use Qti3\Package\Filesystem\FileSystemUtils;
use Qti3\Package\Filesystem\Zip\ZipArchiveFactory;
use Qti3\Package\Filesystem\Zip\ZipPackageFactory;
use Qti3\Package\Model\Manifest\ManifestFactory;
use Qti3\Package\Service\IFilesystemPackageFactory;
use Qti3\Package\Downloader\Resource\IResourceDownloader;
use Qti3\Package\Service\IZipPackageFactory;
use Qti3\Package\Service\QtiPackageBuilder;
use Qti3\Package\Validator\Resource\IResourceValidator;
use Qti3\Package\Service\QtiPackageBuilder\IXmlBuilder;
use Qti3\Package\Service\QtiPackageBuilder\ItemResourceBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\ManifestBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\MetadataBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\OrganizationsBuilder;
use Qti3\Package\Service\QtiPackageBuilder\Manifest\ResourcesBuilder;
use Qti3\Package\Service\QtiPackageBuilder\TestResourceBuilder;
use Qti3\Package\Service\QtiPackageBuilder\XmlBuilder;
use Qti3\Package\Service\QtiPackageReader;
use Qti3\Package\Validator\QtiPackageValidator;
use Qti3\Package\Validator\QtiSchemaValidator;
use Qti3\Package\Validator\ResponseProcessingValidator;
use Qti3\Shared\Xml\Reader\IXmlReader;
use Qti3\Shared\Xml\Reader\XmlReader;

final class QtiClient
{
    private ?QtiPackageReader $qtiPackageReader = null;
    private ?IZipPackageFactory $zipPackageFactory = null;
    private ?QtiPackageBuilder $qtiPackageBuilder = null;
    private ?IXmlBuilder $xmlBuilder = null;
    private ?ResponseProcessor $responseProcessor = null;
    private ?QtiPackageValidator $qtiPackageValidator = null;
    private ?QtiSchemaValidator $qtiSchemaValidator = null;
    private ?IXmlReader $xmlReader = null;
    private ?ManifestFactory $manifestFactory = null;
    private ?ManifestBuilder $manifestBuilder = null;
    private ?TestResourceBuilder $testResourceBuilder = null;
    private ?ItemResourceBuilder $itemResourceBuilder = null;

    private ?AssessmentItemParser $assessmentItemParser = null;
    private ?ItemBodyParser $itemBodyParser = null;
    private ?AssessmentTestParser $assessmentTestParser = null;
    private ?TestPartParser $testPartParser = null;
    private ?AssessmentSectionParser $assessmentSectionParser = null;
    private ?AssessmentItemRefParser $assessmentItemRefParser = null;
    private ?TestBuilder $testBuilder = null;

    public function __construct(
        private readonly IFilesystemPackageFactory $filesystemPackageFactory,
        private readonly IResourceValidator $resourceValidator,
        private readonly IResourceDownloader $resourceDownloader,
    ) {}

    public function getQtiPackageReader(): QtiPackageReader
    {
        return $this->qtiPackageReader ??= new QtiPackageReader(
            $this->getManifestFactory(),
            $this->getXmlReader(),
            $this->getZipPackageFactory(),
            $this->filesystemPackageFactory,
        );
    }

    public function getAssessmentItemParser(): AssessmentItemParser
    {
        $qtiExpressionParser = new QtiExpressionParser();
        return $this->assessmentItemParser ??= new AssessmentItemParser(
            new ResponseDeclarationParser(),
            new OutcomeDeclarationParser(),
            $this->getItemBodyParser(),
            new ResponseProcessingParser(new ProcessingElementParser($qtiExpressionParser)),
            new StylesheetParser(),
            new ModalFeedbackParser(new StylesheetParser()),
        );
    }

    private function getItemBodyParser(): ItemBodyParser
    {
        return $this->itemBodyParser ??= new ItemBodyParser(
            new InteractionParser(),
            new RubricBlockParser(),
            new FeedbackBlockParser(),
        );
    }

    public function getAssessmentTestParser(): AssessmentTestParser
    {
        return $this->assessmentTestParser ??= new AssessmentTestParser(
            new OutcomeDeclarationParser(),
            $this->getTestPartParser(),
        );
    }

    private function getTestPartParser(): TestPartParser
    {
        return $this->testPartParser ??= new TestPartParser(
            $this->getAssessmentSectionParser(),
        );
    }

    private function getAssessmentSectionParser(): AssessmentSectionParser
    {
        return $this->assessmentSectionParser ??= new AssessmentSectionParser(
            $this->getAssessmentItemRefParser(),
        );
    }

    private function getAssessmentItemRefParser(): AssessmentItemRefParser
    {
        return $this->assessmentItemRefParser ??= new AssessmentItemRefParser();
    }

    public function getTestBuilder(): TestBuilder
    {
        return $this->testBuilder ??= new TestBuilder(
            $this->getAssessmentTestParser(),
        );
    }

    public function getZipPackageFactory(): IZipPackageFactory
    {
        return $this->zipPackageFactory ??= new ZipPackageFactory(
            new ZipArchiveFactory(),
            new FileSystemUtils(),
        );
    }

    public function getFilesystemPackageFactory(): IFilesystemPackageFactory
    {
        return $this->filesystemPackageFactory;
    }

    public function getQtiPackageBuilder(): QtiPackageBuilder
    {
        return $this->qtiPackageBuilder ??= new QtiPackageBuilder(
            $this->getManifestBuilder(),
            $this->getTestResourceBuilder(),
            $this->getItemResourceBuilder(),
            $this->resourceValidator,
            $this->resourceDownloader,
        );
    }

    public function getXmlBuilder(): IXmlBuilder
    {
        return $this->xmlBuilder ??= new XmlBuilder();
    }

    public function getResponseProcessor(): ResponseProcessor
    {
        return $this->responseProcessor ??= new ResponseProcessor(
            new ResponseDeclarationParser(),
            new OutcomeDeclarationParser(),
            new ResponseProcessingParser(
                new ProcessingElementParser(
                    new QtiExpressionParser(),
                ),
            ),
            new AssessmentItemDeterminator(),
        );
    }

    public function getQtiPackageValidator(): QtiPackageValidator
    {
        return $this->qtiPackageValidator ??= new QtiPackageValidator(
            $this->getQtiSchemaValidator(),
            new ResponseProcessingValidator($this->getResponseProcessor()),
        );
    }

    public function getQtiSchemaValidator(): QtiSchemaValidator
    {
        return $this->qtiSchemaValidator ??= new QtiSchemaValidator(
            $this->getManifestFactory(),
            $this->getXmlReader(),
        );
    }

    public function getXmlReader(): IXmlReader
    {
        return $this->xmlReader ??= new XmlReader();
    }

    private function getManifestFactory(): ManifestFactory
    {
        return $this->manifestFactory ??= new ManifestFactory($this->getXmlReader());
    }

    private function getManifestBuilder(): ManifestBuilder
    {
        return $this->manifestBuilder ??= new ManifestBuilder(
            $this->getXmlBuilder(),
            new MetadataBuilder(),
            new OrganizationsBuilder(),
            new ResourcesBuilder(),
            $this->getXmlReader(),
        );
    }

    private function getTestResourceBuilder(): TestResourceBuilder
    {
        return $this->testResourceBuilder ??= new TestResourceBuilder(
            $this->getXmlBuilder(),
            $this->getXmlReader(),
        );
    }

    private function getItemResourceBuilder(): ItemResourceBuilder
    {
        return $this->itemResourceBuilder ??= new ItemResourceBuilder(
            $this->getXmlBuilder(),
            $this->getXmlReader(),
        );
    }
}
