var tableFunction = {
    getQuery: function (request) {
        var requestURL = url.parse(request.url);
        return querystring.parse(requestURL.query);
    },
    inquiry: function (request, response) {
        query = getQuery(request);
    }
}


module.exports = tableFunction;