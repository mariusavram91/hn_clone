# Hacker News Clone

Hacker News Clone built using Silex PHP micro framework + Vanilla Javascript. [See demo](http://hn-clone-2.herokuapp.com/)

Install requirements:
```
$ composer install
```

Run a server locally:
```
$ php -S localhost:8080 -t public
```

## Docker

To build the container use:
```
$ docker build --file docker/Dockerfile -t hn .
```

To run it:
```
$ docker run --rm -p 8080:80 hn
```

## TODO

- [x] Docker
- [ ] Nested comments
- [ ] Other pages
- [ ] Clean up and improve CSS
- [ ] Some refactoring of the 'populate()' functions
