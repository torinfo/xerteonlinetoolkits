<?php

declare(strict_types=1);

namespace Qti3\Package\Validator;

use DOMDocument;
use Qti3\Package\Model\Manifest\Manifest;
use Qti3\Package\Model\Manifest\ManifestFactory;
use Qti3\Package\Model\Manifest\ManifestResource;
use Qti3\Package\Model\PackageFile\PackageFile;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Shared\Collection\StringCollection;
use Qti3\Shared\Xml\Reader\IXmlReader;
use Qti3\Shared\Xml\Reader\XmlParsingException;
use RuntimeException;
use ZipArchive;

readonly class QtiSchemaValidator implements IImsQtiPackageValidator
{
    private const string QTI_NAMESPACE = 'http://www.imsglobal.org/xsd/imsqtiasi_v3p0';
    private const string MANIFEST_NAMESPACE = 'http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1';

    private const string QTI_XSD = __DIR__ . '/../Resources/Scheme/imsqti_asiv3p0_v1p0.xsd';
    private const string MANIFEST_XSD = __DIR__ . '/../Resources/Scheme/imsqtiv3p0_imscpv1p2_v1p0.xsd';

    public function __construct(
        private ManifestFactory $manifestFactory,
        private IXmlReader $xmlReader,
    ) {}

    public function validateZipPackage(string $qtiPackageFilename): StringCollection
    {
        $errors = new StringCollection();

        if (!file_exists($qtiPackageFilename)) {
            $errors->add('Package file does not exist: ' . $qtiPackageFilename);
            return $errors;
        }

        $zip = new ZipArchive();
        $result = $zip->open($qtiPackageFilename, ZipArchive::RDONLY);

        if ($result !== true) {
            $errors->add('Invalid ZIP file: ' . $qtiPackageFilename);
            return $errors;
        }

        try {
            $manifestContent = $zip->getFromName(Manifest::MANIFEST_FILE_NAME);
            if ($manifestContent === false) {
                $errors->add('Missing ' . Manifest::MANIFEST_FILE_NAME . ' in package');
                return $errors;
            }

            $errors = $errors->mergeWith($this->validateManifestXml($manifestContent));

            try {
                $manifest = $this->manifestFactory->createFromXmlString($manifestContent);
            } catch (RuntimeException|XmlParsingException $e) {
                $errors->add('Cannot parse manifest: ' . $e->getMessage());
                return $errors;
            }

            /** @var ManifestResource $resource */
            foreach ($manifest->getResources() as $resource) {
                foreach ($resource->files as $file) {
                    if ($zip->getFromName($file->href) === false) {
                        $errors->add('File referenced in manifest not found in package: ' . $file->href);
                    }
                }

                if ($resource->href !== null) {
                    $fileContent = $zip->getFromName($resource->href);
                    if ($fileContent === false) {
                        $errors->add('Resource href not found in package: ' . $resource->href);
                        continue;
                    }

                    if (str_ends_with($resource->href, '.xml')) {
                        $errors = $errors->mergeWith(
                            $this->validateResourceXml($resource->type, $resource->href, $fileContent),
                        );
                    }
                }
            }
        } finally {
            $zip->close();
        }

        return $errors;
    }

    public function validate(QtiPackage $qtiPackage): StringCollection
    {
        return $this->validateManifest($qtiPackage->manifest)
            ->mergeWith($this->validateResources($qtiPackage));
    }

    private function validateManifest(Manifest $manifest): StringCollection
    {
        $errors = new StringCollection();

        if (empty($manifest->getIdentifier())) {
            $errors->add('Manifest is missing required attribute: identifier');
        }

        $documentElement = $manifest->getDocumentElement();
        $namespace = $documentElement->namespaceURI;

        if ($namespace !== null && $namespace !== self::MANIFEST_NAMESPACE) {
            $errors->add(
                'Manifest has invalid namespace: ' . $namespace . ', expected: ' . self::MANIFEST_NAMESPACE,
            );
        }

        try {
            $resources = $manifest->getResources();
            if ($resources->count() === 0) {
                $errors->add('Manifest contains no resources');
            }
        } catch (RuntimeException $e) {
            $errors->add('Invalid manifest resource: ' . $e->getMessage());
        }

        return $errors;
    }

    private function validateResources(QtiPackage $qtiPackage): StringCollection
    {
        $errors = new StringCollection();

        /** @var Resource $resource */
        foreach ($qtiPackage->resources as $resource) {
            if (empty($resource->identifier)) {
                $errors->add('Resource is missing identifier');
            }

            /** @var PackageFile $file */
            foreach ($resource->files as $file) {
                if ($file instanceof XmlFile) {
                    $errors = $errors->mergeWith(
                        $this->validateResourceXml(
                            $resource->type,
                            $file->getFilepath(),
                            (string) $file,
                        ),
                    );
                }
            }
        }

        return $errors;
    }

    private function validateResourceXml(ResourceType $type, string $filepath, string $content): StringCollection
    {
        $errors = new StringCollection();

        try {
            $dom = $this->xmlReader->read($content);
        } catch (XmlParsingException $e) {
            $errors->add($filepath . ': Invalid XML - ' . $e->getMessage());
            return $errors;
        }

        $documentElement = $dom->documentElement;
        if ($documentElement === null) {
            $errors->add($filepath . ': Empty XML document');
            return $errors;
        }

        $structuralErrors = match ($type) {
            ResourceType::ASSESSMENT_ITEM => $this->validateQtiRootElement(
                $filepath, $dom, 'qti-assessment-item', ['identifier', 'title', 'time-dependent'],
            ),
            ResourceType::ASSESSMENT_TEST => $this->validateQtiRootElement(
                $filepath, $dom, 'qti-assessment-test', ['identifier', 'title'],
            ),
            default => new StringCollection(),
        };

        $xsdErrors = match ($type) {
            ResourceType::ASSESSMENT_ITEM,
            ResourceType::ASSESSMENT_TEST => $this->validateAgainstXsd($content, self::QTI_XSD, $filepath),
            default => new StringCollection(),
        };

        return $structuralErrors->mergeWith($xsdErrors);
    }

    /**
     * @param array<int, string> $requiredAttributes
     */
    private function validateQtiRootElement(
        string $filepath,
        DOMDocument $dom,
        string $expectedRootElement,
        array $requiredAttributes,
    ): StringCollection {
        $errors = new StringCollection();
        $root = $dom->documentElement;

        if ($root === null) {
            $errors->add($filepath . ': Empty XML document');
            return $errors;
        }

        if ($root->localName !== $expectedRootElement) {
            $errors->add($filepath . ': Root element must be ' . $expectedRootElement . ', found: ' . $root->localName);
        }

        if ($root->namespaceURI !== self::QTI_NAMESPACE) {
            $errors->add(
                $filepath . ': Invalid namespace: ' . ($root->namespaceURI ?? 'none') . ', expected: ' . self::QTI_NAMESPACE,
            );
        }

        foreach ($requiredAttributes as $attribute) {
            if (!$root->hasAttribute($attribute) || empty($root->getAttribute($attribute))) {
                $errors->add($filepath . ': Missing required attribute: ' . $attribute);
            }
        }

        return $errors;
    }

    private function validateManifestXml(string $content): StringCollection
    {
        $errors = new StringCollection();

        try {
            $this->xmlReader->read($content);
        } catch (XmlParsingException $e) {
            $errors->add('Manifest XML is invalid: ' . $e->getMessage());
            return $errors;
        }

        return $errors->mergeWith($this->validateAgainstXsd($content, self::MANIFEST_XSD, 'Manifest'));
    }

    private function validateAgainstXsd(string $content, string $xsdPath, string $context): StringCollection
    {
        $errors = new StringCollection();

        $previousUseErrors = libxml_use_internal_errors(true);
        libxml_clear_errors();

        $dom = new DOMDocument();
        $dom->loadXML($content);

        if (!$dom->schemaValidate($xsdPath)) {
            foreach (libxml_get_errors() as $error) {
                $message = trim($error->message);
                $errors->add(sprintf('%s: XSD validation error on line %d: %s', $context, $error->line, $message));
            }
        }

        libxml_clear_errors();
        libxml_use_internal_errors($previousUseErrors);

        return $errors;
    }
}
