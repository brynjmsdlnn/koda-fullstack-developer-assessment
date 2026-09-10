<?php

test('it exposes the api status on the root route', function () {
    $response = $this->getJson('/');

    $response->assertOk()
        ->assertExactJson([
            'name' => 'Client Project Tracker API',
            'status' => 'ok',
        ]);
});
