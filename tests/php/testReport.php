<?php

require('vendor/autoload.php');

class ReportTest extends PHPUnit_Framework_TestCase
{
    protected $client;

    protected function setUp()
    {
        $this->client = new GuzzleHttp\Client([
            'base_uri' => 'https://scvwdflood.org'
        ]);
    }

    public function testNameSubmit() {

       $response = $this->client->post('/src/report.php', [
        'form_params' => [
            'namereg'    => 'cool',
        ]
    ]);


    $this->assertEquals(200, $response->getStatusCode());

    $data = json_decode($response->getBody(), true);
       var_dump($data);
    }
}
?>
