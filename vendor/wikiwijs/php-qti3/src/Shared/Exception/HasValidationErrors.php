<?php

declare(strict_types=1);

namespace Qti3\Shared\Exception;

use Qti3\Shared\Collection\StringCollection;

interface HasValidationErrors
{
    public function validationErrors(): StringCollection;
}
