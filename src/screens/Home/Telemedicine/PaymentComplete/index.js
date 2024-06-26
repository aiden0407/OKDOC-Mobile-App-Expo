//React
import { useState, useEffect, useContext } from 'react';
import { ApiContext } from 'context/ApiContext';
import { AppContext } from 'context/AppContext';
import useHistoryUpdate from 'hook/useHistoryUpdate';
import useAlarmUpdate from 'hook/useAlarmUpdate';

//Components
import { COLOR } from 'constants/design';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeArea, Container, Row, DividingLine, PaddingContainer } from 'components/Layout';
import { Text } from 'components/Text';
import { SolidButton } from 'components/Button';

//Api
import { getBiddingInformation, getPaymentInformation } from 'api/Home';

export default function PaymentCompleteScreen({ navigation, route }) {

  const { refresh } = useHistoryUpdate();
  const { refreshAlarm } = useAlarmUpdate();
  const { state: { accountData } } = useContext(ApiContext);
  const { state: { telemedicineReservationStatus }, dispatch } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [biddingData, setBiddingData] = useState();
  const [paymentData, setPaymentData] = useState();
  const biddingId = route.params?.biddingId;

  useEffect(() => {
    initBiddingData()
  }, []);

  const initBiddingData = async function () {
    try {
      const response = await getBiddingInformation(accountData.loginToken, biddingId);
      setBiddingData(response.data.response);
      initPaymentData(response.data.response.P_TID);
    } catch (error) {
      Alert.alert('네트워크 오류로 인해 정보를 불러오지 못했습니다.');
      navigation.goBack();
    }
  }

  const initPaymentData = async function (P_TID) {
    try {
      const response = await getPaymentInformation(P_TID);
      setPaymentData(response.data.response);
      setIsLoading(false);
    } catch (error) {
      // 0원 결제라 결제 정보 없음
      setIsLoading(false);
    }
  }

  function formatDate(inputDate) {
    const year = inputDate.slice(0, 4);
    const month = inputDate.slice(4, 6);
    const day = inputDate.slice(6, 8);
    const hour = inputDate.slice(8, 10);
    const minute = inputDate.slice(10, 12);

    const formattedDate = `${year}.${month}.${day} (${hour}:${minute})`;
    return formattedDate;
  }

  function handleConfirm() {
    dispatch({ type: 'TELEMEDICINE_RESERVATION_CONFIRMED' });
    refresh();
    refreshAlarm();
    navigation.navigate('BottomTapNavigation', { screen: 'History' });
  }

  if (isLoading) {
    return null;
  }

  return (
    <SafeArea>
      <Container>
        <Container>
          {
            paymentData && (<>
              <PaddingContainer>
                <Text T3 bold marginTop={30}>결제가 완료되었어요</Text>
                <Text T3 bold color={COLOR.MAIN} marginTop={9}>의료상담 {Number(paymentData.price)?.toLocaleString()}원</Text>
                <Row marginTop={18}>
                  <Text T6 medium color={COLOR.GRAY1} marginRight={42}>결제 금액</Text>
                  <Text T6 color={COLOR.GRAY1}>{Number(paymentData.price)?.toLocaleString()}원 | 일시불</Text>
                </Row>
                <Row marginTop={6}>
                  <Text T6 medium color={COLOR.GRAY1} marginRight={42}>결제 수단</Text>
                  <Text T6 color={COLOR.GRAY1}>신용카드</Text>
                </Row>
                <Row marginTop={6}>
                  <Text T6 medium color={COLOR.GRAY1} marginRight={42}>결제 일시</Text>
                  <Text T6 color={COLOR.GRAY1}>{formatDate(biddingData?.P_AUTH_DT)}</Text>
                </Row>
              </PaddingContainer>

              <DividingLine marginTop={30} />
            </>)
          }

          <PaddingContainer>
            <Text T3 bold marginTop={30}>예약하신 내역을 확인해주세요</Text>
            <Row align marginTop={15}>
              <Ionicons name="checkmark-sharp" size={18} color={COLOR.MAIN} marginRight={6} />
              <Text T6 medium>{telemedicineReservationStatus?.doctorInfo?.name} 교수 ({telemedicineReservationStatus?.doctorInfo?.hospital})</Text>
            </Row>
            <Row align marginTop={12}>
              <Ionicons name="checkmark-sharp" size={18} color={COLOR.MAIN} marginRight={6} />
              <Text T6 medium>{telemedicineReservationStatus?.doctorInfo?.subject} / 의료상담</Text>
            </Row>
            <Row align marginTop={12}>
              <Ionicons name="checkmark-sharp" size={18} color={COLOR.MAIN} marginRight={6} />
              <Text T6 medium>
                {new Date(biddingData.wish_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replaceAll('. ', '/').slice(0, -1)}&nbsp;
                ({
                  new Date(biddingData.wish_at).toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }).startsWith('24:')
                  ? new Date(biddingData.wish_at).toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace('24:', '00:')
                  : new Date(biddingData.wish_at).toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })
                })
              </Text>
            </Row>
            <Row align marginTop={12}>
              <Ionicons name="checkmark-sharp" size={18} color={COLOR.MAIN} marginRight={6} />
              <Text T6 medium>예약자: {telemedicineReservationStatus?.profileInfo?.name}</Text>
            </Row>
          </PaddingContainer>
        </Container>

        <PaddingContainer>
          <SolidButton
            text="확인"
            mBottom={20}
            action={() => handleConfirm()}
          />
        </PaddingContainer>
      </Container>
    </SafeArea>
  );
}