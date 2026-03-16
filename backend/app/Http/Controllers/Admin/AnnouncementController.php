<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(Request $request)
    {
        $query = Announcement::with('author');

        if ($request->type) {
            $query->where('type', $request->type);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'type'         => 'required|in:general,outage,maintenance,promo',
            'is_published' => 'boolean',
            'expires_at'   => 'nullable|date|after:now',
        ]);

        $announcement = Announcement::create([
            'created_by'   => $request->user()->id,
            'title'        => $request->title,
            'content'      => $request->content,
            'type'         => $request->type,
            'is_published' => $request->is_published ?? true,
            'published_at' => $request->is_published ? now() : null,
            'expires_at'   => $request->expires_at,
        ]);

        return response()->json([
            'message'      => 'Announcement created.',
            'announcement' => $announcement->load('author'),
        ], 201);
    }

    public function show(Announcement $announcement)
    {
        return response()->json($announcement->load('author'));
    }

    public function update(Request $request, Announcement $announcement)
    {
        $request->validate([
            'title'        => 'sometimes|string|max:255',
            'content'      => 'sometimes|string',
            'type'         => 'sometimes|in:general,outage,maintenance,promo',
            'is_published' => 'sometimes|boolean',
            'expires_at'   => 'nullable|date',
        ]);

        $announcement->update($request->only([
            'title', 'content', 'type', 'is_published', 'expires_at',
        ]));

        return response()->json([
            'message'      => 'Announcement updated.',
            'announcement' => $announcement->load('author'),
        ]);
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();
        return response()->json(['message' => 'Announcement deleted.']);
    }
}
