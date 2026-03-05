<?php

namespace Qti3\Tests\Unit\Unit;

use PHPUnit\Framework\TestCase;
use Qti3\Package\Filesystem\Zip\ZipPackageFactory;
use Qti3\Package\Service\IFilesystemPackageFactory;
use Qti3\Package\Downloader\Resource\IResourceDownloader;
use Qti3\Package\Service\QtiPackageBuilder;
use Qti3\Package\Validator\Resource\IResourceValidator;
use Qti3\Package\Service\QtiPackageBuilder\XmlBuilder;
use Qti3\Package\Service\QtiPackageReader;
use Qti3\Package\Validator\QtiSchemaValidator;
use Qti3\QtiClient;

class QtiClientTest extends TestCase
{
    private function createClient(
        ?IFilesystemPackageFactory $filesystemPackageFactory = null,
        ?IResourceValidator $resourceValidator = null,
        ?IResourceDownloader $resourceDownloader = null,
    ): QtiClient {
        return new QtiClient(
            $filesystemPackageFactory ?? $this->createMock(IFilesystemPackageFactory::class),
            $resourceValidator ?? $this->createMock(IResourceValidator::class),
            $resourceDownloader ?? $this->createMock(IResourceDownloader::class),
        );
    }

    public function testGetQtiPackageReaderReturnsInstance(): void
    {
        $container = $this->createClient();
        $reader = $container->getQtiPackageReader();
        $this->assertInstanceOf(QtiPackageReader::class, $reader);
    }

    public function testGetQtiPackageReaderReturnsSameInstance(): void
    {
        $container = $this->createClient();
        $this->assertSame(
            $container->getQtiPackageReader(),
            $container->getQtiPackageReader(),
        );
    }

    public function testGetZipPackageFactoryReturnsInstance(): void
    {
        $container = $this->createClient();
        $factory = $container->getZipPackageFactory();
        $this->assertInstanceOf(ZipPackageFactory::class, $factory);
    }

    public function testGetZipPackageFactoryReturnsSameInstance(): void
    {
        $container = $this->createClient();
        $this->assertSame(
            $container->getZipPackageFactory(),
            $container->getZipPackageFactory(),
        );
    }

    public function testGetFilesystemPackageFactoryReturnsProvidedFactory(): void
    {
        $factory = $this->createMock(IFilesystemPackageFactory::class);
        $container = $this->createClient(filesystemPackageFactory: $factory);
        $this->assertSame($factory, $container->getFilesystemPackageFactory());
    }

    public function testGetQtiPackageBuilderReturnsInstance(): void
    {
        $container = $this->createClient();
        $builder = $container->getQtiPackageBuilder();
        $this->assertInstanceOf(QtiPackageBuilder::class, $builder);
    }

    public function testGetQtiPackageBuilderReturnsSameInstance(): void
    {
        $container = $this->createClient();
        $this->assertSame(
            $container->getQtiPackageBuilder(),
            $container->getQtiPackageBuilder(),
        );
    }

    public function testGetXmlBuilderReturnsInstance(): void
    {
        $container = $this->createClient();
        $builder = $container->getXmlBuilder();
        $this->assertInstanceOf(XmlBuilder::class, $builder);
    }

    public function testGetXmlBuilderReturnsSameInstance(): void
    {
        $container = $this->createClient();
        $this->assertSame(
            $container->getXmlBuilder(),
            $container->getXmlBuilder(),
        );
    }

    public function testGetResponseProcessorReturnsInstance(): void
    {
        $container = $this->createClient();
        $processor = $container->getResponseProcessor();
        $this->assertInstanceOf(\Qti3\AssessmentItem\Service\ResponseProcessor::class, $processor);
    }

    public function testGetResponseProcessorReturnsSameInstance(): void
    {
        $container = $this->createClient();
        $this->assertSame(
            $container->getResponseProcessor(),
            $container->getResponseProcessor(),
        );
    }

    public function testGetXmlReaderReturnsInstance(): void
    {
        $container = $this->createClient();
        $reader = $container->getXmlReader();
        $this->assertInstanceOf(\Qti3\Shared\Xml\Reader\XmlReader::class, $reader);
    }

    public function testGetQtiPackageValidatorReturnsInstance(): void
    {
        $client = $this->createClient();
        $validator = $client->getQtiPackageValidator();
        $this->assertInstanceOf(\Qti3\Package\Validator\QtiPackageValidator::class, $validator);
    }

    public function testGetQtiPackageValidatorReturnsSameInstance(): void
    {
        $client = $this->createClient();
        $this->assertSame(
            $client->getQtiPackageValidator(),
            $client->getQtiPackageValidator(),
        );
    }

    public function testGetQtiSchemaValidatorReturnsInstance(): void
    {
        $client = $this->createClient();
        $validator = $client->getQtiSchemaValidator();
        $this->assertInstanceOf(QtiSchemaValidator::class, $validator);
    }

    public function testGetQtiSchemaValidatorReturnsSameInstance(): void
    {
        $client = $this->createClient();
        $this->assertSame(
            $client->getQtiSchemaValidator(),
            $client->getQtiSchemaValidator(),
        );
    }
}
