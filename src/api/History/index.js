//API
import axios from 'axios';
import { APIURL } from 'constants/api'

export const getScheduleByPatientId = async function (loginToken, patientId) {
    try {
        let options = {
            url: `${APIURL}/treatment_appointments/?patient_id=${patientId}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${loginToken}`
            }
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error.response;
    }
}

export const getTreatmentInformation = async function (loginToken, appointmentId) {
    try {
        let options = {
            url: `${APIURL}/treatment_appointments/${appointmentId}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${loginToken}`
            },
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error.response;
    }
}

export const modifyTreatmentAppointmentBeforeEnter = async function (loginToken, appointmentId, symptom) {
    try {
        let options = {
            url: `${APIURL}/treatment_appointments/${appointmentId}`,
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${loginToken}`
            },
            data: {
                "explain_symptom": symptom,
            },
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error.response;
    }
}

export const treatmentDelete = async function (loginToken, appointmentId) {
    try {
        let options = {
            url: `${APIURL}/treatment_appointments/${appointmentId}`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${loginToken}`
            },
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error.response;
    }
}

export const treatmentComplete = async function (loginToken, appointmentId) {
    try {
        let options = {
            url: `${APIURL}/treatment_appointments/${appointmentId}`,
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${loginToken}`
            },
            data: {
                "status": "EXIT",
            },
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error.response;
    }
}

export const getInvoiceInformation = async function (loginToken, biddingId) {
    try {
        let options = {
            url: `${APIURL}/invoices/${biddingId}`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${loginToken}`
            }
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error.response;
    }
}