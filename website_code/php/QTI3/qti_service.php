<?php
declare(strict_types=1);

if (!file_exists(dirname(__DIR__, 3) . "/vendor/autoload.php")) {
    die("autoload not found");
}

require_once(__DIR__ . "/../../../config.php");

// Composer autoload at site root: <xot-root>/vendor/autoload.php
require_once(dirname(__DIR__, 3) . "/vendor/autoload.php");

use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use Qti3\QtiClient;
use Qti3\Package\Downloader\Resource\PsrHttpClientResourceDownloader;
use Qti3\Package\Filesystem\FileSystemUtils;
use Qti3\Package\Filesystem\FlysystemPackageFactory;
use Qti3\Package\Validator\Resource\PsrHttpClientResourceValidator;
use Symfony\Component\HttpClient\Psr18Client;
use Nyholm\Psr7\Factory\Psr17Factory;

function qti_make_client(string $workDir): QtiClient
{
    if (!is_dir($workDir)) {
        if (!mkdir($workDir, 0777, true)) {
            throw new RuntimeException("Cannot create QTI workdir: {$workDir}");
        }
        chmod($workDir, 0777);
    }

    $adapter = new LocalFilesystemAdapter($workDir);
    $filesystem = new Filesystem($adapter);
    $filesystemPackageFactory = new FlysystemPackageFactory($filesystem);

    $httpClient = new Psr18Client();
    $requestFactory = new Psr17Factory();

    $resourceValidator = new PsrHttpClientResourceValidator($httpClient, $requestFactory);
    $resourceDownloader = new PsrHttpClientResourceDownloader(
        new FileSystemUtils(),
        $httpClient,
        $requestFactory,
        $workDir
    );

    return new QtiClient($filesystemPackageFactory, $resourceValidator, $resourceDownloader);
}

function qti_read_package_from_zip(string $zipPath, string $workDir): \Qti3\Package\Model\QtiPackage
{
    $client = qti_make_client($workDir);
    return $client->getQtiPackageReader()->fromZip($zipPath);
}

function qti_write_package_to_zip(\Qti3\Package\Model\QtiPackage $package, string $zipOutPath, string $workDir): void
{
    $client = qti_make_client($workDir);
    $writer = $client->getZipPackageFactory()->getWriter($zipOutPath);
    $writer->write($package);
}

function qti_get_client(string $workDir): \Qti3\QtiClient
{
    return qti_make_client($workDir);
}