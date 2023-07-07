//React
import { useEffect, useContext } from 'react';
import { ApiContext } from 'context/ApiContext';
import { AppContext } from 'context/AppContext';

//Components
import { COLOR } from 'constants/design'
import { Alert } from 'react-native';
import { SafeArea, Container, ContainerCenter, Row } from 'components/Layout';
import { Text } from 'components/Text';
import { Image } from 'components/Image';
import { SolidButton, OutlineButton } from 'components/Button';

//Assets
import checkIcon from 'assets/icons/circle-check.png';

//Api
import { treatmentComplete } from 'api/History';

export default function TelemedicineCompleteScreen({ navigation, route }) {

  const { state: { accountData } } = useContext(ApiContext);
  const { dispatch } = useContext(AppContext);
  const telemedicineData = route.params.telemedicineData;

  useEffect(() => {
    initCompleteTreatment()
  }, []);

  const initCompleteTreatment = async function () {
    try {
      await treatmentComplete(accountData.loginToken, telemedicineData.id);
      dispatch({ type: 'HISTORY_DATA_ID_DELETE' });
    } catch (error) {
      Alert.alert('네트워크 오류로 인해 정보를 불러오지 못했습니다.');
    }
  }

  function handleFeedback() {
    navigation.navigate('InquiryStackNavigation', { 
      screen: 'Inquiry'
    });
  }

  function handleNextScreen() {
    navigation.navigate('HistoryStackNavigation', { 
      screen: 'TelemedicineDetail',
      params: { telemedicineData: telemedicineData }
    });
  }

  return (
    <SafeArea>
      <Container paddingHorizontal={20}>
        <ContainerCenter>

          <Image source={checkIcon} width={70} height={70} />
          <Text T2 bold marginTop={18}>진료가 종료되었습니다</Text>
          <Text T6 center color={COLOR.GRAY1} marginTop={18}>진료 중 좋았던 점이나{'\n'}불편한 점이 있었다면  알려주세요</Text>
          <OutlineButton
            large
            marginTop={24}
            text="진료 후기 남기기"
            action={() => handleFeedback()}
          />

        </ContainerCenter>

        <SolidButton
          text="다음으로"
          marginBottom={20}
          disabled={false}
          action={() => handleNextScreen()}
        />
      </Container>
    </SafeArea>
  );
}