<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home', ['site' => config('website')]);
})->name('home');
