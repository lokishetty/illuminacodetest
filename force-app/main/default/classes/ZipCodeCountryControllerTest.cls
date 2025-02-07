@isTest
private class ZipCodeCountryControllerTest {

    @isTest
    static void testretrieveData() 
    {
        String zipCode = '90210';
        String country = 'us';
        Test.setMock(HttpCalloutMock.class, new ZipCodeControllerMock());

        Test.startTest();
        Map<String, Object> result = ZipCodeCountryController.retrievePlaceInfo(zipCode, country);
        Test.stopTest();

        System.assertEquals('US', result.get('countryCode'),'Expected matching with Actual country code');
        System.assertEquals('90210', result.get('zipCode'), 'Expected matching with Actual Zip code');
    }

    @isTest
    static void testCheckExistingRecord() {
        String zipCode = '90210';
        Zip_Code__c testRecord = new Zip_Code__c(Zip_Code__c = zipCode);
        insert testRecord;
        Test.startTest();
        String existingRecordId = ZipCodeCountryController.checkExistingRecord(zipCode);
        Test.stopTest();
    }
    @isTest
    static void testCheckExistingRecord_2() {
        Test.startTest();
        String existingRecordId = ZipCodeCountryController.checkExistingRecord(null);
        Test.stopTest();
    }
}