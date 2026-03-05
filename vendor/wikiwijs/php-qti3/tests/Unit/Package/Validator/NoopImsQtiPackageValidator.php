<?php

declare(strict_types=1);

namespace Qti3\Tests\Unit\Package\Validator;

use Qti3\Package\Model\QtiPackage;
use Qti3\Package\Validator\IImsQtiPackageValidator;
use Qti3\Shared\Collection\StringCollection;

class NoopImsQtiPackageValidator implements IImsQtiPackageValidator
{
    public function validateZipPackage(string $qtiPackageFilename): StringCollection
    {
        return new StringCollection();
    }

    public function validate(QtiPackage $qtiPackage): StringCollection
    {
        return new StringCollection();
    }
}
