import { LightningElement, api } from 'lwc';

export default class ModalCmpForUS extends LightningElement {
    @api Country;
    @api countryCode;
    @api placeName;
    @api Longitude;
    @api State;
    @api Latitude;
    @api stateCode;
    @api zipCode;

    //to close the modal
    closeModal() {
        const closeModal = new CustomEvent('closemodal');
        this.dispatchEvent(closeModal);
    }
}