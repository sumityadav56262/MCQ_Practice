<?php

use App\Http\Controllers\McqController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/admin/mcq', [McqController::class, 'showAdmin'])->name('admin.mcq');
Route::post('/admin/mcq', [McqController::class, 'storeMcq'])->name('admin.mcq.store');

Route::get('/', [McqController::class, 'showUser'])->name('user.mcq');
Route::post('/user/mcq/validate', [McqController::class, 'validateAnswer'])->name('user.mcq.validate');

Route::get('/admin/json-input', [McqController::class, 'showJsonInputForm'])->name('admin.jsonInput');
Route::post('/admin/json-input', [McqController::class, 'storeJsonMcq'])->name('admin.jsonInput.store');

Route::get('/mcq/getQuestions', [McqController::class, 'getQuestions'])->name('user.mcq.getQuestions');