<?php

namespace Qti3\Tests\Integration;

use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;
use Qti3\Shared\Collection\StringCollection;

#[Group('integration')]
class ValidateSchemaIntegrationTest extends TestCase
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
     * Use case: Valideren van een geldig ZIP bestand tegen het QTI schema.
     */
    public function testValidateValidZipWithQtiSchemaValidatorReturnsNoErrors(): void
    {
        $client = $this->createClient();
        $zipPath = ZipPackageFixture::createValidQtiZip();

        try {
            $schemaValidator = $client->getQtiSchemaValidator();
            $errors = $schemaValidator->validateZipPackage($zipPath);

            $this->assertInstanceOf(StringCollection::class, $errors);
            $this->assertCount(0, $errors, 'Valid QTI ZIP should produce no schema validation errors. Got: ' . implode('; ', iterator_to_array($errors)));
        } finally {
            if (file_exists($zipPath)) {
                unlink($zipPath);
            }
        }
    }

    /**
     * Use case: Valideren van een niet-bestaand ZIP bestand.
     */
    public function testValidateNonExistentZipWithQtiSchemaValidatorReturnsErrors(): void
    {
        $client = $this->createClient();
        $schemaValidator = $client->getQtiSchemaValidator();
        $errors = $schemaValidator->validateZipPackage('/non/existent/package.zip');

        $this->assertInstanceOf(StringCollection::class, $errors);
        $this->assertCount(1, $errors);
        $this->assertStringContainsString('Package file does not exist', iterator_to_array($errors)[0]);
    }
}
