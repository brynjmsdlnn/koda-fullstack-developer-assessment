<?php

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Database\Seeders\ProjectSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('it returns an empty paginated collection when no projects exist', function () {
    $response = $this->getJson('/api/projects');

    $response->assertOk()
        ->assertJsonStructure([
            'data',
            'links',
            'meta',
        ])
        ->assertJsonCount(0, 'data');
});

test('it returns an unpaginated collection when all query parameter is true', function () {
    Project::factory()->count(3)->create();

    $response = $this->getJson('/api/projects?all=true');

    $response->assertOk()
        ->assertJsonStructure(['data'])
        ->assertJsonMissing(['links', 'meta'])
        ->assertJsonCount(3, 'data');
});

test('it lists projects with pagination and respects per_page', function () {
    Project::factory()->count(10)->create();

    $response = $this->getJson('/api/projects?per_page=4');

    $response->assertOk()
        ->assertJsonCount(4, 'data')
        ->assertJsonPath('meta.per_page', 4)
        ->assertJsonPath('meta.total', 10);
});

test('it filters projects by status', function () {
    Project::factory()->planning()->create(['project_name' => 'Planning Project']);
    Project::factory()->inProgress()->create(['project_name' => 'Active Project']);
    Project::factory()->completed()->create(['project_name' => 'Done Project']);

    $response = $this->getJson('/api/projects?status=In+Progress');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.projectName', 'Active Project');
});

test('it filters projects by multiple comma-separated statuses', function () {
    Project::factory()->planning()->create(['project_name' => 'Plan']);
    Project::factory()->onHold()->create(['project_name' => 'Hold']);
    Project::factory()->completed()->create(['project_name' => 'Done']);

    $response = $this->getJson('/api/projects?status=Planning,On+Hold');

    $response->assertOk()
        ->assertJsonCount(2, 'data');
});

test('it filters projects by priority', function () {
    Project::factory()->highPriority()->create(['project_name' => 'High Priority']);
    Project::factory()->lowPriority()->create(['project_name' => 'Low Priority']);

    $response = $this->getJson('/api/projects?priority=High');

    $response->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.projectName', 'High Priority');
});

test('it searches projects by client name, project name, or description', function () {
    Project::factory()->create([
        'client_name' => 'Acme Corp',
        'project_name' => 'Website Redesign',
        'description' => 'Modernize frontend',
    ]);
    Project::factory()->create([
        'client_name' => 'Beta LLC',
        'project_name' => 'Mobile App',
        'description' => 'iOS and Android client',
    ]);

    $searchByClient = $this->getJson('/api/projects?search=Acme');
    $searchByClient->assertOk()->assertJsonCount(1, 'data');

    $searchByProject = $this->getJson('/api/projects?search=Mobile');
    $searchByProject->assertOk()->assertJsonCount(1, 'data');

    $searchByDesc = $this->getJson('/api/projects?search=frontend');
    $searchByDesc->assertOk()->assertJsonCount(1, 'data');
});

test('it sorts projects correctly with id tie-breaker', function () {
    Project::factory()->create(['client_name' => 'Bravo Corp', 'created_at' => now()->subDay()]);
    Project::factory()->create(['client_name' => 'Alpha Corp', 'created_at' => now()]);

    $responseAsc = $this->getJson('/api/projects?sort_by=client_name&sort_order=asc');
    $responseAsc->assertOk();
    expect($responseAsc->json('data.0.clientName'))->toBe('Alpha Corp');

    $responseDesc = $this->getJson('/api/projects?sort_by=client_name&sort_order=desc');
    $responseDesc->assertOk();
    expect($responseDesc->json('data.0.clientName'))->toBe('Bravo Corp');
});

test('it retrieves a single project by id', function () {
    $project = Project::factory()->create([
        'client_name' => 'Acme Inc',
        'project_name' => 'Brand Refresh',
    ]);

    $response = $this->getJson("/api/projects/{$project->id}");

    $response->assertOk()
        ->assertJsonPath('data.id', $project->id)
        ->assertJsonPath('data.clientName', 'Acme Inc')
        ->assertJsonPath('data.client_name', 'Acme Inc')
        ->assertJsonPath('data.projectName', 'Brand Refresh');
});

test('it returns 404 when project does not exist', function () {
    $response = $this->getJson('/api/projects/99999');

    $response->assertNotFound();
});

