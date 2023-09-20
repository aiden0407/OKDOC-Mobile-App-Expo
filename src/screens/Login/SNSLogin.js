//React
import { useEffect, useState } from 'react';
import styled from 'styled-components/native';

//SNS Login
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';

//Components
import { COLOR } from 'constants/design'
import { Alert, StyleSheet } from 'react-native';
import { SafeArea, KeyboardAvoiding, ContainerCenter, Center, Row } from 'components/Layout';
import { Text } from 'components/Text';
import { Image } from 'components/Image';

//Assets
import mainLogo from 'assets/main/main_logo.png';
import googleLogo from 'assets/icons/google-logo.png';

export default function LoginPage({ navigation }) {

  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [appleUserInfo, setAppleUserInfo] = useState();
  const [googleUserInfo, setGoogleUserInfo] = useState();
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: '73186981279-rf6plirme3crocphitmssnrlb5o1koem.apps.googleusercontent.com',
    androidClientId: '73186981279-get8upmndqvj3l96lpqdk1q8snrdlk8d.apps.googleusercontent.com',
    expoClientId: '73186981279-8a8012fca0dq616i7rff9s7kqfhi61rn.apps.googleusercontent.com'
  });

  console.log(appleUserInfo);
  console.log(googleUserInfo);

  useEffect(() => {
    const checkAvailable = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setAppleAuthAvailable(isAvailable);
    }
    checkAvailable();
  }, []);

  useEffect(() => {
    handleSignInWithGoogle();
  }, [response]);

  async function handleSignInWithGoogle() {
    if(response?.type === "success") {
      await getGoogleUserInfo(response.authentication.accessToken);
    }
  }

  const getGoogleUserInfo = async (token) => {
    if(!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );
      const user = await response.json();
      setGoogleUserInfo(user);
    } catch (error) {
      //
    }
  }

  function handleLocalLogin() {
    navigation.navigate('LocalLogin');
  }

  function handleOpenChannelTalk() {
    navigation.navigate('InquiryStackNavigation', { 
      screen: 'Inquiry',
      params: { headerTitle: '계정 관련 문의' },
    });
  }

  return (
    <SafeArea>
      <KeyboardAvoiding>
        <ContainerCenter paddingHorizontal={20}>
          <Center>
            <Image source={mainLogo} width={182} height={40} />
            <Text T5 medium color={COLOR.MAIN} marginTop={20}>해외에서도 <Text T5 bold color={COLOR.MAIN}>대학병원 전문의</Text>를 만나보세요</Text>
          </Center>

          <GoogleSignInButton onPress={() => promptAsync()}>
            <GoogleIconWrapper>
              <Image source={googleLogo} width={28} height={28} />
            </GoogleIconWrapper>
            <Text T3 color="rgba(0, 0, 0, 0.54)">Sign in with Google</Text>
          </GoogleSignInButton>

          {
            appleAuthAvailable &&
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={5}
              style={styles.button}
              onPress={async () => {
                try {
                  const credential = await AppleAuthentication.signInAsync({
                    requestedScopes: [
                      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                      AppleAuthentication.AppleAuthenticationScope.EMAIL,
                    ],
                  });
                  setAppleUserInfo(credential);
                  // signed in
                } catch (e) {
                  if (e.code === 'ERR_REQUEST_CANCELED') {
                    // handle that the user canceled the sign-in flow
                  } else {
                    // handle other errors
                  }
                }
              }}
            />
          }

          <LocalLoginContainer onPress={() => handleLocalLogin()}>
            <Text T6 medium color={COLOR.GRAY2}>이메일로 로그인</Text>
          </LocalLoginContainer>

          <HelpContainer onPress={() => handleOpenChannelTalk()}>
            <Text T6 medium color={COLOR.GRAY2}>로그인에 문제가 있으신가요?</Text>
          </HelpContainer>

        </ContainerCenter>
      </KeyboardAvoiding>
    </SafeArea>
  );
}

const GoogleSignInButton = styled.TouchableOpacity`
  position: relative;
  margin-top: 30px;
  width: 100%;
  height: 58px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.54);
`;

const GoogleIconWrapper = styled.View`
  margin-right: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 58,
    marginTop: 10
  },
});

const LocalLoginContainer = styled.TouchableOpacity`
  margin-top: 30px;
  margin-bottom: 90px;
  border-bottom-width: 1px;
  border-bottom-color: ${COLOR.GRAY3};
`;

const HelpContainer = styled.TouchableOpacity`
  position: absolute;
  bottom: 20px;
`;