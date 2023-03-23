//React
import { useContext } from 'react';
import { ApiContext } from 'context/ApiContext';
import styled from 'styled-components/native';

//Components
import { Dimensions, Alert } from 'react-native';
import { COLOR } from 'constants/design'
import { Ionicons } from '@expo/vector-icons';
import { SafeArea, Container, Row, DividingLine } from 'components/Layout';
import { Text } from 'components/Text';

export default function AccountSettingScreen({ navigation }) {

  const { state: { accountData }, dispatch } = useContext(ApiContext);
  const windowWidth = Dimensions.get('window').width;

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigation.goBack();
  }

  const createLogoutAlert = () => {
    Alert.alert('', '접속중인 기기에서 로그아웃 하시겠습니까?', [
      {
        text: '취소',
        style: 'cancel',
      },
      { 
        text: '확인',
        onPress: handleLogout
      },
    ]);
  }

  function SettingButton({ title, onPress }) {
    return (
      <SettingButtonRow onPress={onPress}>
        <Text T5 medium>{title}</Text>
        <Ionicons name="chevron-forward" size={20} />
      </SettingButtonRow>
    )
  }

  return (
    <SafeArea>
      <Container>

        <Text T3 bold marginTop={30} marginLeft={20}>등록된 전화번호</Text>
        <Text T6 color={COLOR.GRAY2} marginTop={12} marginLeft={20}>해당 번호는 최초 가입 시 기입된 번호입니다.{'\n'}번호 변경은 고객센터 1:1 문의를 통해 문의해주세요.</Text>
        <Row marginTop={24} paddingHorizontal={20} gap={6}>
          <CountryCallingCodeBox>
            <Text T5 color={COLOR.GRAY0}>{accountData.phoneNumber.split(' ')[0]}</Text>
          </CountryCallingCodeBox>
          <PhoneNumberBox windowWidth={windowWidth}>
            <Text T5 color={COLOR.GRAY0}>{accountData.phoneNumber.split(' ')[1]}</Text>
          </PhoneNumberBox>
        </Row>

        <DividingLine marginVertical={30} />

        <SettingButtonContainer>
          <SettingButton title="비밀번호 변경" onPress={() => console.log('비밀번호 변경')} />
          <SettingButton title="로그아웃" onPress={createLogoutAlert} />
          <SettingButton title="회원탈퇴" onPress={() => console.log('회원탈퇴')} />
        </SettingButtonContainer>

      </Container>
    </SafeArea>
  );
}

const CountryCallingCodeBox = styled.View`
  width: 66px;
  padding: 8px 0 8px 12px;
  background-color: ${COLOR.GRAY6};
  border-radius: 3px;
`;

const PhoneNumberBox = styled.View`
  width: ${(props) => `${props.windowWidth-112}px`};
  padding: 8px 0 8px 12px;
  background-color: ${COLOR.GRAY6};
  border-radius: 3px;
`;

const SettingButtonContainer = styled.View`
  width: 100%;
  padding: 0 20px;
  gap: 24px;
`;

const SettingButtonRow = styled.TouchableOpacity`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;