<?php

namespace App\Http\Requests;

use App\Enums\ProjectPriority;
use App\Enums\ProjectStatus;
use App\Http\Requests\Concerns\NormalizesProjectInput;
use App\Models\Project;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    use NormalizesProjectInput;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->normalizeProjectInput();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'client_name' => ['sometimes', 'required', 'string', 'max:255'],
            'project_name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', 'required', Rule::enum(ProjectStatus::class)],
            'priority' => ['sometimes', 'required', Rule::enum(ProjectPriority::class)],
            'start_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'due_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->has('start_date') || $validator->errors()->has('due_date')) {
                return;
            }

            /** @var Project|null $project */
            $project = $this->route('project');

            $startDate = $this->has('start_date')
                ? $this->input('start_date')
                : ($this->exists('start_date') ? null : $project?->start_date?->format('Y-m-d'));

            $dueDate = $this->has('due_date')
                ? $this->input('due_date')
                : ($this->exists('due_date') ? null : $project?->due_date?->format('Y-m-d'));

            if (! empty($startDate) && ! empty($dueDate) && $dueDate < $startDate) {
                $validator->errors()->add('due_date', 'Due Date cannot be earlier than Start Date.');
            }
        });
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'client_name.required' => 'Client Name is required.',
            'project_name.required' => 'Project Name is required.',
            'status.required' => 'Status is required.',
            'priority.required' => 'Priority is required.',
            'due_date.after_or_equal' => 'Due Date cannot be earlier than Start Date.',
        ];
    }
}
