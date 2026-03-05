<?php

declare(strict_types=1);

namespace Qti3\Shared\Xml\Reader;

use DOMDocument;

readonly class XmlReader implements IXmlReader
{
    public function read(string $content): DOMDocument
    {
        $internalErrors = libxml_use_internal_errors(true);
        libxml_clear_errors();
        $dom = new DOMDocument();
        $dom->validateOnParse = true;
        $dom->preserveWhiteSpace = true;
        $dom->formatOutput = true;

        if (!$dom->loadXML($content, LIBXML_NONET | LIBXML_COMPACT)) {
            throw new XmlParsingException(implode("\n", static::getXmlErrors($internalErrors)));
        }
        $dom->normalizeDocument();
        libxml_use_internal_errors($internalErrors);
        foreach ($dom->childNodes as $child) {
            if ($child->nodeType === XML_DOCUMENT_TYPE_NODE) {
                throw new XmlParsingException('Document types are not allowed.');
            }
        }
        libxml_clear_errors();
        libxml_use_internal_errors($internalErrors);
        return $dom;
    }

    /**
     * @return array<int, string>
     */
    protected static function getXmlErrors(bool $internalErrors): array
    {
        $errors = [];
        foreach (libxml_get_errors() as $error) {
            $errors[] = sprintf('[%s %s] %s (in %s - line %d, column %d)', $error->level == LIBXML_ERR_WARNING ? 'WARNING' : 'ERROR', $error->code, trim($error->message), $error->file ?: 'n/a', $error->line, $error->column);
        }
        libxml_clear_errors();
        libxml_use_internal_errors($internalErrors);
        return $errors;
    }
}
