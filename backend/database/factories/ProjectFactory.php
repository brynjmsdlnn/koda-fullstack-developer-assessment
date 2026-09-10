<?php

namespace Database\Factories;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', '+1 month');
        $dueDate = (clone $startDate)->modify('+'.fake()->numberBetween(10, 60).' days');

        return [
            'client_name' => fake()->company(),
            'project_name' => fake()->catchPhrase(),
            'description' => fake()->sentence(12),
            'status' => fake()->randomElement(ProjectStatus::cases()),
            'priority' => fake()->randomElement(ProjectPriority::cases()),
            'start_date' => $startDate->format('Y-m-d'),
            'due_date' => $dueDate->format('Y-m-d'),
        ];
    }

    /**
     * Indicate that the project is in planning state.
     */
    public function planning(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::Planning,
        ]);
    }

    /**
     * Indicate that the project is in progress state.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::InProgress,
        ]);
    }

    /**
     * Indicate that the project is on hold.
     */
    public function onHold(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::OnHold,
        ]);
    }

    /**
     * Indicate that the project is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ProjectStatus::Completed,
        ]);
    }

    /**
     * Indicate that the project has high priority.
     */
    public function highPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => ProjectPriority::High,
        ]);
    }

    /**
     * Indicate that the project has medium priority.
     */
    public function mediumPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => ProjectPriority::Medium,
        ]);
    }

    /**
     * Indicate that the project has low priority.
     */
    public function lowPriority(): static
    {
        return $this->state(fn (array $attributes) => [
            'priority' => ProjectPriority::Low,
        ]);
    }

    /**
     * Indicate that the project has no dates set.
     */
    public function withoutDates(): static
    {
        return $this->state(fn (array $attributes) => [
            'start_date' => null,
            'due_date' => null,
        ]);
    }
}
