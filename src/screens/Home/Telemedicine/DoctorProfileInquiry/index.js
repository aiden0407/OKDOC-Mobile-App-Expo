//React
import { useContext } from 'react';
import { ApiContext } from 'context/ApiContext';
import styled from 'styled-components/native';

//Components
import * as Device from 'expo-device';
import { COLOR } from 'constants/design';
import { Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'
import { SafeArea, ScrollView, Row, DividingLine, Box } from 'components/Layout';
import { Text } from 'components/Text';
import { Image } from 'components/Image';
import { SolidButton } from 'components/Button';

export default function DoctorProfileScreen({ navigation, route }) {

  const { state: { accountData, profileData } } = useContext(ApiContext);
  const doctorInfo = route.params.doctorInfo;

  function handleInquiry() {
    if (accountData.loginToken) {
      if (profileData[0].id) {
        // const inquiryURL = `https://6uar6qa0bjl.typeform.com/to/zHmgevYI#name=${encodeURIComponent(profileData?.[0]?.name)}&email=${accountData.email}&doctor=${encodeURIComponent(doctorInfo.department_name + ' ' + doctorInfo.name)}`;
        const inquiryURL = `https://walla.my/survey/ZHz5Yumm5v3vSD4vFl3F?name=${profileData?.[0]?.name}&email=${accountData.email}&doctor=${doctorInfo.department_name + ' ' + doctorInfo.name}`;
        Linking.openURL(inquiryURL)
      } else {
        // 프로필 등록 (1.1.3 버전 이후로 프로필 없는 계정 존재하지 않게 됨)
        // navigation.navigate('PassportInformation');
      }
    } else {
      navigation.navigate('NeedLoginNavigation', {
        screen: 'NeedLogin',
        params: { headerTitle: '비대면 상담실' },
      });
    }
  }

  function convertToHashtags(dataArray) {
    const hashtags = dataArray.map(tag => `#${tag}`).join(' ');
    return hashtags;
  }

  return (
    <SafeArea>
      <ScrollView showsVerticalScrollIndicator={false} paddingHorizontal={20} paddingTop={0} overScrollMode='never'>
        <Row align marginTop={36}>
          <Image source={{ uri: doctorInfo?.attachments?.[0]?.Location ?? doctorInfo?.photo }} width={66} height={66} circle />
          <DoctorColumn>
            <Text T4 bold>{doctorInfo.name} 교수</Text>
            <Text T7 medium color={COLOR.GRAY1}>{doctorInfo.hospital_name} / {doctorInfo.department_name}</Text>
            <StyledText T7 color={COLOR.GRAY1} >{convertToHashtags(doctorInfo.strengths)}</StyledText>
          </DoctorColumn>
        </Row>

        <DividingLine thin marginTop={24} />

        <Text T4 bold marginTop={24} marginBottom={3}>학력 및 이력</Text>
        {doctorInfo?.fields?.map((item, index) =>
          <Row align marginTop={9} key={`date${index}`}>
            <BulletPoint />
            <Text T6 color={COLOR.GRAY1}>{item}</Text>
          </Row>
        )}

        <DividingLine thin marginTop={24} />

        <Text T4 bold marginTop={36}>{doctorInfo.self_introduction_title}</Text>
        <Text T6 marginTop={18} marginBottom={60}>{doctorInfo.self_introduction}</Text>
        <Box height={100} />
      </ScrollView>

      <LinearGradient
        colors={['rgba(255,255,255,0)', '#FFFFFF', '#FFFFFF', '#FFFFFF']}
        style={{
          width: '100%',
          marginBottom: Device.osName === 'Android' ? 0 : 34,
          padding: 20,
          paddingTop: 70,
          position: 'absolute',
          bottom: 0
        }}
      >
        <SolidButton
          text="예약 문의"
          action={() => handleInquiry()}
        />
      </LinearGradient>
    </SafeArea>
  );
}

const DoctorColumn = styled.View`
  margin-left: 24px;
  flex: 1;
`;

const BulletPoint = styled.View`
  margin-right: 14px;
  width: 4px;
  height: 4px;
  border-radius: 50px;
  background-color: ${COLOR.GRAY3};
`;

const StyledText = styled(Text)`
  width: 230px;
  margin-top: 12px;
`;