<?php

$app->get('/', function() use($app) {
    return $app['twig']->render('index.html.twig');
});

$app->get('/new', function() use($app) {
    return $app['twig']->render('index.html.twig');
});

$app->get('/story/{id}', function($id) use($app) {
    return $app['twig']->render('story.html.twig', array(
        'id' => $id,
    ));
});
