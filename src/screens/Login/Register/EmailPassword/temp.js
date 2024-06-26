//React
import { useState, useContext, useRef } from 'react';
import { ApiContext } from 'context/ApiContext';
import { AppContext } from 'context/AppContext';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Components
import * as Device from 'expo-device';
import { COLOR, TYPOGRAPHY } from 'constants/design'
import { Alert, ActivityIndicator } from 'react-native';
import { SafeArea, KeyboardAvoiding, Container } from 'components/Layout';
import { Text } from 'components/Text';
import { SolidButton } from 'components/Button';

//Api
import { emailCheckOpen, emailCheckClose, createLocalAccount } from 'api/Login';

export default function EmailPasswordScreen({ navigation }) {

  const { dispatch: apiContextDispatch } = useContext(ApiContext);
  const { state: { registerStatus }, dispatch: appContextDispatch } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [invitationToken, setInvitationToken] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [certificationNumber, setCertificationNumber] = useState('');
  const [isEmailCertificated, setIsEmailCertificated] = useState(false);
  const [emailToken, setEmailToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const passwordCheckRef = useRef();

  function validateEmail(email) {
    const regExp = /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return regExp.test(email);
  }

  function validatePassword(password) {
    const regExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.?!@#$%^&*+=]).{8,14}$/;
    return regExp.test(password);
  }

  const handleRequestCertification = async function () {
    setLoading(true);
    try {
      const emailCheckOpenResponse = await emailCheckOpen(email);
      setInvitationToken(emailCheckOpenResponse.data.response.message)
      setIsEmailSent(true);
      setLoading(false);
      Alert.alert('해당 이메일 주소로\n인증번호가 전송되었습니다.');
    } catch (error) {
      setLoading(false);
      if (error.response.data.statusCode === 409) {
        Alert.alert('안내', '이미 가입된 이메일입니다. 다른 이메일로 시도해 주시기 바랍니다.');
      } else {
        Alert.alert('인증요청 실패', '네트워크 오류로 인해 인증번호 발송을 실패하였습니다. 다시 시도해 주시기 바랍니다.');
      }
    }
  }

  const handleCheckCertificationNumber = async function () {
    setLoading(true);
    try {
      const response = await emailCheckClose(email, certificationNumber, invitationToken);
      setEmailToken(response.data.response.accessToken);
      setIsEmailCertificated(true);
      setLoading(false);
      Alert.alert('이메일이 인증되었습니다.');
    } catch (error) {
      setLoading(false);
      Alert.alert('인증 실패', '인증번호가 일치하지 않습니다. 다시 입력해 주시기 바랍니다.');
    }
  }

  const handleNextScreen = async function () {
    try {
      const deviceType = await AsyncStorage.getItem('@device_type');
      const deviceToken = await AsyncStorage.getItem('@device_token');
      const response = await createLocalAccount(email, password, registerStatus.policy, deviceType, deviceToken, emailToken);
      const loginToken = response.data.response.accessToken;
      const accountData = {
        loginToken: loginToken,
        email: email,
      };
      await AsyncStorage.setItem('@account_data', JSON.stringify(accountData));
      apiContextDispatch({
        type: 'LOGIN',
        loginToken: loginToken,
        email: email,
      });
      appContextDispatch({ type: 'REGISTER_COMPLETE' });
      navigation.navigate('RegisterComplete');
    } catch (error) {
      Alert.alert('계정 생성에 실패하였습니다. 다시 시도해 주시기 바랍니다.');
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
      <KeyboardAvoiding>
        <Container paddingHorizontal={20}>
          <Container>
            <Text T3 bold marginTop={30}>사용하실 이메일과{'\n'}비밀번호를 입력해주세요</Text>

            <InputContainer>
              <CustomLineInput
                editable={!isEmailSent}
                placeholder="이메일"
                value={email}
                onChangeText={setEmail}
                inputMode="email"
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (!validateEmail(email)) {
                    handleRequestCertification();
                  }
                }}
              />
              {!isEmailCertificated
                && <CustomOutlineButtonBackground
                  disabled={!validateEmail(email)}
                  onPress={() => handleRequestCertification()}
                  underlayColor={COLOR.SUB4}
                  style={{ position: 'absolute', right: 4, top: Device.osName === 'Android' ? 21 : 13, zIndex: 1 }}
                >
                  <Text T7 medium color={validateEmail(email) ? COLOR.MAIN : COLOR.GRAY1}>{isEmailSent ? '재전송' : '인증요청'}</Text>
                </CustomOutlineButtonBackground>
              }
            </InputContainer>

            {isEmailSent && !isEmailCertificated && (<InputContainer>
              <CustomLineInput
                placeholder="인증번호 6자리"
                value={certificationNumber}
                onChangeText={setCertificationNumber}
                inputMode="numeric"
                maxLength={6}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (certificationNumber?.length < 6) {
                    handleCheckCertificationNumber();
                  }
                }}
              />
              <CustomOutlineButtonBackground
                disabled={certificationNumber?.length < 6}
                onPress={() => handleCheckCertificationNumber()}
                underlayColor={COLOR.SUB4}
                style={{ position: 'absolute', right: 4, top: Device.osName === 'Android' ? 22 : 14, zIndex: 1 }}
              >
                <Text T7 medium color={certificationNumber?.length < 6 ? COLOR.GRAY2 : COLOR.MAIN}>인증확인</Text>
              </CustomOutlineButtonBackground>
            </InputContainer>)}

            {isEmailCertificated && (<>
              <InputContainer>
                <CustomLineInput
                  placeholder="비밀번호 입력"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  returnKeyType="next"
                  maxLength={14}
                  onSubmitEditing={() => passwordCheckRef.current.focus()}
                />
                {
                  !password && <Text T8 color={COLOR.GRAY1} style={{ position: 'absolute', top: Device.osName === 'Android' ? 32 : 27, left: 98 }}>(대소문자, 숫자, 특수문자 포함 8자~14자 이내)</Text>
                }
              </InputContainer>
              {
                password && !validatePassword(password) && <Text T8 color='#FF0000CC' marginTop={6}>* 대소문자, 숫자, 특수문자 포함 8자~14자 이내를 충족하지 않습니다</Text>
              }
              <CustomLineInput
                placeholder="비밀번호 확인"
                value={passwordCheck}
                onChangeText={setPasswordCheck}
                secureTextEntry
                returnKeyType="next"
                maxLength={14}
                ref={passwordCheckRef}
                onSubmitEditing={() => {
                  (isEmailCertificated && validatePassword(password) && password === passwordCheck) && handleNextScreen()
                }}
              />
              {
                passwordCheck && password !== passwordCheck && <Text T8 color='#FF0000CC' marginTop={6}>* 비밀번호가 일치하지 않습니다</Text>
              }
            </>)}
          </Container>

          <SolidButton
            text="회원가입"
            mBottom={20}
            disabled={!isEmailCertificated || !validatePassword(password) || password !== passwordCheck}
            action={() => handleNextScreen()}
          />
        </Container>
      </KeyboardAvoiding>
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

const InputContainer = styled.View`
  width: 100%;
  position: relative;
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