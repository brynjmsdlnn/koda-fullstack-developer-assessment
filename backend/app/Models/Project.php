<?php

namespace App\Models;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'client_name',
        'project_name',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'priority' => ProjectPriority::class,
            'start_date' => 'date:Y-m-d',
            'due_date' => 'date:Y-m-d',
        ];
    }

    /**
     * Scope a query to search client name, project name, or description.
     *
     * @param  Builder<Project>  $query
     * @return Builder<Project>
     */
    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (blank($search)) {
            return $query;
        }

        $term = '%'.trim($search).'%';

        return $query->where(function (Builder $subQuery) use ($term): void {
            $subQuery->where('client_name', 'like', $term)
                ->orWhere('project_name', 'like', $term)
                ->orWhere('description', 'like', $term);
        });
    }

    /**
     * Scope a query to filter by status (single value or comma-separated list).
     *
     * @param  Builder<Project>  $query
     * @param  string|array<int, string>|null  $status
     * @return Builder<Project>
     */
    public function scopeFilterStatus(Builder $query, string|array|null $status): Builder
    {
        if (blank($status)) {
            return $query;
        }

        $statuses = is_array($status)
            ? $status
            : array_filter(array_map('trim', explode(',', $status)));

        return $query->whereIn('status', $statuses);
    }

    /**
     * Scope a query to filter by priority.
     *
     * @param  Builder<Project>  $query
     * @return Builder<Project>
     */
    public function scopeFilterPriority(Builder $query, ?string $priority): Builder
    {
        if (blank($priority)) {
            return $query;
        }

        return $query->where('priority', trim($priority));
    }

    /**
     * Scope a query to sort results by allowed column and order with id tie-breaker.
     *
     * @param  Builder<Project>  $query
     * @return Builder<Project>
     */
    public function scopeSorted(Builder $query, ?string $sortBy = 'created_at', ?string $sortOrder = 'desc'): Builder
    {
        $allowedColumns = [
            'id',
            'client_name',
            'project_name',
            'status',
            'priority',
            'start_date',
            'due_date',
            'created_at',
        ];

        $column = in_array($sortBy, $allowedColumns, true) ? $sortBy : 'created_at';
        $order = strtolower((string) $sortOrder) === 'asc' ? 'asc' : 'desc';

        return $query->orderBy($column, $order)
            ->orderBy('id', 'asc');
    }
}