test('it creates a project successfully with snake_case payload', function () {
    $payload = [
        'client_name' => 'Acme Corp',
        'project_name' => 'Portal Development',
        'description' => 'Secure client portal',
        'status' => 'Planning',
        'priority' => 'High',
        'start_date' => '2026-06-01',
        'due_date' => '2026-08-01',
    ];

    $response = $this->postJson('/api/projects', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.clientName', 'Acme Corp')
        ->assertJsonPath('data.projectName', 'Portal Development')
        ->assertJsonPath('data.status', 'Planning')
        ->assertJsonPath('data.priority', 'High');

    $this->assertDatabaseHas('projects', [
        'client_name' => 'Acme Corp',
        'project_name' => 'Portal Development',
    ]);
});

test('it creates a project successfully with camelCase payload', function () {
    $payload = [
        'clientName' => 'Starlight Digital',
        'projectName' => 'E-Commerce Platform',
        'description' => 'Full store redesign',
        'status' => 'In Progress',
        'priority' => 'Medium',
        'startDate' => '2026-06-10',
        'dueDate' => '2026-07-20',
    ];

    $response = $this->postJson('/api/projects', $payload);

    $response->assertCreated()
        ->assertJsonPath('data.clientName', 'Starlight Digital')
        ->assertJsonPath('data.projectName', 'E-Commerce Platform')
        ->assertJsonPath('data.status', 'In Progress')
        ->assertJsonPath('data.priority', 'Medium');

    $this->assertDatabaseHas('projects', [
        'client_name' => 'Starlight Digital',
        'project_name' => 'E-Commerce Platform',
    ]);
});

test('it validates required fields on creation', function () {
    $response = $this->postJson('/api/projects', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['client_name', 'project_name', 'status', 'priority']);
});

test('it validates enum values on creation', function () {
    $response = $this->postJson('/api/projects', [
        'client_name' => 'Test Client',
        'project_name' => 'Test Project',
        'status' => 'UnknownStatus',
        'priority' => 'Urgent',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['status', 'priority']);
});

test('it fails creation when due_date is earlier than start_date', function () {
    $response = $this->postJson('/api/projects', [
        'client_name' => 'Acme Corp',
        'project_name' => 'Backwards Timeline',
        'status' => 'Planning',
        'priority' => 'Low',
        'start_date' => '2026-06-10',
        'due_date' => '2026-06-01',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['due_date']);
    expect($response->json('errors.due_date.0'))->toBe('Due Date cannot be earlier than Start Date.');
});

test('it updates project fields with partial payload', function () {
    $project = Project::factory()->create([
        'project_name' => 'Original Name',
        'status' => ProjectStatus::Planning,
    ]);

    $response = $this->putJson("/api/projects/{$project->id}", [
        'projectName' => 'Updated Name',
        'status' => 'In Progress',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.projectName', 'Updated Name')
        ->assertJsonPath('data.status', 'In Progress');

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'project_name' => 'Updated Name',
        'status' => 'In Progress',
    ]);
});

test('it compares submitted due_date against stored start_date on partial update', function () {
    $project = Project::factory()->create([
        'start_date' => '2026-06-01',
        'due_date' => '2026-07-01',
    ]);

    $response = $this->patchJson("/api/projects/{$project->id}", [
        'dueDate' => '2026-05-15',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['due_date']);
    expect($response->json('errors.due_date.0'))->toBe('Due Date cannot be earlier than Start Date.');
});

test('it compares submitted start_date against stored due_date on partial update', function () {
    $project = Project::factory()->create([
        'start_date' => '2026-06-01',
        'due_date' => '2026-07-01',
    ]);

    $response = $this->patchJson("/api/projects/{$project->id}", [
        'startDate' => '2026-07-15',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['due_date']);
    expect($response->json('errors.due_date.0'))->toBe('Due Date cannot be earlier than Start Date.');
});

test('it allows clearing nullable dates on update', function () {
    $project = Project::factory()->create([
        'start_date' => '2026-06-01',
        'due_date' => '2026-07-01',
    ]);

    $response = $this->putJson("/api/projects/{$project->id}", [
        'startDate' => null,
        'dueDate' => null,
    ]);

    $response->assertOk()
        ->assertJsonPath('data.startDate', null)
        ->assertJsonPath('data.dueDate', null);

    $project->refresh();
    expect($project->start_date)->toBeNull();
    expect($project->due_date)->toBeNull();
});

test('it deletes a project and returns 204 No Content', function () {
    $project = Project::factory()->create();

    $response = $this->deleteJson("/api/projects/{$project->id}");

    $response->assertNoContent();
    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});

test('it returns 404 when attempting to delete non-existent project', function () {
    $response = $this->deleteJson('/api/projects/99999');

    $response->assertNotFound();
});

test('it seeds 12 projects from test_data.json accurately', function () {
    $this->seed(ProjectSeeder::class);

    expect(Project::count())->toBe(12);

    $first = Project::find(1);
    expect($first)->not->toBeNull()
        ->and($first->client_name)->toBe('Acme Corporation')
        ->and($first->project_name)->toBe('Corporate Website Redesign')
        ->and($first->status)->toBe(ProjectStatus::InProgress)
        ->and($first->priority)->toBe(ProjectPriority::High);
});
