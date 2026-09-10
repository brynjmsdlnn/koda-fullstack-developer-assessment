<?php

namespace App\Http\Requests\Concerns;

trait NormalizesProjectInput
{
    /**
     * Normalize incoming project attributes before validation.
     */
    protected function normalizeProjectInput(): void
    {
        $merged = [];

        if ($this->exists('clientName') && ! $this->exists('client_name')) {
            $merged['client_name'] = $this->input('clientName');
        }

        if ($this->exists('projectName') && ! $this->exists('project_name')) {
            $merged['project_name'] = $this->input('projectName');
        }

        if ($this->exists('startDate') && ! $this->exists('start_date')) {
            $merged['start_date'] = $this->input('startDate');
        }

        if ($this->exists('dueDate') && ! $this->exists('due_date')) {
            $merged['due_date'] = $this->input('dueDate');
        }

        if (! empty($merged)) {
            $this->merge($merged);
        }
    }
}
