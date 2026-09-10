<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('client_name')->index();
            $table->string('project_name')->index();
            $table->text('description')->nullable();
            $table->string('status', 50)->default('Planning')->index();
            $table->string('priority', 50)->default('Medium')->index();
            $table->date('start_date')->nullable()->index();
            $table->date('due_date')->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
