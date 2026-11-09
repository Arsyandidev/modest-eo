<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="csrf-token" content="{{ csrf_token() }}">
<title>@yield('title', 'modest.id')</title>
<meta name="description" content="@yield('description', 'Agenda fashion show, talkshow, workshop, dan kajian modest.id.')">
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<link href="{{ asset('assets/css/modest.css') }}" rel="stylesheet">
@stack('styles')
</head>
<body data-page="@yield('page')">
<div class="progress-read" id="progress"></div>

@include('layouts.partials.navbar')

@yield('content')

@include('layouts.partials.footer')

@include('layouts.partials.modals')

@include('layouts.partials.js-config')
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="{{ asset('assets/js/data.js') }}"></script>
<script src="{{ asset('assets/js/events-data.js') }}"></script>
<script src="{{ asset('assets/js/events.js') }}"></script>
<script src="{{ asset('assets/js/modest.js') }}"></script>
@stack('scripts')
</body>
</html>
