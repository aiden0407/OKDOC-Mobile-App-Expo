//React
import { useState, useEffect, useContext } from 'react';
import { ApiContext } from 'context/ApiContext';
import { AppContext } from 'context/AppContext';
import * as Clipboard from 'expo-clipboard';

//Api
import { getHistoryListByPatientId, getHistoryStatus, getAuditLog, getTreatmentResults } from 'api/History';
import { getTreatmentInformation, getBiddingInformation, getInvoiceInformation, getPurchaseInformation } from 'api/History';

export default function useHistoryUpdate() {

    const { state: { accountData, profileData, productList }, dispatch: apiContextDispatch } = useContext(ApiContext);
    const { dispatch: appContextDispatch } = useContext(AppContext);

    const refresh = () => {
        if (accountData.loginToken && profileData) {
            appContextDispatch({ type: 'HISTORY_DATA_UPDATING' });
            updateHistory();
        }
    };

    const updateHistory = async function () {
        const contextHistorySet = {
            underReservation: [
            ],
            pastHistory: [
            ],
        };
        let needPayment;

        try {
            const response = await getHistoryListByPatientId(profileData?.[0]?.id);
            let puchaseHistory = response.data.response;

            // 비딩 결제건에 대한 구매 목록만 필터링
            puchaseHistory = puchaseHistory.filter(obj => obj.fullDocument?.bidding_id);

            // 진료일시 빠른 순으로 정렬
            puchaseHistory.sort((a, b) => {
                const startTimeA = new Date(a.fullDocument.treatment_appointment.hospital_treatment_room.start_time);
                const startTimeB = new Date(b.fullDocument.treatment_appointment.hospital_treatment_room.start_time);
                if (startTimeA.getTime() === startTimeB.getTime()) {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
                return startTimeB - startTimeA;
            });

            // 각 히스토리의 도큐멘트 조회 후 취소 여부 확인
            for (const obj of puchaseHistory) {
                try {
                    const response = await getHistoryStatus(obj.documentKey._id);
                    const document = response.data.response;
                    if (document[document.length - 1].operationType === 'insert') {
                        obj.STATUS = 'RESERVED';
                    } else {
                        obj.STATUS = 'CANCELED';
                        try {
                            const response = await getAuditLog(accountData.loginToken, obj.fullDocument.id);
                            // 환자의 감사 목록은 환자만 확인 가능
                            obj.CANCELER = 'PATIENT';
                        } catch (error) {
                            // 환자 이외의 주체에 의한 취소
                            const wishAtTime = new Date(obj.fullDocument.treatment_appointment.hospital_treatment_room.start_time);
                            const canceledTime = new Date(document[document.length - 1].createdAt);

                            if (canceledTime < wishAtTime) {
                                obj.CANCELER = 'DOCTOR';
                            } else {
                                obj.CANCELER = 'ADMIN';
                            }
                        }
                    }
                } catch (error) {
                    // console.log(error);
                }
            }

            // 취소되지 않은 히스토리의 소견서 조회
            for (const obj of puchaseHistory) {
                if (obj.STATUS === 'RESERVED') {
                    try {
                        const response = await getTreatmentResults(accountData.loginToken, obj.fullDocument.treatment_appointment.id);
                        const opinion = response.data.response[0];
                        obj.OPINION = opinion;
                        obj.STATUS = 'FINISHED';
                    } catch (error) {

                        // 소견서 제출 안된 케이스 => EXIT 여부 조회로 환자의 진료 확정 확인
                        try {
                            const response = await getTreatmentInformation(accountData.loginToken, obj.fullDocument.treatment_appointment.id);
                            const appointmentData = response.data.response;
                            if (appointmentData.status === 'EXIT') {
                                obj.STATUS = 'FINISHED';
                            } else {
                                const currentTime = new Date();
                                const wishAtTime = new Date(obj.fullDocument.treatment_appointment.hospital_treatment_room.start_time);
                                const remainingTime = wishAtTime - currentTime;
                                const remainingSeconds = Math.floor(remainingTime / 1000);

                                if (remainingSeconds < -600) {
                                    // 진료 후(정상 진료X)
                                    obj.STATUS = 'ABNORMAL_FINISHED';
                                } else if (remainingSeconds < 0) {
                                    // 진료 중
                                    obj.STATUS = 'IN_TREATMENT';
                                } else {
                                    // 진료 전 'RESERVED'
                                }
                            }
                        } catch (error) {
                            // console.log(error);
                        }
                    }
                }
            }

            // 모든 히스토리에 데이터 추가
            for (const obj of puchaseHistory) {
                // 프로덕트 정보 추가?
                obj.productInfo = productList[2];
                obj.id = obj.fullDocument.treatment_appointment.id;
                obj.bidding_id = obj.fullDocument.bidding_id;

                // 비딩 데이터 추가
                try {
                    const response = await getBiddingInformation(accountData.loginToken, obj.bidding_id);
                    const biddingInfo = response.data.response;
                    obj.biddingInfo = biddingInfo;
                    obj.doctorInfo = biddingInfo.doctor;
                    obj.profileInfo = biddingInfo.patient;
                    obj.department = biddingInfo.department;
                    obj.wish_at = biddingInfo.wish_at;
                    obj.explain_symptom = biddingInfo.explain_symptom;
                    obj.attachments = biddingInfo.attachments;
                } catch (error) {
                    // console.log(error);
                }

                // 인보이스 데이터 추가
                try {
                    const response = await getInvoiceInformation(accountData.loginToken, obj.bidding_id);
                    const invoiceInfo = response.data.response?.[0];
                    obj.invoiceInfo = invoiceInfo;

                    const currentTime = new Date();
                    const wishAtTime = new Date(obj.fullDocument.treatment_appointment.hospital_treatment_room.start_time);
                    const remainingTime = wishAtTime - currentTime;
                    const remainingSeconds = Math.floor(remainingTime / 1000);

                    // 인보이스가 생성되어 있을 때 결제 필요 여부 확인, 가장 오래된 인보이스부터 결제 유도
                    if (!(invoiceInfo?.P_TID)) {
                        if (remainingSeconds < -900) {
                            // 15분이 지났어야만 needPayment에 추가
                            needPayment = obj;
                        }
                    }
                    
                    // 환자의 진료확정이 되지 않았으면서 인보이스가 생성되어있는 경우
                    if (obj.STATUS === 'ABNORMAL_FINISHED') {
                        if (remainingSeconds < -900) {
                            // 인보이스가 생성되어 있으면 완료
                            obj.STATUS = 'FINISHED';
                        } else {
                            // 인보이스가 생성되어 있으면 15분까지는 진료중
                            obj.STATUS = 'IN_TREATMENT';
                        }
                    }
                    
                } catch (error) {
                    // 연장이 없었어서 인보이스가 없는 경우
                    // console.log(error);
                }

                // RESERVED인 상태에서 취소를 위한 purchaseId 조회
                if (obj.STATUS === 'RESERVED') {
                    try {
                        const response = await getPurchaseInformation(accountData.loginToken, obj.id);
                        obj.purchaseId = response.data.response[0].id;
                    } catch (error) {
                        // console.log(error);
                    }
                }

                const date = new Date(obj.wish_at);
                const day = date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll(' ', '').slice(0, -1);
                let time = date.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });
                if (time.startsWith('24:')) {
                    time = time.replace('24:', '00:');
                }
                obj.date = day;
                obj.time = time;

                if (obj.STATUS === 'IN_TREATMENT') {
                    contextHistorySet.underReservation.unshift(obj);
                } else if (obj.STATUS === 'RESERVED') {
                    contextHistorySet.underReservation.push(obj);
                } else {
                    contextHistorySet.pastHistory.push(obj);
                }
            }

            apiContextDispatch({
                type: 'HISTORY_DATA_UPDATE',
                historyData: contextHistorySet,
            });
            if(needPayment){
                appContextDispatch({
                    type: 'NEED_PAYMENT_DATA',
                    needPaymentData: needPayment,
                });
            }
            appContextDispatch({ type: 'HISTORY_DATA_UPDATED' });
            // await Clipboard.setStringAsync(JSON.stringify(contextHistorySet));
            // console.log('Updated')

        } catch (error) {
            // console.log(error);
        }
    };

    return { refresh };
}