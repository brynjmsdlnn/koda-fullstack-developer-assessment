<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $candidatePaths = [
            database_path('data/test_data.json'),
            base_path('../test_data.json'),
            base_path('test_data.json'),
        ];

        $jsonPath = null;
        foreach ($candidatePaths as $path) {
            if (file_exists($path)) {
                $jsonPath = $path;
                break;
            }
        }

        if ($jsonPath === null) {
            throw new RuntimeException('Unable to locate test_data.json in any expected path.');
        }

        $rawJson = file_get_contents($jsonPath);
        if ($rawJson === false) {
            throw new RuntimeException("Failed to read test data from {$jsonPath}.");
        }

        $projects = json_decode($rawJson, true);
        if (! is_array($projects)) {
            throw new RuntimeException("Invalid JSON format in {$jsonPath}.");
        }

        DB::transaction(function () use ($projects): void {
            foreach ($projects as $item) {
                Project::updateOrCreate(
                    ['id' => $item['id']],
                    [
                        'client_name' => $item['clientName'] ?? $item['client_name'],
                        'project_name' => $item['projectName'] ?? $item['project_name'],
                        'description' => $item['description'] ?? null,
                        'status' => $item['status'],
                        'priority' => $item['priority'],
                        'start_date' => $item['startDate'] ?? $item['start_date'] ?? null,
                        'due_date' => $item['dueDate'] ?? $item['due_date'] ?? null,
                    ]
                );
            }
        });
    }
}
