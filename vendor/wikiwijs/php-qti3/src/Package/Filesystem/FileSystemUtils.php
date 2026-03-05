<?php

declare(strict_types=1);

namespace Qti3\Package\Filesystem;

use Exception;
use RuntimeException;
use SplFileObject;

class FileSystemUtils
{
    public function generateTempFilename(): string
    {
        return tempnam(sys_get_temp_dir(), 'qti_');
    }

    public static function removeFile(string $filename): void
    {
        if (is_file($filename)) {
            unlink($filename);
        }
    }

    public function ensureDirectory(string $directory): void
    {
        if (is_dir($directory)) {
            return;
        }
        if (file_exists($directory)) {
            throw new Exception(sprintf('A file with the name %s already exists and is not a directory.', $directory));
        }
        $success = mkdir($directory, 0755, true);
        if ($success === false) {
            throw new Exception(sprintf('Failed to create directory %s', $directory)); // @codeCoverageIgnore
        }
    }

    public function getFileContents(string $filepath): string
    {
        try {
            $file = new SplFileObject($filepath, 'r');
            $contents = $file->fread($file->getSize());
            if ($contents === false) {
                throw new Exception(sprintf('Could not read file: %s', $filepath)); // @codeCoverageIgnore
            }
            return $contents;
        } catch (RuntimeException $e) {
            throw new Exception(sprintf('Could not read file: %s', $filepath), 0, $e); // @codeCoverageIgnore
        }
    }

    /**
     * Checks if file exists and is not empty.
     */
    public function isValidFile(string $filename): bool
    {
        return is_file($filename) && filesize($filename) > 0;
    }
}
