//API
import axios from 'axios';
import getEnvVars from 'api/environment.js';
const { apiUrl } = getEnvVars();

export const familyLocalLogin = async function (id, password) {

    try {
        let options = {
            url: `${apiUrl}/authentication/sign-in`,
            method: 'POST',
            data: {
                id: id,
                password: password,
            }
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error;
    }
}

export const getRegisterTerms = async function () {

    try {
        let options = {
            url: `${apiUrl}/terms/`,
            method: 'GET',
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error;
    }
}

export const emailCheckOpen = async function (email) {

    try {
        let options = {
            url: `${apiUrl}/authentication/email-check-open`,
            method: 'POST',
            data: {
                email: email,
            }
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error;
    }
}

export const emailCheckClose = async function (email, certificationNumber, emailToken) {

    try {
        let options = {
            url: `${apiUrl}/authentication/email-check-close`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${emailToken}`
            },
            data: {
                email: email,
                verification_number: Number(certificationNumber),
            }
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error;
    }
}

export const createFamilyAccount = async function (email, password, policy) {

    try {
        let options = {
            url: `${apiUrl}/authentication/sign-up`,
            method: 'POST',
            data: {
                id: email,
                password: password,
                agreements: policy
            },
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error;
    }
}

export const checkPassportInformation = async function (name, birth, passportNumber, dateOfIssue, dateOfExpiry) {

    try {
        let options = {
            url: `${apiUrl}/authentication/passport-check`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: {
                user_name: name,
                birth: birth,
                passport_number: passportNumber,
                issue_date: dateOfIssue,
                close_date: dateOfExpiry,
            }
        }
        const response = await axios(options);
        return response;

    } catch (error) {
        throw error;
    }
}

export const createPatientProfileInit = async function (loginToken, familyId, name, birth, passportNumber, dateOfIssue, dateOfExpiry, gender) {

    try {
        let options = {
            url: `${apiUrl}/families/${familyId}/patients/${passportNumber}`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${loginToken}`
            },
            data: {
                USERNAME: name,
                BIRTH: birth,
                PASSPORTNUMBER: passportNumber,
                ISSUEDATE: dateOfIssue,
                CLOSEDATE: dateOfExpiry,
                gender: gender,
                relationship: '본인',
            }
        }
        console.log(options);
        const response = await axios(options);
        console.log(response.data.response);
        return response;

    } catch (error) {
        console.log(error.response.data);
        throw error;
    }
}