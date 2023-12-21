//React
import { useState, useEffect, useContext } from 'react';
import { ApiContext } from 'context/ApiContext';
import { AppContext } from 'context/AppContext';
import useTestAccount from 'hook/useTestAccount';
import styled from 'styled-components/native';
import { getCalendars } from 'expo-localization';
// import * as Clipboard from 'expo-clipboard';

//Components
import { COLOR } from 'constants/design';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import { SafeArea, ContainerCenter, Container, ScrollView, Box, DividingLine } from 'components/Layout';
import { Text } from 'components/Text';
import { Image } from 'components/Image';

//Api
import { getDoctorsByDepartment, getScheduleByDoctorId } from 'api/Home';

//Assets
import exclamationIcon from 'assets/icons/circle-exclamation.png';

export default function ReservationScreen({ navigation, route }) {

  const { state: { accountData, bookableData }, dispatch: apiContextDispatch } = useContext(ApiContext);
  const { state: { telemedicineReservationStatus }, dispatch: appContextDispatch } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [dateIndex, setDateIndex] = useState(0);
  const [timeIndex, setTimeIndex] = useState(0);
  const [deviceCalendar, setDeviceCalendar] = useState();
  const [doctorList, setDoctorList] = useState();

  useEffect(() => {
    const calendar = getCalendars()[0];
    setDeviceCalendar(calendar);
    initScheduleData()
  }, []);

  const initScheduleData = async function () {
    try {
      const departmentsList = telemedicineReservationStatus.department;
      let doctorsList = [];
      let doctorsScheduleList = [];

      for (let ii = 0; ii < departmentsList.length; ii++) {
        const response = await getDoctorsByDepartment(departmentsList[ii]);
        doctorsList = doctorsList.concat(response.data.response);
      }

      // hospital_name이 오케이닥인 의사는 테스트 계정에만 노출됨
      if (!useTestAccount(accountData.email)) {
        doctorsList = doctorsList.filter(obj => obj.hospital_name !== '오케이닥');
        doctorsList = doctorsList.filter(obj => obj.self_introduction_title !== 'da4202bc-a4f8-46a5-b7be-afa9d9e1cfe6');
      }

      setDoctorList(doctorsList);

      // 각 의사마다 중복 생성되어있는 스케줄 디스플레이간 유일성 보장
      for (const item of doctorsList) {
        const uniqueOpenAt = new Set();
        const uniqueSchedules = [];

        if (item?.schedules) {
          for (const schedule of item.schedules) {
            const { open_at } = schedule;
            if (!uniqueOpenAt.has(open_at)) {
              uniqueSchedules.push(schedule);
              uniqueOpenAt.add(open_at);
            }
          }
          item.schedules = uniqueSchedules;
        }
      }

      // await Clipboard.setStringAsync(JSON.stringify(doctorsList));

      for (let jj = 0; jj < doctorsList.length; jj++) {
        try {
          const response = await getScheduleByDoctorId(doctorsList[jj].id);
          const appointmentsList = response.data.response;
          // 3주 이후의 스케줄 제거
          const threeWeeksAfter = new Date();
          threeWeeksAfter.setDate(threeWeeksAfter.getDate() + 21);
          const updatedSchedule = doctorsList[jj].schedules.filter(item => new Date(item.open_at) < threeWeeksAfter);
          // 이미 예약이 잡힌 스케줄 제거
          doctorsList[jj].schedules = updatedSchedule.filter((slot) => {
            return !appointmentsList.some((appt) => (new Date(appt.hospital_treatment_room.start_time).getTime() === new Date(slot.open_at).getTime()));
          });
        } catch (error) {
          // console.log(error.data);
        }
      }

      doctorsList.forEach((doctor) => {
        doctor.schedules.forEach((schedule) => {

          const wishTime = new Date(schedule.open_at).getTime();
          const currentTime = Date.now();
          if (useTestAccount(accountData.email)) {
            if (wishTime - currentTime < 2 * 60 * 1000) {
              return null;
            }
          } else {
            if (wishTime - currentTime < 20 * 60 * 1000) {
              return null;
            }
          }

          const date = new Date(schedule.open_at);
          const day = date.toLocaleDateString('ko-KR');
          const weekday = date.toLocaleDateString('ko-KR', { weekday: 'long' }).slice(-3);
          let time = date.toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' });
          if (time.startsWith('24:')) {
            time = time.replace('24:', '00:');
          }

          const existingEntry = doctorsScheduleList.find((entry) => entry[0] === day);
          if (existingEntry) {
            const existingTimeSlot = existingEntry[2].find((slot) => slot[0] === time);
            if (existingTimeSlot) {
              existingTimeSlot[1].push({
                doctorId: doctor.id,
                name: doctor.name,
                image: doctor?.attachments?.[0]?.Location ?? doctor?.photo,
                hospital: doctor?.hospital_name,
                subject: doctor?.department_name,
                strength: doctor?.strengths,
                field: doctor?.fields,
                selfIntrodectionTitle: doctor?.self_introduction_title,
                selfIntrodectionDetale: doctor?.self_introduction,
                scheduleId: schedule.id,
                scheduleTime: schedule.open_at,
              });
            } else {
              existingEntry[2].push([time, [{
                doctorId: doctor.id,
                name: doctor.name,
                image: doctor?.attachments?.[0]?.Location ?? doctor?.photo,
                hospital: doctor?.hospital_name,
                subject: doctor?.department_name,
                strength: doctor?.strengths,
                field: doctor?.fields,
                selfIntrodectionTitle: doctor?.self_introduction_title,
                selfIntrodectionDetale: doctor?.self_introduction,
                scheduleId: schedule.id,
                scheduleTime: schedule.open_at,
              }]]);
            }
          } else {
            doctorsScheduleList.push([day, weekday, [[time, [{
              doctorId: doctor.id,
              name: doctor.name,
              image: doctor?.attachments?.[0]?.Location ?? doctor?.photo,
              hospital: doctor?.hospital_name,
              subject: doctor?.department_name,
              strength: doctor?.strengths,
              field: doctor?.fields,
              selfIntrodectionTitle: doctor?.self_introduction_title,
              selfIntrodectionDetale: doctor?.self_introduction,
              scheduleId: schedule.id,
              scheduleTime: schedule.open_at,
            }]]]]);
          }
        });
      });

      function parseCustomDateFormat(str) {
        const parts = str.split('.').map(part => parseInt(part.trim(), 10));
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }

      function convertToSlashFormat(str) {
        const parts = str.split('.').map(part => part.trim());
        return `${parts[1]}/${parts[2]}`;
      }

      doctorsScheduleList.sort((a, b) => {
        const dateA = parseCustomDateFormat(a[0]);
        const dateB = parseCustomDateFormat(b[0]);
        return dateA - dateB;
      });

      for (let ii = 0; ii < doctorsScheduleList.length; ii++) {
        const daySchedule = doctorsScheduleList[ii][2];
        daySchedule.sort((a, b) => {
          const timeA = parseInt(a[0].replace(':', ''));
          const timeB = parseInt(b[0].replace(':', ''));
          return timeA - timeB;
        });

        doctorsScheduleList[ii][0] = convertToSlashFormat(doctorsScheduleList[ii][0]);
      }

      apiContextDispatch({
        type: 'BOOKABLE_DATA_UPDATE',
        bookableData: doctorsScheduleList,
      });

      setIsLoading(false);

    } catch (error) {
      if (error.data.statusCode === 404) {
        // 해당 진료과 소속 의사가 존재하지 않는 경우
        setIsLoading(false);
      } else {
        Alert.alert('네트워크 오류로 인해 정보를 불러오지 못했습니다.');
      }
    }
  }

  function handleSelectDoctor(date, time, doctorInfo) {
    appContextDispatch({
      type: 'TELEMEDICINE_RESERVATION_DOCTOR',
      date: date,
      time: time,
      doctorInfo: doctorInfo,
    });
    navigation.navigate('DoctorProfile');
  }

  function handleInquireDoctor(doctorInfo) {
    navigation.navigate('DoctorProfileInquiry', { doctorInfo: doctorInfo });
  }

  function convertToHashtags(dataArray) {
    const hashtags = dataArray.map(tag => `#${tag}`).join(' ');
    return hashtags;
  }

  if (isLoading) {
    return (
      <SafeArea>
        <ContainerCenter>
          <ActivityIndicator size="large" color="#5500CC" />
        </ContainerCenter>
      </SafeArea>
    )
  }

  return (
    <SafeArea>
      <Container>
        {
          bookableData.length
            ? <ScrollView showsVerticalScrollIndicator={false}>

              <ReservationContainer>
                <Text T3 bold marginTop={30}>상담시간을 선택해주세요</Text>
                {deviceCalendar?.timeZone && <Text T7 medium color={COLOR.GRAY1}>({deviceCalendar?.timeZone} 시간대 기준)</Text>}

                <Text T6 medium marginTop={24}>날짜선택</Text>
                <DateContainer>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {bookableData.map((item, index) =>
                      <DateButton
                        key={`date${index}`}
                        isSelected={dateIndex === index}
                        onPress={() => {
                          if (dateIndex !== index) {
                            setDateIndex(index);
                            setTimeIndex(0);
                          }
                        }}
                        underlayColor={dateIndex !== index && COLOR.GRAY5}
                      >
                        <>
                          <Text T5 bold color={dateIndex === index ? COLOR.MAIN : COLOR.GRAY1}>{item[0]}</Text>
                          <Text T7 color={dateIndex === index ? COLOR.MAIN : COLOR.GRAY2}>{item[1]}</Text>
                        </>
                      </DateButton>
                    )}
                  </ScrollView>
                </DateContainer>

                <Text T6 medium marginTop={24}>시간선택</Text>
                <TimeContainer>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {bookableData[dateIndex]?.[2]?.map((item, index) =>
                      <TimeButton
                        key={`time${index}`}
                        isSelected={timeIndex === index}
                        onPress={() => setTimeIndex(index)}
                        underlayColor={timeIndex !== index && COLOR.GRAY5}
                      >
                        <Text T6 bold color={timeIndex === index ? COLOR.MAIN : COLOR.GRAY1}>{item[0]}</Text>
                      </TimeButton>
                    )}
                  </ScrollView>
                </TimeContainer>
              </ReservationContainer>

              <DividingLine marginTop={42} />

              <DoctorContainer>
                <Text T6 medium>상담 가능 의사 선택</Text>
                {bookableData[dateIndex]?.[2]?.[timeIndex]?.[1]?.map((item, index) =>
                  <DoctorRow
                    key={`doctor${index}`}
                    onPress={() => handleSelectDoctor(bookableData[dateIndex][0], bookableData[dateIndex][2][timeIndex][0], item)}
                  >
                    <Image source={{ uri: item.image }} width={66} height={66} circle />
                    <DoctorColumn>
                      <Text T4 bold>{item.name} 교수</Text>
                      <Text T7 medium color={COLOR.GRAY1}>{item.hospital} / {item.subject}</Text>
                      <StyledText T7 color={COLOR.GRAY1} numberOfLines={1} ellipsizeMode="tail">{convertToHashtags(item.strength)}</StyledText>
                    </DoctorColumn>
                    <Ionicons name="chevron-forward" size={24} color={COLOR.MAIN} />
                  </DoctorRow>
                )}
              </DoctorContainer>

              <DividingLine marginTop={42} />

              <DoctorContainer>
                <Text T6 medium>예약 문의</Text>
                {doctorList?.map((item, index) =>
                  <DoctorRow
                    key={`doctor${index}`}
                    onPress={() => handleInquireDoctor(item)}
                  >
                    <Image source={{ uri: item?.attachments?.[0]?.Location ?? item?.photo }} width={66} height={66} circle />
                    <DoctorColumn>
                      <Text T4 bold>{item.name} 교수</Text>
                      <Text T7 medium color={COLOR.GRAY1}>{item.hospital_name} / {item.department_name}</Text>
                      <StyledText T7 color={COLOR.GRAY1} numberOfLines={1} ellipsizeMode="tail">{convertToHashtags(item.strengths)}</StyledText>
                    </DoctorColumn>
                    <Ionicons name="chevron-forward" size={24} color={COLOR.MAIN} />
                  </DoctorRow>
                )}
              </DoctorContainer>

              <Box height={120} />

            </ScrollView>
            : <ScrollView showsVerticalScrollIndicator={false}>

              <ReservationContainer>
                <Text T3 bold marginTop={30}>상담시간을 선택해주세요</Text>
                {deviceCalendar?.timeZone && <Text T7 medium color={COLOR.GRAY1}>({deviceCalendar?.timeZone} 시간대 기준)</Text>}

                <ReservationNoneContainer>
                  <Image source={exclamationIcon} width={60} height={60} />
                  <Text T4 medium center marginTop={18} marginBottom={5}>현재 모든 예약이 마감되었습니다.{'\n'}예약 문의를 진행해주세요.</Text>
                </ReservationNoneContainer>
              </ReservationContainer>

              <DividingLine marginTop={42} />

              <DoctorContainer>
                <Text T6 medium>예약 문의</Text>
                {doctorList?.map((item, index) =>
                  <DoctorRow
                    key={`doctor${index}`}
                    onPress={() => handleInquireDoctor(item)}
                  >
                    <Image source={{ uri: item?.attachments?.[0]?.Location ?? item?.photo }} width={66} height={66} circle />
                    <DoctorColumn>
                      <Text T4 bold>{item.name} 교수</Text>
                      <Text T7 medium color={COLOR.GRAY1}>{item.hospital_name} / {item.department_name}</Text>
                      <StyledText T7 color={COLOR.GRAY1} numberOfLines={1} ellipsizeMode="tail">{convertToHashtags(item.strengths)}</StyledText>
                    </DoctorColumn>
                    <Ionicons name="chevron-forward" size={24} color={COLOR.MAIN} />
                  </DoctorRow>
                )}
              </DoctorContainer>

              <Box height={120} />

            </ScrollView>
          // : <ContainerCenter>
          //   <Image source={exclamationIcon} width={60} height={60} />
          //   <Text T4 bold center marginTop={18} marginBottom={50}>해당 증상 또는 상담과목으로{'\n'}예약 가능한 일정이 존재하지 않습니다</Text>
          // </ContainerCenter>
        }
      </Container>
    </SafeArea>
  );
}

