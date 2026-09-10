<?php

namespace App\Http\Resources;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'clientName' => $this->client_name,
            'projectName' => $this->project_name,
            'description' => $this->description,
            'status' => $this->status instanceof ProjectStatus ? $this->status->value : $this->status,
            'priority' => $this->priority instanceof ProjectPriority ? $this->priority->value : $this->priority,
            'startDate' => $this->start_date?->format('Y-m-d'),
            'dueDate' => $this->due_date?->format('Y-m-d'),
            'client_name' => $this->client_name,
            'project_name' => $this->project_name,
            'start_date' => $this->start_date?->format('Y-m-d'),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
