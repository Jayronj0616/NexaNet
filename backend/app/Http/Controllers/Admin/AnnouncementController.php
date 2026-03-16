<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index()
    {
        $announcements = Announcement::orderBy('created_at', 'desc')->get();
        return response()->json($announcements);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:info,maintenance,outage,banner,modal,feed',
            'is_published' => 'boolean',
            'expires_at' => 'nullable|date'
        ]);

        if ($validated['is_published'] ?? false) {
            $validated['published_at'] = now();
        }

        $announcement = Announcement::create($validated);
        return response()->json(['message' => 'Announcement created.', 'announcement' => $announcement]);
    }

    public function show($id)
    {
        $announcement = Announcement::findOrFail($id);
        return response()->json($announcement);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:info,maintenance,outage,banner,modal,feed',
            'is_published' => 'boolean',
            'expires_at' => 'nullable|date'
        ]);

        if (isset($validated['is_published']) && $validated['is_published'] && !$announcement->is_published) {
            $validated['published_at'] = now();
        } elseif (isset($validated['is_published']) && !$validated['is_published']) {
            $validated['published_at'] = null;
        }

        $announcement->update($validated);
        return response()->json(['message' => 'Announcement updated.', 'announcement' => $announcement]);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();
        return response()->json(['message' => 'Announcement deleted.']);
    }
}
