// HackerNews API wrapper
const apiBaseUrl = 'https://hacker-news.firebaseio.com/v0'
const nowTime = new Date().getTime();
const pagination = 30;

const HackerNews = {
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
        return request(apiBaseUrl + '/item/' + id + '.json')
    }
}

const request = function(url) {
    return fetch(url).then(function(response) {
            return response.json();
        }).then(function(responseJson) {
            return responseJson;
        }).catch(function(error) {
            console.error('Error:', error)
        });
}

/* Can return time difference between now and a give date time object in
 * seconds, minutes, hours, or days. */
const getTimeDifferenceToNow = {
    inSeconds: function(date) {
        const t1 = date.getTime();

        return parseInt(Math.abs(nowTime - t1)/(1000));
    },
    inMinutes: function(date) {
        const t1 = date.getTime();

        return parseInt(Math.abs(nowTime - t1)/(60*1000));
    },
    inHours: function(date) {
        const t1 = date.getTime();

        return parseInt(Math.abs(nowTime - t1) / (60*60*1000));
    },
    inDays: function(date) {
        const t1 = date.getTime();

        return parseInt(Math.abs(nowTime - t1)/(24*3600*1000));
    },
}

/* Returns presentable time since a given date time object */
const getTimeToNow = function(date) {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    let time = getTimeDifferenceToNow.inSeconds(date);
    let show =  " seconds ago";
    if(time == 1) {
        show = " second ago";
    }

    if(time > 60) {
        time = parseInt(Math.abs(time / 60));
        show = " minutes ago";
        if(time == 1) {
            show = " minute ago";
        }

        if(time > 60) {
            time = parseInt(Math.abs(time / 60));
            show = " hours ago";
            if(time == 1) {
                show = " hour ago";
            }

            if(time > 24) {
                time = parseInt(Math.abs(time / 24));
                show = " days ago";
                if(time == 1) {
                    show = " day ago";
                }

                if(time > 40) {
                    time = monthNames[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
                    show = "";
                }
            }
        }
    }

    return time + show;
}

/* Returns an object with the start item number, the end item number, and the
 * next page value. */
const paginate = function(currentPage) {
    let start = 0;
    let end = pagination;

    if(currentPage > 1) {
        let currentLastItem = (currentPage - 1) * pagination;
        start = currentLastItem;
        currentLastItem += pagination;
        end = currentLastItem;
    }

    return {
        start: start,
        end: end,
        nextPage: currentPage + 1,
    };
}

/* Removes all content from the tbody of the given table id */
const cleanBodyOf = function(id) {
    const itemList = document.getElementById(id);
    const itemListBody = itemList.getElementsByTagName('tbody')[0];
    itemListBody.innerHTML = "";
}

/* Toggles the 'Loading...' text */
const toggleLoading = function() {
    let loading = document.getElementById('loading');
    if(loading.style.display !== "none") {
        loading.style.display = "none";
    } else {
        loading.style.display = "block";
    }
}

/* Will return the page number from the URL hash */
const getPageFromUrl = function() {
    if(window.location.hash) {
        return parseInt(window.location.hash.substr(1));
    }
}

/* Fetches and populates the stories for a given page */
const getStoriesForCurrentPage = function(page) {
    const pageFromUrl = getPageFromUrl();
    if(pageFromUrl && page === 1) {
        // Will get the page from the URL hash on refresh of the page or manual
        // page assignation
        getStories(pageFromUrl);
    } else {
        getStories(page);
    }
}

/* Checks if the current page is for a story or not */
const isStoryView = function() {
    if(window.location.href.indexOf("story") > -1) {
        return true;
    }

    return false;
}

/* Checks if the current page is for the newest stories */
const isNewStoriesView = function() {
    if(window.location.href.indexOf("new") > -1) {
        return true;
    }

    return false;
}

/* Returns the story Id from the story view URL hash */
const getStoryIdFromUrl = function() {
    return window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
}

/* Fetches stories ids and page items, then populates the data in the table */
const getStories = function(page) {
    const p = paginate(page);

    let getTypeStories = HackerNews.getTopStories;
    if(isNewStoriesView()) {
        getTypeStories = HackerNews.getNewStories;
    }

    getTypeStories().then(function(storiesIds) {
        let storiesPromises = [];

        storiesIds.slice(p.start, p.end).forEach(function(storyId, position) {
            storiesPromises.push(HackerNews.getItem(storyId).then(function(storyData) {
                return storyData;
            }));
        });

        // Will get all the necessary stories together, sorted
        Promise.all(storiesPromises).then(function(storiesData) {
            populateStories(storiesData, p.start + 1, p.nextPage);
        });
    });
}

/* Fetches a story and its top level comments and populates the data */
const getComments = function(storyId) {
    HackerNews.getItem(storyId).then(function(story) {
        if(story.kids) {
            let commentsPromises = [];

            story.kids.forEach(function(commentId, position) {
                commentsPromises.push(HackerNews.getItem(commentId).then(function(commentData) {
                    return commentData;
                }));
            });

            // Will get all the necessary stories together, sorted
            Promise.all(commentsPromises).then(function(commentsData) {
                populateComments(story, commentsData);
            });
        } else {
            populateComments(story, []);
        }
    });
}

/* Just a spacer row for display purposes */
const createSpacerRow = function() {
    const spacerRow = document.createElement('tr');
    spacerRow.className = "spacerRow";

    return spacerRow;
}

/* Returns the span for the story's origin URL */
const createDomainSpan = function(url) {
    const domain = (new URL(url)).host;
    const domainSpan = document.createElement('span');

    domainSpan.className = "originUrl";
    domainSpan.innerHTML = " (" + domain + ")";

    return domainSpan;
}

/* Creates the comments content for meta row */
const createCommentsLink = function(storyUrl, commentsAmount) {
    let comments = " | " + commentsAmount;
    comments += (commentsAmount > 1 ? " comments" : " comment");

    const commentsLink = document.createElement('a');
    commentsLink.href = storyUrl;
    commentsLink.innerHTML += comments;

    return commentsLink;
}

/* Generates the necessary elements for the stories in the page */
const populateStories = function(data, startPagination, nextPage) {
    const itemList = document.getElementById('itemList');
    const itemListBody = itemList.getElementsByTagName('tbody')[0];

    const spacerRow = createSpacerRow();

    data.forEach(function(storyData, position) {
        const storyUrl = "/story/" + storyData.id;

        /**
         * Main row data
         **/
        const mainRow = document.createElement('tr');
        mainRow.id = storyData.id;
        mainRow.className = "mainRow";

        const mainRowTopColumn = document.createElement('td');
        const mainRowTitleColumn = document.createElement('td');

        // Add the top number to the first column in the table
        const indexSpan = document.createElement('span');
        indexSpan.className = "indexSpan";
        indexSpan.innerHTML = (startPagination + position) + ".";
        mainRowTopColumn.appendChild(indexSpan);

        // Add the title with link to the article or story
        const titleLink = document.createElement('a');
        titleLink.href = storyData.url;
        titleLink.innerHTML = storyData.title;

        const titleSpan = document.createElement('span');
        titleSpan.className = "titleSpan";
        titleSpan.appendChild(titleLink);

        mainRowTitleColumn.appendChild(titleSpan);

        // Add optional origin URL next to the title
        if(storyData.url) {
            const domainSpan = createDomainSpan(storyData.url);
            mainRowTitleColumn.appendChild(domainSpan);
        }

        mainRow.appendChild(mainRowTopColumn);
        mainRow.appendChild(mainRowTitleColumn);

        /**
         * Meta row for the story
         **/
        const metaRow = document.createElement('tr');
        metaRow.className = "metaRow";
        metaRow.innerHTML = "";

        // Empty column under the top number
        const metaRowTopColumn = document.createElement('td');
        metaRow.appendChild(metaRowTopColumn);

        // Meta column under the title
        const metaRowMetaColumn = document.createElement('td');
        metaRowMetaColumn.innerHTML = "";

        // Add points and author to the meta column
        if(storyData.score) {
            const points = storyData.score + " points by " + storyData.by;
            metaRowMetaColumn.innerHTML += points;
        }

        // Add creation time with link to the comments to the meta column
        const date = new Date(storyData.time*1000);
        const time = getTimeToNow(date);
        const timeLink = document.createElement('a');
        timeLink.href = storyUrl;
        timeLink.innerHTML += " " + time;
        metaRowMetaColumn.appendChild(timeLink);

        // Add amount of comments with link to the comments to the meta column
        if(storyData.kids) {
            const commentsLink = createCommentsLink(storyUrl, storyData.kids.length);
            metaRowMetaColumn.appendChild(commentsLink);
        }

        metaRow.appendChild(metaRowMetaColumn);

        /**
         * Append the title, the row with the meda data, and a spacer row to the
         * stories table body
         **/
        itemListBody.appendChild(mainRow);
        itemListBody.appendChild(metaRow);
        itemListBody.appendChild(spacerRow);
    });

    itemListBody.appendChild(spacerRow);

    // Add the More button
    const moreRow = document.createElement('tr');
    const moreRowTopColumn = document.createElement('td');
    moreRow.appendChild(moreRowTopColumn);

    const moreLink = document.createElement('a');
    moreLink.href = "#" + nextPage;
    moreLink.className = "more";
    moreLink.innerHTML = "More";
    moreLink.onclick = function() {
        cleanBodyOf('itemList');

        toggleLoading();

        getStoriesForCurrentPage(nextPage);
    }

    const moreRowTitleColumn = document.createElement('td');
    moreRowTitleColumn.appendChild(moreLink);
    moreRow.appendChild(moreRowTitleColumn);

    itemListBody.appendChild(moreRow);

    // Hide the loading text
    toggleLoading();
}

/* Generates the necessary elements for a story and its comments in the page */
const populateComments = function(story, data) {
    const storyUrl = "/story/" + story.id;

    const item = document.getElementById('item');
    const itemBody = item.getElementsByTagName('tbody')[0];

    const comments = document.getElementById('comments');
    const commentsBody = comments.getElementsByTagName('tbody')[0];

    // Story row
    const storyRow = document.createElement('tr');
    storyRow.id = story.id;
    storyRow.className = "storyRow";

    const storyRowTitleColumn = document.createElement('td');
    const storyMetaRow = document.createElement('tr');
    const storyMetaRowColumn = document.createElement('td');

    const titleSpan = document.createElement('span');
    titleSpan.className = "titleSpan";

    const titleLink = document.createElement('a');
    titleLink.href = story.url;
    titleLink.innerHTML = story.title;

    titleSpan.appendChild(titleLink);
    storyRowTitleColumn.appendChild(titleSpan);

    if(story.url) {
        const domainSpan = createDomainSpan(story.url);
        storyRowTitleColumn.appendChild(domainSpan);
    }

    storyRow.appendChild(storyRowTitleColumn);
    itemBody.appendChild(storyRow);

    // Story meta row
    storyMetaRow.className = "metaRow";
    storyMetaRowColumn.innerHTML = "";

    const date = new Date(story.time*1000);
    const time = getTimeToNow(date);

    if(story.score) {
      const points = story.score + " points by " + story.by;
      storyMetaRowColumn.innerHTML += points;
    }

    const timeLink = document.createElement('a');
    timeLink.href = storyUrl;
    timeLink.innerHTML += " " + time;
    storyMetaRowColumn.appendChild(timeLink);

    if(story.kids) {
        const commentsLink = createCommentsLink(storyUrl, story.kids.length);
        storyMetaRowColumn.appendChild(commentsLink);
    }
    storyMetaRow.appendChild(storyMetaRowColumn);

    toggleLoading();

    itemBody.appendChild(storyRow);
    itemBody.appendChild(storyMetaRow);

    // All comments for the story
    data.forEach(function(commentData, position) {
        if(!commentData.deleted && !commentData.dead) {
            const commentDate = new Date(commentData.time*1000);
            const time = getTimeToNow(commentDate);

            const metaRow = document.createElement('tr');
            const metaColumn = document.createElement('td');
            metaColumn.innerHTML = commentData.by + " " + time;
            metaRow.appendChild(metaColumn);

            const mainRow = document.createElement('tr');
            const mainColumn = document.createElement('td');
            mainRow.id = commentData.id;
            mainRow.className = "commentRow";
            metaRow.className = "metaRow";

            mainColumn.innerHTML = commentData.text;
            mainRow.appendChild(mainColumn);

            commentsBody.appendChild(metaRow);
            commentsBody.appendChild(mainRow);
        }
    });
}

// init()
document.addEventListener("DOMContentLoaded", function(event) {
    if(isStoryView()) {
        const storyId = getStoryIdFromUrl();
        getComments(storyId);
    } else {
        getStoriesForCurrentPage(1);
    }
});
