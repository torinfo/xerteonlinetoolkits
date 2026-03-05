<?php

declare(strict_types=1);

namespace Qti3\Package\Validator;

use Qti3\Package\Model\QtiPackage;
use Qti3\Shared\Collection\StringCollection;

interface IImsQtiPackageValidator extends IQtiPackageValidator
{
    public function validateZipPackage(string $qtiPackageFilename): StringCollection;

    public function validate(QtiPackage $qtiPackage): StringCollection;
}
