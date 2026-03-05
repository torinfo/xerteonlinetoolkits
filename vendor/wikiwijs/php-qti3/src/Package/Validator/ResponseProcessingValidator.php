<?php

declare(strict_types=1);

namespace Qti3\Package\Validator;

use Qti3\AssessmentItem\Service\ResponseProcessor;
use Qti3\Package\Model\PackageFile\XmlFile;
use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Model\Resource\Resource;
use Qti3\Package\Model\Resource\ResourceType;
use Qti3\Shared\Collection\StringCollection;
use Exception;

readonly class ResponseProcessingValidator implements IQtiPackageValidator
{
    public function __construct(
        private ResponseProcessor $responseProcessor,
    ) {}

    public function validate(QtiPackage $qtiPackage): StringCollection
    {
        $errors = new StringCollection();

        $itemResources = $qtiPackage->resources->filterByType(ResourceType::ASSESSMENT_ITEM);

        /** @var Resource $itemResource */
        foreach ($itemResources as $itemResource) {
            /** @var XmlFile $itemFile */
            $itemFile = $itemResource->getMainFile();

            try {
                $this->responseProcessor->initItemState((string) $itemFile);
            } catch (QtiPackageValidationError $error) {
                /** @var string $validationError */
                foreach ($error->validationErrors() as $validationError) {
                    $errors->add($itemFile->getFilepath() . ': ' . $validationError);
                }
            } catch (Exception $exception) {
                $errors->add($itemFile->getFilepath() . ': ' . $exception->getMessage());
            }
        }

        return $errors;
    }
}
