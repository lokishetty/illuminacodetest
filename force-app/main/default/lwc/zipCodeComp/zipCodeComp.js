import { LightningElement, wire,track } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import ZIP_CODE_OBJ from '@salesforce/schema/Zip_Code__c';
import COUNTRY from '@salesforce/schema/Zip_Code__c.Country__c';
import ZIPCODE from '@salesforce/schema/Zip_Code__c.Zip_Code__c';
import NAME_FIELD from '@salesforce/schema/Zip_Code__c.Name';
import PLACE_NAME from '@salesforce/schema/Zip_Code__c.Place_Name__c';
import STATE from '@salesforce/schema/Zip_Code__c.State__c';
import retrievePlaceInfo from '@salesforce/apex/ZipCodeCountryController.retrievePlaceInfo';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import checkExistingRecord from '@salesforce/apex/ZipCodeCountryController.checkExistingRecord';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';

export default class ZipCodeComp extends NavigationMixin(LightningElement) 
{

    picklistOptions = [];
    selectedCountry;
    countryLabel ="Select Country";
    zipCodeLabel = "Enter Zip Code";
    placeLabel = "Get Place Information";
    @track selectPlace = {};
    showModalForUS = false;
    zipCode;
    isResponseRecieved = false;
    response = {};
    placeName;
    longitude;
    state;
    latitude;
    stateCode;
    countryCode;
    nonValidZip = false;
    disableSubmitButton = true;
    countrySelected = false;
    zipId;
    showNonUSLink = false;

    @wire(getObjectInfo, { objectApiName: ZIP_CODE_OBJ })
    objectInfo; 

    //to get state field values on the picklist
    @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: COUNTRY })
    wiredPicklistValues({ error, data }) {
        if (data) {
            this.picklistOptions = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
            console.log('Picklist values:'+this.picklistOptions);
        } else if (error) {
            console.error('Error retrieving picklist values:'+error);
        }
    }

    //On change of country
    handleCountryChange(event) {
        this.selectedCountry = event.detail.value;//US
        console.log
        if(this.selectedCountry != undefined && this.selectedCountry!= null)
        {
            this.countrySelected = true;
        }
        else
        {
            this.countrySelected = false;
        }
        this.enableButton();//validation on button
    }

    handleZipChange(event) 
    {
        this.zipCode = event.target.value;//90210
        const zipPattern = /^[0-9]{4,6}$/;
        let searchZip = this.template.querySelector(".searchZip");
        if(zipPattern.test(this.zipCode))
        {
            this.nonValidZip = true;
            searchZip.setCustomValidity("");
        }else
        {
            this.nonValidZip = false;
            searchZip.setCustomValidity("Please enter valid zip code");  
        }
        this.enableButton();//validation on button
    }

    //validation on button
    enableButton()
    {
        if(this.countrySelected && this.nonValidZip)
        {
            this.disableSubmitButton = false;
        }else
        {
            this.disableSubmitButton = true; 
        }
    }
    //method to retrieve places information 
    getPlaceInfo() 
    {
        console.log(this.zipCode);
        console.log(this.selectedCountry);
        //calling apex method to retireve data
        retrievePlaceInfo({ zipCode: this.zipCode, country : this.selectedCountry })
            .then(result => {
                // handleUSResult(result);
                console.log("result"+result);
                console.log("result"+JSON.stringify(result));
                this.isResponseRecieved = true;
                this.response = JSON.stringify(result);
                if (result.countryCode === 'US') 
                {
                    this.country = result.country;
                    this.placeName = result.places.length > 0 ? result.places[0].placeName: '';
                    this.longitude = result.places.length > 0 ? result.places[0].longitude: '';
                    this.state = result.places.length > 0 ? result.places[0].state: '';
                    this.latitude = result.places.length > 0 ? result.places[0].latitude: '';
                    this.stateCode = result.places.length > 0 ? result.places[0].stateCode: '';
                    this.countryCode = result.countryCode;
                    console.log('placeName'+this.placeName);
                    this.showModalForUS = true;
                }
                else
                {
                    this.handleNonUSResult(result);
                }
            })
            .catch(error => {
                console.log(error);
                this.showToast('Error', error.body.message, 'error');
            });
    }

    //Method to handle Non-US 
    handleNonUSResult(res)
    {
        checkExistingRecord({ zipCode: res.zipCode })
            .then(record => {
                if (record) {
                    // Record exists, perform update
                    const fieldsToUpdate = {
                        Id: record,
                        Country__c: res.countryCode,
                        Zip_Code__c: res.zipCode,
                        Name: res.countryCode+' - '+res.zipCode
                    };
                    const recordToUpdate = { fields: fieldsToUpdate };
                    updateRecord(recordToUpdate)
                        .then(rec =>{
                            this.zipId = rec.id;
                            this.showNonUSLink = true;
                            this.showToast('Success', 'Non-US data stored Successfully', 'success');
                        })
                } 
                else
                {
                    const fields = {};
                    fields[COUNTRY.fieldApiName] = res.countryCode;
                    fields[ZIPCODE.fieldApiName] = res.zipCode;
                    fields[PLACE_NAME.fieldApiName] = res.places[0].placeName;
                    fields[STATE.fieldApiName] = res.places[0].state;
                    fields[NAME_FIELD.fieldApiName] = res.countryCode+' - '+res.zipCode;
                    const recordToCreate = { apiName: ZIP_CODE_OBJ.objectApiName, fields };
                    createRecord(recordToCreate)
                        .then(rec => {
                            this.zipId = rec.id;
                            this.showNonUSLink = true;
                            this.showToast('Success', 'Non-US data stored Successfully', 'success');
                        });
                }
            })
            .catch(error => {
                console.log('error'+JSON.stringify(error));
                this.showToast('Error', 'Error in checkExistingRecord Method', 'error');
            });
    }

    handleModalClose(){
        this.showModalForUS = false;
    }

    navigateToRecord() {
        console.log("navigateToRecord");
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.zipId,
                // objectApiName: ZIP_CODE_OBJ.objectApiName,
                actionName: 'view'
            }
        });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}