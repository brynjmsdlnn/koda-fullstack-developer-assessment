<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Client Project Tracker API',
        'status' => 'ok',
    ]);
});