const ReservationContainer = styled.View`
  margin-left: 20px;
`;

const ReservationNoneContainer = styled.View`
  margin-left: -20px;
  margin-top: 45px;
  align-items: center;
  justify-content: center;
`;

const DateContainer = styled.View`
  margin-top: 12px;
  width: 100%;
  height: 80px;
`;

const DateButton = styled.TouchableHighlight`
  margin-right: 8px;
  width: 74px;
  height: 80px;
  border-radius: 5px;
  background-color: ${(props) => props.isSelected ? COLOR.SUB3 : COLOR.GRAY6};
  align-items: center;
  justify-content: center;
`;

const TimeContainer = styled.View`
  margin-top: 12px;
  width: 100%;
  height: 46px;
`;

const TimeButton = styled.TouchableHighlight`
  margin-right: 8px;
  width: 84px;
  height: 46px;
  border-radius: 5px;
  background-color: ${(props) => props.isSelected ? COLOR.SUB3 : COLOR.GRAY6};
  align-items: center;
  justify-content: center;
`;

const DoctorContainer = styled.View`
  margin-top: 42px;
  padding: 0 20px;
`;

const DoctorRow = styled.Pressable`
  margin-top: 24px;
  width: 100%;
  flex-direction: row;
  align-items: center;
`;

const DoctorColumn = styled.View`
  margin-left: 24px;
  flex: 1;
`;

const StyledText = styled(Text)`
  width: 230px;
  margin-top: 12px;
`;