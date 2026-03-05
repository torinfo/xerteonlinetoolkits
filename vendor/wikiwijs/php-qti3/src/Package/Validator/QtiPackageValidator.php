<?php

declare(strict_types=1);

namespace Qti3\Package\Validator;

use Qti3\Package\Model\QtiPackage;
use Qti3\Shared\Collection\StringCollection;

readonly class QtiPackageValidator
{
    public function __construct(
        private IImsQtiPackageValidator $imsValidator,
        private ResponseProcessingValidator $responseProcessingValidator,
    ) {}

    public function validate(QtiPackage $qtiPackage): StringCollection
    {
        /** @var array<int, IQtiPackageValidator> $validators */
        $validators = [
            $this->imsValidator,
            $this->responseProcessingValidator,
        ];

        $errors = new StringCollection();

        foreach ($validators as $validator) {
            $errors = $errors->mergeWith($validator->validate($qtiPackage));
        }

        return $errors;
    }
}
