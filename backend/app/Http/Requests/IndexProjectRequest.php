<?php

namespace App\Http\Requests;

use App\Enums\ProjectPriority;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the query data for validation.
     */
    protected function prepareForValidation(): void
    {
        $merged = [];

        if ($this->has('sortBy') && ! $this->has('sort_by')) {
            $merged['sort_by'] = $this->query('sortBy');
        }

        if ($this->has('sortOrder') && ! $this->has('sort_order')) {
            $merged['sort_order'] = $this->query('sortOrder');
        }

        if ($this->has('perPage') && ! $this->has('per_page')) {
            $merged['per_page'] = $this->query('perPage');
        }

        if ($this->has('all')) {
            $merged['all'] = filter_var($this->query('all'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        $sortBy = $merged['sort_by'] ?? $this->query('sort_by');
        if ($sortBy) {
            $columnMap = [
                'clientName' => 'client_name',
                'projectName' => 'project_name',
                'startDate' => 'start_date',
                'dueDate' => 'due_date',
                'createdAt' => 'created_at',
            ];

            if (isset($columnMap[$sortBy])) {
                $merged['sort_by'] = $columnMap[$sortBy];
            }
        }

        if (! empty($merged)) {
            $this->merge($merged);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string'],
            'priority' => ['nullable', 'string', Rule::in(ProjectPriority::values())],
            'sort_by' => [
                'nullable',
                'string',
                Rule::in([
                    'id',
                    'client_name',
                    'project_name',
                    'status',
                    'priority',
                    'start_date',
                    'due_date',
                    'created_at',
                ]),
            ],
            'sort_order' => ['nullable', 'string', Rule::in(['asc', 'desc', 'ASC', 'DESC'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'all' => ['nullable', 'boolean'],
        ];
    }
}
