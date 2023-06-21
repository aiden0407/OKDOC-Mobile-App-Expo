//React
import { useState, useContext, useRef } from 'react';
import { ApiContext } from 'context/ApiContext';
import { AppContext } from 'context/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styled from 'styled-components/native';

//Components
import { COLOR, TYPOGRAPHY } from 'constants/design'
import { Alert, ActivityIndicator } from 'react-native';
import { SafeArea, Container, Row } from 'components/Layout';
import { Text } from 'components/Text';
import { SolidButton } from 'components/Button';

//Api
import { phoneCheckOpen, phoneCheckClose, createFamilyAccount, createPatientProfileInit } from 'api/Login';

export default function EmailPasswordScreen({ navigation }) {

  const { dispatch: apiContextDispatch } = useContext(ApiContext);
  const { state: { registerStatus }, dispatch: appContextDispatch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneToken, setPhoneToken] = useState('');
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [certificationNumber, setCertificationNumber] = useState('');
  const [isPhoneNumberCertificated, setIsPhoneNumberCertificated] = useState(false);

  const handleRequestCertification = async function () {
    setLoading(true);
    try {
      //const phoneCheckOpenResponse = await phoneCheckOpen(phoneNumber);
      //setPhoneToken(phoneCheckOpenResponse.data.response.message)
      setIsMessageSent(true);
      setLoading(false);
      Alert.alert('해당 전화 번호로\n인증번호가 전송되었습니다.');
    } catch (error) {
      setLoading(false);
      Alert.alert('인증번호 발송을 실패하였습니다.');
    }
  }

  const handleCheckCertificationNumber = async function () {
    setLoading(true);
    try {
      //await phoneCheckClose(phoneNumber, certificationNumber, phoneToken);
      setIsPhoneNumberCertificated(true);
      setLoading(false);
      Alert.alert('인증되었습니다.');
    } catch (error) {
      setLoading(false);
      Alert.alert('인증번호가 일치하지 않습니다.\n다시 입력해주시기 바랍니다.');
    }
  }

  const handleNextScreen = async function () {
    try {
      const createFamilyAccountResponse = await createFamilyAccount(registerStatus.email, registerStatus.password, registerStatus.policy);
      const loginToken = createFamilyAccountResponse.data.response.login_token;
      apiContextDispatch({ 
        type: 'LOGIN', 
        loginToken: loginToken,
        email: registerStatus.email, 
      });
      try {
        const accountData = {
          loginToken: loginToken,
          email: registerStatus.email,
        };
        await AsyncStorage.setItem('accountData', JSON.stringify(accountData));
      } catch (error) {
        console.log(error);
      }
      initPatient(loginToken);
    } catch (error) {
      Alert.alert('계정 생성에 실패하였습니다. 다시 시도해 주세요.');
    }
  }

  const initPatient = async function (loginToken) {
    try {
      const createPatientProfileInitResponse = await createPatientProfileInit(loginToken, registerStatus.email, registerStatus.name, formatDate(registerStatus.birth), registerStatus.passportNumber, formatDate(registerStatus.dateOfIssue), formatDate(registerStatus.dateOfExpiry), registerStatus.gender);
      const mainProfile = createPatientProfileInitResponse.data.response;
      apiContextDispatch({
        type: 'PROFILE_UPDATE_MAIN',
        name: mainProfile.passport.USERNAME,
        relationship: mainProfile.relationship,
        birth: mainProfile.passport.BIRTH,
        gender: mainProfile.gender,
        height: mainProfile.height,
        weight: mainProfile.weight,
        drinker: mainProfile.drinker,
        smoker: mainProfile.smoker,
        medicalHistory: mainProfile?.medicalHistory,
        medicalHistoryFamily: mainProfile?.medicalHistoryFamily,
        medication: mainProfile?.medication,
        allergicReaction: mainProfile?.allergicReaction,
        etcConsideration: mainProfile?.etcConsideration,
      });
      appContextDispatch({type: 'REGISTER_COMPLETE'});
      navigation.navigate('RegisterComplete');
    } catch (error) {
      Alert.alert('프로필 정보 생성에 실패하였습니다. 다시 시도해 주세요.');
    }
  }

  return (
    <SafeArea>
      {
        loading && (
          <LoadingBackground>
            <ActivityIndicator size="large" color="#5500CC" />
          </LoadingBackground>
        )
      }
      <Container paddingHorizontal={20}>
        <Container>
          <Text T3 bold marginTop={30}>휴대폰 번호를 입력해주세요</Text>

          <CustomLineInput
            editable={!isMessageSent}
            placeholder="01012345678"
            inputMode="numeric"
            maxLength={11}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            returnKeyType="next"
            onSubmitEditing={() => {
              if (phoneNumber?.length === 11) {
                handleRequestCertification();
              }
            }}
          />
          {
            !isPhoneNumberCertificated &&
            <CustomOutlineButtonBackground
              disabled={phoneNumber?.length !== 11}
              onPress={() => handleRequestCertification()}
              underlayColor={COLOR.SUB4}
              style={{ position: 'absolute', right: 6, top: 72, zIndex: 1 }}
            >
              <Text T7 medium color={phoneNumber?.length === 11 ? COLOR.MAIN : COLOR.GRAY1}>{isMessageSent ? '재전송' : '인증요청'}</Text>
            </CustomOutlineButtonBackground>
          }
          {
            isMessageSent && !isPhoneNumberCertificated &&
            (<>
              <CustomLineInput
                placeholder="인증번호 6자리"
                inputMode="numeric"
                maxLength={6}
                value={certificationNumber}
                onChangeText={setCertificationNumber}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (certificationNumber?.length === 6) {
                    handleCheckCertificationNumber();
                  }
                }}
              />
              <CustomOutlineButtonBackground
                disabled={certificationNumber?.length < 6}
                onPress={() => handleCheckCertificationNumber()}
                underlayColor={COLOR.SUB4}
                style={{ position: 'absolute', right: 6, top: 129, zIndex: 1 }}
              >
                <Text T7 medium color={certificationNumber?.length < 6 ? COLOR.GRAY2 : COLOR.MAIN}>인증확인</Text>
              </CustomOutlineButtonBackground>
            </>)
          }
        </Container>

        <SolidButton
          text="다음"
          marginBottom={20}
          disabled={!isPhoneNumberCertificated}
          action={() => handleNextScreen()}
        />
      </Container>
    </SafeArea>
  );
}

const LoadingBackground = styled.Pressable`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CustomLineInput = styled.TextInput`
  margin-top: 24px;
  width: 100%;
  padding: 0 0 12px 8px;
  border-bottom-width: 1.5px;
  border-color: ${(props) => props.editable === false ? COLOR.MAIN : COLOR.GRAY3};
  font-family: 'Pretendard-Regular';
  font-size: ${TYPOGRAPHY.T5.SIZE};
  color: ${(props) => props.editable === false ? COLOR.GRAY0 : '#000000'};
`;

const CustomOutlineButtonBackground = styled.TouchableHighlight`
  width: 72px;
  height: 36px;
  border-width: 1px;
  border-radius: 5px;
  border-color: ${(props) => props.disabled ? COLOR.GRAY3 : COLOR.MAIN};
  background-color: #FFFFFF;
  align-items: center;
  justify-content: center;
`;