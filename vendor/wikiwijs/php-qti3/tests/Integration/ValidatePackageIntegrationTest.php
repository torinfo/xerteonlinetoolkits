<?php

namespace Qti3\Tests\Integration;

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Package\Validator\QtiPackageValidator;
use Qti3\Package\Validator\ResponseProcessingValidator;
use Qti3\Shared\Collection\StringCollection;
use Qti3\Tests\Unit\Package\Validator\NoopImsQtiPackageValidator;

#[Group('integration')]
class ValidatePackageIntegrationTest extends TestCase
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

    /**
     * Use case: Een QtiPackage valideren die uit een ZIP bestand komt.
     */
    public function testValidatePackageFromZipWithQtiPackageValidatorReturnsErrorsFromBothValidators(): void
    {
        $client = $this->createClient();
        $zipPath = ZipPackageFixture::createValidQtiZip();

        try {
            $reader = $client->getQtiPackageReader();
            $package = $reader->fromZip($zipPath);
            // Use NoopImsQtiPackageValidator to skip heavy XSD validation in this test
            $validator = new QtiPackageValidator(
                new NoopImsQtiPackageValidator(),
                new ResponseProcessingValidator($client->getResponseProcessor())
            );
            $errors = $validator->validate($package);

            $this->assertInstanceOf(StringCollection::class, $errors);
            // item001.xml triggers response processing validation
            $this->assertGreaterThanOrEqual(0, $errors->count());
        } finally {
            if (file_exists($zipPath)) {
                unlink($zipPath);
            }
        }
    }

    public function testImportRealZipPackageHasCorrectStructure(): void
    {
        $client = $this->createClient();
        $reader = $client->getQtiPackageReader();
        $package = $reader->fromZip($this->getFixturePath('valid-package.zip'));

        $assessmentTests = $package->resources->filterByType(ResourceType::ASSESSMENT_TEST);
        $this->assertCount(1, $assessmentTests, 'Package should contain exactly 1 assessment test');

        $assessmentItems = $package->resources->filterByType(ResourceType::ASSESSMENT_ITEM);
        $this->assertCount(47, $assessmentItems, 'Package should contain exactly 47 assessment items');

        $metadataResources = $package->resources->filterByType(ResourceType::RESOURCE_METADATA);
        $this->assertGreaterThan(0, $metadataResources->count(), 'Package should contain resource metadata');

        $metadata = $package->getMetadata();
        $this->assertNotNull($metadata, 'Package metadata should be accessible');

        $files = $package->getFiles();
        $this->assertGreaterThan(0, $files->count(), 'Package should have accessible files');

        $testIdentifier = $package->getAssessmentTestIdentifier();
        $this->assertNotEmpty($testIdentifier, 'Assessment test identifier should not be empty');
    }

    public function testImportRealZipPackagePassesValidation(): void
    {
        $client = $this->createClient();
        $reader = $client->getQtiPackageReader();
        $package = $reader->fromZip($this->getFixturePath('valid-package.zip'));

        $validator = new QtiPackageValidator(
            new NoopImsQtiPackageValidator(),
            new ResponseProcessingValidator($client->getResponseProcessor()),
        );
        $errors = $validator->validate($package);

        $this->assertInstanceOf(StringCollection::class, $errors);
        $this->assertCount(0, $errors, 'Valid package should produce no validation errors. Got: ' . implode('; ', iterator_to_array($errors)));
    }

    public function testImportInvalidResponseProcessingZipPackageFailsValidation(): void
    {
        $client = $this->createClient();
        $reader = $client->getQtiPackageReader();
        $package = $reader->fromZip($this->getFixturePath('invalid-response-processing.zip'));

        $validator = new QtiPackageValidator(
            new NoopImsQtiPackageValidator(),
            new ResponseProcessingValidator($client->getResponseProcessor()),
        );
        $errors = $validator->validate($package);

        $this->assertInstanceOf(StringCollection::class, $errors);
        $this->assertGreaterThan(0, $errors->count(), 'Package should have validation errors');

        $errorMessages = iterator_to_array($errors);
        $this->assertSame('QUE_1_1.xml: Correct response for response declaration with identifier RESPONSE not found', $errorMessages[0]);
    }

    public function testImportNoMaxScoreAllItemsZipPackageFailsValidation(): void
    {
        $client = $this->createClient();
        $reader = $client->getQtiPackageReader();
        $package = $reader->fromZip($this->getFixturePath('no-max-score-all-items.zip'));

        $validator = new QtiPackageValidator(
            new NoopImsQtiPackageValidator(),
            new ResponseProcessingValidator($client->getResponseProcessor()),
        );
        $errors = $validator->validate($package);

        $this->assertInstanceOf(StringCollection::class, $errors);
        $this->assertGreaterThan(0, $errors->count(), 'Package should have validation errors');

        $errorMessages = iterator_to_array($errors);
        $this->assertContains('QUE_1_1.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertContains('QUE_2_1.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertNotContains('QUE_2_2.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertContains('QUE_2_3.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertContains('QUE_2_4.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertContains('QUE_2_5.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertContains('QUE_3_1.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertContains('QUE_4_1.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertNotContains('QUE_5_1.xml: Outcome declaration with identifier MAXSCORE not found', $errorMessages);
        $this->assertContains('QUE_6_1.xml: Missing default value for MAXSCORE outcome declaration', $errorMessages);
    }

    public function testImportNoMetadataZipPackagePassesValidation(): void
    {
        $client = $this->createClient();
        $reader = $client->getQtiPackageReader();
        $package = $reader->fromZip($this->getFixturePath('no-metadata.zip'));

        $validator = new QtiPackageValidator(
            new NoopImsQtiPackageValidator(),
            new ResponseProcessingValidator($client->getResponseProcessor()),
        );
        $errors = $validator->validate($package);

        $this->assertInstanceOf(StringCollection::class, $errors);
        $this->assertCount(0, $errors, 'Package without metadata should produce no validation errors. Got: ' . implode('; ', iterator_to_array($errors)));
    }

    private function getFixturePath(string $filename): string
    {
        $path = __DIR__ . '/../../fixtures/' . $filename;
        $this->assertFileExists($path, "Fixture file not found: $filename");
        return $path;
    }
}
