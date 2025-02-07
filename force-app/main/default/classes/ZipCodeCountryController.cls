public with sharing class ZipCodeCountryController {
    @AuraEnabled(cacheable=true)
    public static Map<String, Object> retrievePlaceInfo(String zipCode, String country) {
        Map<String, Object> result = new Map<String, Object>();
        String baseUrl = 'https://api.zippopotam.us/';
        String apiUrl = baseUrl+country+'/' + zipCode;
        HttpRequest request = new HttpRequest();
        request.setEndpoint(apiUrl);
        request.setMethod('GET');
        
        Http http = new Http();

        HttpResponse response = http.send(request);
        
        if (response.getStatusCode() < 400) {
            return formatKeySet((Map<String, Object>) JSON.deserializeUntyped(response.getBody()));
        } else {
            throw new AuraHandledException('Error'+response);
        }
    }

    //Method to remove spaces in the attributes 
    private static Map<String, Object> formatKeySet(Map<String, Object> mapResult) {

        mapResult.put('countryCode', mapResult.remove('country abbreviation'));
        mapResult.put('zipCode', mapResult.remove('post code'));

        List<Object> places = (List<Object>) mapResult.get('places');

        for (Object place : places) {
            Map<String, Object> p = (Map<String, Object>) place;
            p.put('placeName', p.remove('place name'));
            p.put('stateCode', p.remove('state abbreviation'));
        }
        return mapResult;
    }

    //method to retrieve existing zip code record
    @AuraEnabled
    public static String checkExistingRecord(String zipCode) {
        try {
            Zip_Code__c existingRecord = [
                SELECT Id
                FROM Zip_Code__c
                WHERE Zip_Code__c = :zipCode
                WITH USER_MODE
                LIMIT 1
            ];
            return existingRecord.Id;
        } catch (Exception e) 
        {
            return null;
        }
    }
}