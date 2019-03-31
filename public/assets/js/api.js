// HackerNews API wrapper
const apiBaseUrl = 'https://hacker-news.firebaseio.com/v0'

var request = function(url) {
    fetch(url)
        .then(function(response) {
            return response.json();
        })
        .then(function(responseJson) {
            console.log(JSON.stringify(responseJson));
        })
        .catch(error => console.error('Error:', error));
}

var HackerNews = {
    getTopStories: function() {
        return request(apiBaseUrl + '/topstories.json')
    },
    getNewStories: function() {
        return request(apiBaseUrl + '/newstories.json')
    },
    getBestStories: function() {
        return request(apiBaseUrl + '/beststories.json')
    },
    getItem: function(id) {
        return request(apiBaseUrl + '/item/' + id)
    }
}

var populateData = function() {
    var tr = document.createElement('tr');
    document.getElementById('itemList').appendChild(tr);
    document.getElementById('itemList').appendChild(tr);
    document.getElementById('itemList').appendChild(tr);
}

window.onload = populateData();
