<?php

use App\Http\Controllers\Api\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => 'Client Project Tracker API',
        'status' => 'ok',
    ]);
});

Route::middleware('api')->group(function (): void {
    Route::apiResource('projects', ProjectController::class);
});
