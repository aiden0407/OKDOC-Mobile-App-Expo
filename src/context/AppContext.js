import { createContext, useReducer } from "react";

//initial state
const initialState = {
  isHomeShorcutUsed: false,
  telemedicineReservationStatus: {
    biddingId: undefined,
    product: undefined,
    department: undefined,
    date: undefined,
    time: undefined,
    doctorInfo: undefined,
    profileType: undefined,
    profileInfo: undefined,
    symptom: undefined,
    images: undefined,
  },
  registerStatus: {
    // APPLE_EMAIL_EXISTENT 애플 회원가입 이메일 존재
    // APPLE_EMAIL_UNDEFINED 애플 회원가입 이메일 미존재
    // GOOGLE_REGISTER 구글 회원가입
    // LOCAL_REGISTER 이메일 회원가입
    route: undefined, 
    policy: undefined,
    email: undefined,
    password: undefined,
    invitationToken: undefined,
    name: undefined,
    birth: undefined,
    passportNumber: undefined,
    dateOfIssue: undefined,
    dateOfExpiry: undefined,
    gender: undefined,
    countryCode: undefined,
    phoneNumber: undefined,
  },
  historyDataId: undefined,
};

//create context
const AppContext = createContext({});

//create reducer
const reducer = (state, action) => {
  switch (action.type) {

    case 'USE_SHORTCUT':
      return {
        ...state,
        isHomeShorcutUsed: true,
      };

    case 'DELETE_SHORTCUT':
      return {
        ...state,
        isHomeShorcutUsed: false,
      };

    case 'TELEMEDICINE_RESERVATION_PRODUCT':
      return {
        ...state,
        telemedicineReservationStatus: {
          ...state.telemedicineReservationStatus,
          product: action.product,
        },
      };

    case 'TELEMEDICINE_RESERVATION_DEPARTMENT':
      return {
        ...state,
        telemedicineReservationStatus: {
          ...state.telemedicineReservationStatus,
          department: action.department,
        },
      };

    case 'TELEMEDICINE_RESERVATION_DOCTOR':
      return {
        ...state,
        telemedicineReservationStatus: {
          ...state.telemedicineReservationStatus,
          date: action.date,
          time: action.time,
          doctorInfo: action.doctorInfo,
        },
      };

    case 'TELEMEDICINE_RESERVATION_PROFILE':
      return {
        ...state,
        telemedicineReservationStatus: {
          ...state.telemedicineReservationStatus,
          profileType: action.profileType,
          profileInfo: action.profileInfo,
        },
      };

    case 'TELEMEDICINE_RESERVATION_SYMPTOM':
      return {
        ...state,
        telemedicineReservationStatus: {
          ...state.telemedicineReservationStatus,
          symptom: action.symptom,
          images: action.images,
        },
      };

    case 'TELEMEDICINE_RESERVATION_BIDDING_ID':
      return {
        ...state,
        telemedicineReservationStatus: {
          ...state.telemedicineReservationStatus,
          biddingId: action.biddingId,
        },
      };

    case 'TELEMEDICINE_RESERVATION_CONFIRMED':
      return {
        ...state,
        telemedicineReservationStatus: {
          ...state.telemedicineReservationStatus,
          biddingId: undefined,
          department: undefined,
          date: undefined,
          time: undefined,
          doctorInfo: undefined,
          profileType: undefined,
          profileInfo: undefined,
          symptom: undefined,
        },
      };

    case 'REGISTER_ROUTE':
      return {
        ...state,
        registerStatus: {
          ...state.registerStatus,
          route: action.route,
        },
      };

    case 'REGISTER_POLICY':
      return {
        ...state,
        registerStatus: {
          ...state.registerStatus,
          policy: action.policy,
        },
      };

    case 'REGISTER_EMAIL_PASSWORD_INVITATION_TOKEN':
      return {
        ...state,
        registerStatus: {
          ...state.registerStatus,
          email: action.email,
          password: action.password,
          invitationToken: action.invitationToken,
        },
      };

    case 'REGISTER_PASSPORT_INFORMATION':
      return {
        ...state,
        registerStatus: {
          ...state.registerStatus,
          name: action.name,
          birth: action.birth,
          passportNumber: action.passportNumber,
          dateOfIssue: action.dateOfIssue,
          dateOfExpiry: action.dateOfExpiry,
          gender: action.gender,
        },
      };

    case 'REGISTER_PASSPORT_PHONE_NUMBER':
      return {
        ...state,
        registerStatus: {
          ...state.registerStatus,
          countryCode: action.countryCode,
          phoneNumber: action.phoneNumber,
        },
      };

    case 'REGISTER_COMPLETE':
      return {
        ...state,
        registerStatus: {
          route: undefined,
          policy: undefined,
          email: undefined,
          password: undefined,
          invitationToken: undefined,
          name: undefined,
          birth: undefined,
          passportNumber: undefined,
          dateOfIssue: undefined,
          dateOfExpiry: undefined,
          gender: undefined,
          countryCode: undefined,
          phoneNumber: undefined,
        },
      };

    case 'HISTORY_DATA_ID_ADD':
      return {
        ...state,
        historyDataId: action.historyDataId
      };

    case 'HISTORY_DATA_ID_DELETE':
      return {
        ...state,
        historyDataId: undefined
      };

    default:
      return state;
  }
};

//create Provider component
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  //console.log(`AppContext: ${JSON.stringify(state.historyDataId)}`);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export { AppContext, AppProvider };