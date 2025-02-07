public with sharing class ZipCodeCountryWrapper {
    public class ZipCodeCountryResponse {
        public Content content;
    }
    public class Content {
        public String responseCode;
        public String country;
        public String countryCode;
        public String zipCode;
        public Places places;
    }
    public class Places {
        public String placeName;
        public String stateCode;
        public String state;
        public String longitude;
        public String latitude;
    }
}