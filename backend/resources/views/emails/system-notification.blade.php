<x-mail::message>
# {{ $title }}

{!! nl2br(e($message)) !!}

@if($actionUrl && $actionText)
<x-mail::button :url="$actionUrl">
{{ $actionText }}
</x-mail::button>
@endif

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
