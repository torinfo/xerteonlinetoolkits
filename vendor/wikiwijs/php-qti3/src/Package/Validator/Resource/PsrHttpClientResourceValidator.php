<?php

declare(strict_types=1);

namespace Qti3\Package\Validator\Resource;

use Exception;
use Psr\Http\Client\ClientInterface;
use Psr\Http\Message\RequestFactoryInterface;
use Qti3\Shared\Model\QtiResource;

readonly class PsrHttpClientResourceValidator implements IResourceValidator
{
    public function __construct(
        private ClientInterface $httpClient,
        private RequestFactoryInterface $requestFactory,
    ) {
    }

    public function validate(
        QtiResource $resource,
    ): void {
        try {
            if (!str_contains($resource->originalPath, '://')) {
                return;
            }

            $request = $this->requestFactory->createRequest('GET', $resource->originalPath);
            $response = $this->httpClient->sendRequest($request);

            if ($response->getStatusCode() >= 400) {
                throw new Exception(sprintf('Failed to download %s. Status code: %d', $resource->originalPath, $response->getStatusCode()));
            }
        } catch (Exception $e) {
            throw new Exception(sprintf('Failed to download %s.', $resource->originalPath), 0, $e);
        }
    }
}
