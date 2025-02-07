global class ZipCodeControllerMock implements HttpCalloutMock {
    // Implement this interface method
    global HTTPResponse respond(HTTPRequest req) {
        // Optionally, only send a mock response for a specific endpoint
        // and method.
        System.assertEquals('https://api.zippopotam.us/us/90210', req.getEndpoint());
        System.assertEquals('GET', req.getMethod());
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"country":"United States","places":[{"longitude":"-118.4065","state":"California","latitude":"34.0901","placeName":"Beverly Hills","state abbreviation":"CA"}],"country abbreviation":"US","post code":"90210"}');
        res.setStatusCode(200);
        return res;
    }
}