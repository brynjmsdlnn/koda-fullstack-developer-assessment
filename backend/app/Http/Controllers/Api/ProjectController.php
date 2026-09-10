<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\IndexProjectRequest;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(IndexProjectRequest $request): AnonymousResourceCollection
    {
        $isAll = filter_var($request->query('all'), FILTER_VALIDATE_BOOLEAN);

        $query = Project::query()
            ->search($request->query('search'))
            ->filterStatus($request->query('status'))
            ->filterPriority($request->query('priority'))
            ->sorted(
                $request->input('sort_by', 'created_at'),
                $request->input('sort_order', 'desc')
            );

        if ($isAll) {
            return ProjectResource::collection($query->get());
        }

        $perPage = (int) $request->input('per_page', 15);

        return ProjectResource::collection($query->paginate($perPage)->withQueryString());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = Project::create($request->validated());

        return (new ProjectResource($project))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Project $project): ProjectResource
    {
        return new ProjectResource($project);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProjectRequest $request, Project $project): ProjectResource
    {
        $project->update($request->validated());

        return new ProjectResource($project->fresh());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): Response
    {
        $project->delete();

        return response()->noContent();
    }
}
